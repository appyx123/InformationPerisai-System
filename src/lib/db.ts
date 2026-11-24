/**
 * db.ts — Prisma Client Singleton (Edge-safe)
 *
 * Strategi inisialisasi:
 * - PRODUCTION / EDGE (Cloudflare Workers): @prisma/adapter-libsql (pure web, zero native C++)
 *   Turso URL & token dibaca dari environment variables (wrangler secrets).
 * - DEVELOPMENT / LOCAL: Gunakan LibSQL jika TURSO_DATABASE_URL tersedia,
 *   atau better-sqlite3 secara dinamis di dalam blok else (dev only).
 *
 * ⚠️ TIDAK ADA credentials yang di-hardcode di file ini.
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const CF_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");
const perRequestPrisma = new WeakMap<object, PrismaClient>();

function isCloudflareWorkersRuntime(): boolean {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (globalThis as any).WebSocketPair !== "undefined" ||
    process.env.NEXT_RUNTIME === "edge"
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ClientConstructor: any;

function getPrismaClientClass(): any {
  if (ClientConstructor) return ClientConstructor;

  // Cloudflare Workers (workerd) mendefinisikan WebSocketPair di globalThis dan melarang WebAssembly.Module() runtime.
  // Oleh karena itu, di Cloudflare Workers wajib menggunakan @prisma/client/edge (pre-compiled WASM).
  // Di Node.js (test suite, local development, dll.), gunakan @prisma/client standar.
  if (isCloudflareWorkersRuntime()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ClientConstructor = require("@prisma/client/edge").PrismaClient;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ClientConstructor = require("@prisma/client").PrismaClient;
  }

  return ClientConstructor;
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    (process.env.DATABASE_URL?.startsWith("libsql://")
      ? process.env.DATABASE_URL
      : undefined);

  const PrismaClientClass = getPrismaClientClass();

  // Jika di production atau ada URL Turso, gunakan adapter LibSQL Web (Edge-safe)
  if (isProduction || tursoUrl) {
    if (!tursoUrl && isProduction) {
      console.warn(
        "[db] Peringatan: TURSO_DATABASE_URL tidak terdeteksi saat build time. Menggunakan fallback adapter agar proses build tidak terhenti."
      );
    }

    const adapter = new PrismaLibSql({
      url: tursoUrl || "libsql://perisai-dev-psdm.aws-ap-northeast-1.turso.io",
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });

    return new PrismaClientClass({
      adapter,
      log: isProduction ? ["error"] : ["error", "warn"],
    });
  }

  // Development / Local SQLite: dynamic require agar TIDAK di-bundle ke Cloudflare Workers
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const dbPath = (process.env.DATABASE_URL || "file:./psdm-db.db").replace(
      /^file:/,
      ""
    );
    const adapter = new PrismaBetterSqlite3({ url: dbPath });

    return new PrismaClientClass({
      adapter,
      log: ["error", "warn"],
    });
  } catch (error) {
    console.warn(
      "[db] Fallback better-sqlite3 gagal di lingkungan lokal, mencoba LibSQL adapter:",
      error
    );
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL || "file:./psdm-db.db",
    });
    return new PrismaClientClass({ adapter, log: ["error", "warn"] });
  }
}

// Di Cloudflare Workers, JANGAN berbagi 1 PrismaClient/PrismaLibSql lintas request:
// @prisma/adapter-libsql memakai Mutex internal sehingga request yang batal/timeout
// bisa menyebabkan deadlock/cross-request I/O (Cloudflare error 1101).
// Kita isolasi 1 PrismaClient per ExecutionContext (WeakMap) sementara WASM compiler
// tetap di-cache global oleh @prisma/client/edge.
function getDbInstance(): PrismaClient {
  if (isCloudflareWorkersRuntime()) {
    const cfContext = (
      globalThis as unknown as Record<symbol, { ctx?: object } | undefined>
    )[CF_CONTEXT_SYMBOL];
    const reqKey = cfContext?.ctx;
    if (reqKey && typeof reqKey === "object") {
      let reqClient = perRequestPrisma.get(reqKey);
      if (!reqClient) {
        reqClient = createPrismaClient();
        perRequestPrisma.set(reqKey, reqClient);
      }
      return reqClient;
    }
    return createPrismaClient();
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDbInstance();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export default prisma;
