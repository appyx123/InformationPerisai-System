/**
 * auth.ts — Session Management (Edge-safe)
 *
 * Menggunakan cookie-based session dengan opaque token ber-entropi tinggi (32 bytes).
 * Setiap sesi tersimpan dan divalidasi ke tabel `T_Sesi` (model Prisma `tSesi`)
 * yang mencakup pengecekan masa aktif (`expires_at`), verifikasi status akun aktif,
 * serta penghapusan sesi kedaluwarsa.
 *
 * Modul crypto diakses melalui Web Crypto API (globalThis.crypto) yang kompatibel
 * murni dengan Cloudflare Workers Isolate dan Node.js 20+.
 */

import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthUser, Session, PermissionKey } from "@/types";
import prisma from "./db";

export const SESSION_COOKIE_NAME = "perisai_session_id";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 hari

// In-memory cache per-token untuk mencegah round-trip berulang ke Turso DB saat navigasi admin
const sessionMemoryCache = new Map<string, { session: Session; expiry: number }>();
const SESSION_CACHE_TTL_MS = 30 * 1000; // 30 detik

/**
 * Buat sesi baru di tabel T_Sesi dan kembalikan token unik ber-entropi tinggi.
 */
export async function createSessionRecord({
  idAkun,
  ipAddress,
  userAgent,
}: {
  idAkun: number;
  ipAddress?: string;
  userAgent?: string | null;
}): Promise<{ token: string; expiresAt: number }> {
  const tokenBytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const idSesi = globalThis.crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

  await prisma.tSesi.create({
    data: {
      idSesi,
      idAkun,
      token,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Hapus sesi dari database berdasarkan token.
 */
export async function destroySessionRecord(token: string): Promise<void> {
  if (!token) return;
  sessionMemoryCache.delete(token);
  try {
    await prisma.tSesi.deleteMany({
      where: { token },
    });
  } catch (err) {
    console.warn("[auth] Gagal menghapus record T_Sesi:", err);
  }
}

/**
 * Ambil sesi dari cookie request saat ini.
 * Memvalidasi token terhadap tabel `T_Sesi` di database dan memeriksa masa kedaluwarsa.
 * Mengembalikan null jika token tidak ada, kedaluwarsa, atau akun tidak aktif.
 */
export const getSession = cache(async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token || token.trim() === "") {
      return null;
    }

    const nowMs = Date.now();
    const cached = sessionMemoryCache.get(token);
    if (cached && cached.expiry > nowMs) {
      return cached.session;
    }

    const now = Math.floor(nowMs / 1000);

    // Lookup record sesi di T_Sesi dengan eager loading akun & relasinya
    const sessionRecord = await prisma.tSesi.findUnique({
      where: { token },
      include: {
        akun: {
          include: {
            role: true,
            anggota: {
              select: {
                idPerisai: true,
                namaLengkap: true,
                email: true,
                kepengurusan: {
                  where: { status: "aktif" },
                  select: {
                    idDepartemen: true,
                    tier: true,
                    departemen: {
                      select: { idDepartemen: true, slug: true },
                    },
                    jabatan: {
                      select: { namaJabatan: true },
                    },
                  },
                  take: 1,
                  orderBy: { idKepengurusan: "desc" },
                },
              },
            },
          },
        },
      },
    });

    if (!sessionRecord) {
      return null;
    }

    // Validasi masa aktif sesi
    if (sessionRecord.expiresAt <= now) {
      try {
        await prisma.tSesi.delete({ where: { token } });
      } catch {
        // Abaikan jika record telah dihapus oleh worker lain
      }
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionAny = sessionRecord as any;
    const akun = sessionAny.akun;
    if (!akun || !akun.isActive || akun.isActive !== 1 || !akun.anggota) {
      return null;
    }

    const { anggota, role } = akun;
    const cmsRole = mapRoleToCmsRole(role.namaRole);
    const kep = anggota.kepengurusan[0];
    const deptSlug = kep?.departemen?.slug || undefined;
    const deptNum = kep?.departemen?.idDepartemen ?? kep?.idDepartemen ?? null;
    const posTitle = kep?.jabatan?.namaJabatan || undefined;
    const tier = kep?.tier || undefined;

    // Baca permissions dinamis dari tabel M_Role
    let dynamicPermissions: PermissionKey[] = [];
    if (role.permissions) {
      try {
        const parsed = JSON.parse(role.permissions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dynamicPermissions = parsed as PermissionKey[];
        }
      } catch {
        // Abaikan jika parsing gagal
      }
    }

    // Jika permissions dinamis dari basis data ada, prioritaskan; fallback ke komputasi default jabatan
    const { computeDefaultPermissions } = await import("./permissions");
    const permissions =
      dynamicPermissions.length > 0
        ? dynamicPermissions
        : computeDefaultPermissions(cmsRole, posTitle, deptSlug);

    const sessionObj: Session = {
      user: {
        id: anggota.idPerisai,
        name: anggota.namaLengkap,
        email: anggota.email,
        role: cmsRole,
        isActive: Boolean(akun.isActive),
        departmentId: deptSlug,
        departmentNumericId: deptNum,
        positionTitle: posTitle,
        tier,
        permissions,
      },
      expires: new Date(sessionRecord.expiresAt * 1000).toISOString(),
    };

    sessionMemoryCache.set(token, {
      session: sessionObj,
      expiry: nowMs + SESSION_CACHE_TTL_MS,
    });

    return sessionObj;
  } catch (err) {
    console.error("[auth] Error retrieving session:", err);
    return null;
  }
});

/**
 * Map nama role dari database PSDM ke role CMS internal.
 */
export function mapRoleToCmsRole(namaRole: string): AuthUser["role"] {
  switch (namaRole.toUpperCase()) {
    case "SUPER_ADMIN":
      return "SUPER_ADMIN";
    // Pengurus Inti (Ketua Umum, Sekum, Bendum) & Kepala Departemen (Kadep)
    case "ADMIN":
    case "PENGURUS_INTI":
    case "PIMPINAN":
    case "KADEP":
    case "BPH": // fallback kompatibilitas data legacy database lama jika ada
      return "ADMIN";
    default:
      return "EDITOR";
  }
}

// Parameter PBKDF2 yang aman untuk batas CPU 10ms Cloudflare Workers Free Tier (~2ms CPU)
const EDGE_PBKDF2_ITERATIONS = 10_000;
const EDGE_PBKDF2_HASH = "SHA-256";
const EDGE_PBKDF2_BITS = 256;

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function derivePbkdf2Hex(
  password: string,
  saltHex: string,
  iterations: number,
  hashAlg: "SHA-256" | "SHA-512",
  keyLengthBits: number
): Promise<string | null> {
  const saltMatch = saltHex.match(/.{1,2}/g);
  if (!saltMatch) return null;
  const salt = new Uint8Array(saltMatch.map((b) => parseInt(b, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: hashAlg },
    keyMaterial,
    keyLengthBits
  );
  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verifikasi password terhadap hash yang tersimpan.
 *
 * Mendukung format:
 * 1. Versioned Edge PBKDF2 — "pbkdf2$<iters>$<sha256|sha512>$<saltHex>:<keyHex>" (~2ms CPU, aman di Workers Free)
 * 2. Legacy PBKDF2 / scrypt — "<saltHex>:<keyHex>" (backward compatibility akun lama)
 * 3. Legacy SHA-256 hex — 64 karakter hex (seed data awal)
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    if (!storedHash) return false;

    // Format 1: Versioned Edge PBKDF2 ("pbkdf2$10000$sha256$saltHex:keyHex")
    if (storedHash.startsWith("pbkdf2$")) {
      const segs = storedHash.split("$");
      if (segs.length !== 4) return false;
      const iterations = Number(segs[1]);
      const algRaw = segs[2].toUpperCase();
      const hashAlg: "SHA-256" | "SHA-512" = algRaw === "SHA512" || algRaw === "SHA-512" ? "SHA-512" : "SHA-256";
      const [saltHex, expectedKey] = segs[3].split(":");
      if (!Number.isFinite(iterations) || iterations < 1000 || !saltHex || !expectedKey) {
        return false;
      }
      const computedHex = await derivePbkdf2Hex(
        password,
        saltHex,
        iterations,
        hashAlg,
        expectedKey.length * 4
      );
      return computedHex !== null && constantTimeHexEqual(computedHex, expectedKey.toLowerCase());
    }

    // Format 2: Legacy PBKDF2 atau scrypt ("salt:hexKey")
    if (storedHash.includes(":")) {
      const parts = storedHash.split(":");
      if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

      const [saltHex, expectedKey] = parts;

      // 2a. Verifikasi dengan Web Crypto PBKDF2 (100k iterasi format lama)
      try {
        const expectedKeyLengthBits = expectedKey.length * 4;
        const hashAlg = expectedKeyLengthBits > 256 ? "SHA-512" : "SHA-256";
        const computedHexKey = await derivePbkdf2Hex(
          password,
          saltHex,
          100000,
          hashAlg,
          expectedKeyLengthBits
        );
        if (computedHexKey && constantTimeHexEqual(computedHexKey, expectedKey.toLowerCase())) {
          return true;
        }
      } catch (pbkdf2Err) {
        console.warn("[auth] PBKDF2 verify skipped/failed:", pbkdf2Err);
      }

      // 2b. Fallback legacy scrypt HANYA di Node.js (di Cloudflare Workers scryptSync
      // mengonsumsi >35ms CPU & 16MB RAM sehingga melampaui batas Free Tier 10ms -> 500)
      const isWorkers =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (globalThis as any).WebSocketPair !== "undefined" ||
        process.env.NEXT_RUNTIME === "edge";

      if (!isWorkers) {
        try {
          const cryptoMod = await import("node:crypto");
          if (typeof cryptoMod.scryptSync === "function") {
            const keyBuffer = Buffer.from(expectedKey, "hex");
            const derivedKey = cryptoMod.scryptSync(password, saltHex, keyBuffer.length);
            if (cryptoMod.timingSafeEqual(keyBuffer, derivedKey)) {
              return true;
            }
          }
        } catch {
          // Abaikan jika scryptSync tidak tersedia
        }
      }

      return false;
    }

    // Format 3: SHA-256 hex (legacy seed data)
    if (storedHash.length === 64) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await globalThis.crypto.subtle.digest(
        "SHA-256",
        data
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256Hex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return constantTimeHexEqual(sha256Hex, storedHash.toLowerCase());
    }

    return false;
  } catch (err) {
    console.error("[auth] Error verifying password:", err);
    return false;
  }
}

/**
 * Buat hash password aman dalam format versioned Edge PBKDF2 (~2ms CPU).
 * 100% kompatibel dengan Cloudflare Workers Free Tier (limit CPU 10ms) & Node.js 20+.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hexSalt = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hexKey = await derivePbkdf2Hex(
    password,
    hexSalt,
    EDGE_PBKDF2_ITERATIONS,
    EDGE_PBKDF2_HASH,
    EDGE_PBKDF2_BITS
  );
  if (!hexKey) {
    throw new Error("Gagal menghasilkan hash kata sandi");
  }
  return `pbkdf2$${EDGE_PBKDF2_ITERATIONS}$sha256$${hexSalt}:${hexKey}`;
}

/**
 * Cek apakah string hash kata sandi masih menggunakan format legacy SHA-256 (64 hex characters tanpa separator colon).
 */
export function isLegacyPasswordHash(storedHash: string): boolean {
  if (!storedHash || typeof storedHash !== "string") return false;
  return !storedHash.includes(":") && storedHash.trim().length === 64;
}

export { SESSION_COOKIE_NAME as default };


