import prisma from "@/lib/db";

export async function getDashboardOverview() {
  const now = Math.floor(Date.now() / 1000);
  try {
    const [
      countRows,
      closingSoonOpportunitiesRaw,
      recentPostsRaw,
    ] = await Promise.all([
      // Satu round-trip ke Turso untuk kelima counter (sebelumnya 5 query terpisah)
      prisma.$queryRaw<Array<Record<string, number | bigint>>>`
        SELECT
          (SELECT COUNT(*) FROM T_Berita) AS totalPosts,
          (SELECT COUNT(*) FROM T_Proker) AS totalWorkPrograms,
          (SELECT COUNT(*) FROM T_Kompetisi) AS totalOpportunities,
          (SELECT COUNT(*) FROM M_Anggota) AS totalMembers,
          (SELECT COUNT(*) FROM T_Pesan_Masuk WHERE is_read = 0) AS unreadMessages`,
      prisma.tKompetisi.findMany({
        where: { deadlinePendaftaran: { gte: now } },
        orderBy: { deadlinePendaftaran: "asc" },
        take: 5,
      }),
      prisma.tBerita.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { departemen: { select: { namaDepartemen: true } } },
      }),
    ]);

    const c = countRows[0] ?? {};
    const totalPosts = Number(c.totalPosts ?? 0);
    const totalWorkPrograms = Number(c.totalWorkPrograms ?? 0);
    const totalOpportunities = Number(c.totalOpportunities ?? 0);
    const totalMembers = Number(c.totalMembers ?? 0);
    const unreadMessages = Number(c.unreadMessages ?? 0);

    const closingSoonOpportunities = closingSoonOpportunitiesRaw.map((o) => ({
      id: String(o.idKompetisi),
      title: o.namaKompetisi,
      slug: o.slug,
      organizer: o.penyelenggara,
      category: o.kategori,
      deadlineAt: o.deadlinePendaftaran,
      type: o.tipe,
    }));

    const recentPosts = recentPostsRaw.map((p) => ({
      id: String(p.idBerita),
      title: p.judul,
      slug: p.slug,
      status: p.status,
      createdAt: p.createdAt,
      author: { name: p.departemen?.namaDepartemen || "Pengurus" },
    }));

    return {
      stats: {
        totalPosts,
        totalWorkPrograms,
        totalOpportunities,
        totalMembers,
        unreadMessages,
      },
      closingSoonOpportunities,
      recentPosts,
    };
  } catch (err) {
    console.error("Gagal memuat ringkasan dashboard:", err);
    return {
      stats: {
        totalPosts: 0,
        totalWorkPrograms: 0,
        totalOpportunities: 0,
        totalMembers: 42,
        unreadMessages: 0,
      },
      closingSoonOpportunities: [],
      recentPosts: [],
    };
  }
}
