import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  images: {
    // Di Cloudflare Workers tiap /_next/image memakai 1 request Worker (kuota gratis 100rb/hari)
    // dan tidak ada optimizer bawaan. Gambar sudah dikompres saat unggah / berformat webp,
    // jadi disajikan langsung dari R2 CDN & aset statis.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "media.perisai-umi.org",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/about",
        destination: "/tentang",
      },
      {
        source: "/about/:path*",
        destination: "/tentang/:path*",
      },
      {
        source: "/activity",
        destination: "/kabar",
      },
      {
        source: "/activity/:path*",
        destination: "/kabar/:path*",
      },
      {
        source: "/competition",
        destination: "/peluang",
      },
      {
        source: "/competition/:path*",
        destination: "/peluang/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/departemen",
        destination: "/tentang/sumber-daya#departemen",
        permanent: false,
      },
      {
        source: "/program",
        destination: "/tentang/sumber-daya#proker",
        permanent: false,
      },
      {
        source: "/galeri",
        destination: "/tentang/sumber-daya#galeri",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Static assets (images, fonts, icons) -> Immutable cache di browser & Cloudflare CDN
        source: "/:path*\\.(png|webp|jpg|jpeg|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public content pages & homepage: JANGAN cache HTML di edge (menyebabkan version skew: HTML lama merujuk aset _next/static hasil deploy lama yang sudah 404)
        source: "/:path((?:tentang|kabar|peluang).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Admin routes & sensitive APIs: NEVER cache di CDN
        source: "/(admin|api/auth)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
