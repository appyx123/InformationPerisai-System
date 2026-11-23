import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visi, Misi, dan Tujuan — UKM PERISAI UMI",
  description:
    "Visi, misi, dan tujuan resmi UKM PERISAI Universitas Muslim Indonesia sebagai pusat pengembangan riset mahasiswa.",
};

const GOLD = "#FFB22C";
const BG = "#17171a";

/* ------------------------------------------------------------------ */
/* Bintang 4-sudut (Sparkle) beranimasi ala dashboard                  */
/* ------------------------------------------------------------------ */
function Sparkle({
  className = "",
  size = 20,
  delay = 0,
  float = false,
}: {
  className?: string;
  size?: number;
  delay?: number;
  float?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 ${className}`}
      style={{
        animation: `${float ? "pr-float 5.5s" : "pr-twinkle 3s"} ease-in-out ${delay}s infinite`,
        filter: `drop-shadow(0 0 7px ${GOLD}99)`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={GOLD}>
        <path d="M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z" />
      </svg>
    </span>
  );
}

export default function VisiMisiPage() {
  const missions = [
    "Mengembangkan budaya ilmiah di lingkungan mahasiswa melalui pembinaan riset, penalaran, dan inovasi.",
    "Menyelenggarakan pelatihan, workshop, dan program pembinaan berkelanjutan untuk meningkatkan kompetensi anggota.",
    "Mendorong mahasiswa aktif berpartisipasi pada kompetisi ilmiah seperti PKM, esai, debat, karya tulis, dan inovasi teknologi.",
    "Memfasilitasi kolaborasi antar departemen dan antar lembaga demi menciptakan karya riset yang produktif dan bermanfaat.",
    "Menjalin kemitraan dengan pihak kampus maupun eksternal untuk memperluas peluang pengembangan inovasi.",
    "Menghadirkan lingkungan organisasi yang profesional, inklusif, dan berlandaskan nilai keislaman.",
  ];

  const goals = [
    "Mencetak mahasiswa yang unggul dalam riset, PKM, dan inovasi teknologi.",
    "Menjadi wadah pembinaan bagi mahasiswa UMI untuk mencapai prestasi ilmiah tingkat regional, nasional, hingga internasional.",
    "Menghasilkan karya riset dan inovasi yang bermanfaat bagi masyarakat, kampus, dan pengembangan keilmuan.",
    "Mewadahi kader-kader inovator untuk mengembangkan potensi akademik dan kreativitas secara maksimal.",
    "Menguatkan reputasi UMI sebagai kampus yang aktif dalam pengembangan riset dan inovasi.",
  ];

  return (
    <div
      className="relative text-white selection:bg-[#FFB22C] selection:text-[#1b1b1f] pb-6 sm:pb-8 overflow-hidden w-full max-w-[100vw]"
      style={{ background: BG }}
    >
      {/* Keyframes Animasi */}
      <style>{`
        @keyframes pr-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes pr-float {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50%      { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes pr-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.05); }
        }
      `}</style>

      {/* Ambient Glow di Latar Belakang (Clipped so it NEVER extends container height) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 h-[460px] w-[860px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(255,178,44,0.18) 0%, transparent 70%)",
            animation: "pr-glow 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[350px] -right-32 h-[400px] w-[400px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(255,200,90,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -left-32 h-[400px] w-[400px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(255,178,44,0.08) 0%, transparent 70%)" }}
        />
      </div>

      {/* ======================================================== */}
      {/* 1. HERO HEADER                                           */}
      {/* ======================================================== */}
      <section className="relative pt-20 pb-10 sm:pt-24 sm:pb-12 text-center">
        <Sparkle className="top-14 left-[18%]" size={22} delay={0.2} float />
        <Sparkle className="top-20 right-[18%]" size={18} delay={1.4} />

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFB22C]/40 bg-[#FFB22C]/10 px-4 py-1 text-xs font-semibold tracking-widest uppercase text-[#FFB22C] mb-4">
            <span>✦</span>
            <span>VISI, MISI & TUJUAN</span>
            <span>✦</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-[#FFB22C]"
            style={{
              textShadow: "0 3px 30px rgba(255, 178, 44, 0.4)",
            }}
          >
            VISI & MISI
          </h1>

          <p className="mt-2 text-base sm:text-xl font-bold uppercase tracking-[0.2em] text-white/90">
            PUSAT PENGEMBANGAN RISET MAHASISWA
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. GRID UTAMA (2 DI KIRI, 1 DI KANAN, TINGGI SEIMBANG)   */}
      {/* ======================================================== */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ---------------------------------------------------- */}
          {/* KOLOM KIRI: VISI + TUJUAN                            */}
          {/* ---------------------------------------------------- */}
          <div className="flex flex-col gap-6 h-full">
            {/* KOTAK KIRI 1: VISI PERISAI UMI */}
            <div className="relative overflow-hidden shrink-0 rounded-3xl border border-[#FFB22C]/30 bg-[#202026]/85 p-6 sm:p-7 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-[#FFB22C]/55">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#FFB22C]/10 blur-3xl"
              />
              <Sparkle className="top-5 right-6" size={16} delay={0.5} />

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB22C]/30 bg-[#FFB22C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FFB22C]">
                <span>✦</span>
                <span>Arah & Cita-Cita</span>
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Visi PERISAI UMI
              </h2>

              <div className="relative overflow-hidden mt-4 rounded-2xl border border-[#FFB22C]/35 bg-gradient-to-br from-[#2b2b34] via-[#222229] to-[#1a1a20] p-4 sm:p-5 shadow-md">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFB22C]/70 to-transparent" />
                <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-100 font-medium italic">
                  &ldquo;Menjadi organisasi mahasiswa yang unggul dalam riset, inovasi, dan pengembangan penalaran ilmiah untuk menciptakan generasi inovator yang kompeten, berintegritas, dan berdaya saing di tingkat nasional maupun internasional.&rdquo;
                </p>
              </div>
            </div>

            {/* KOTAK KIRI 2: TUJUAN */}
            <div className="relative overflow-hidden flex-1 rounded-3xl border border-[#FFB22C]/25 bg-[#202026]/85 p-6 sm:p-7 lg:p-8 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-[#FFB22C]/50 flex flex-col gap-5">
              <Sparkle className="top-5 right-6" size={16} delay={1.6} float />

              <div className="border-b border-white/10 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB22C]/30 bg-[#FFB22C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FFB22C]">
                  <span>✦</span>
                  <span>5 Sasaran Strategis</span>
                </span>
                <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Tujuan Organisasi
                </h2>
              </div>

              <div className="space-y-3">
                {goals.map((goal, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-all duration-200 hover:border-[#FFB22C]/40 hover:bg-[#FFB22C]/[0.06]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFB22C]/15 text-[#FFB22C] font-mono text-xs font-extrabold border border-[#FFB22C]/30 group-hover:bg-[#FFB22C] group-hover:text-[#1b1b1f] transition-colors">
                      0{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm md:text-[15px] text-zinc-200 leading-relaxed pt-0.5">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* KOLOM KANAN: MISI PERISAI UMI                        */}
          {/* ---------------------------------------------------- */}
          <div className="flex flex-col h-full">
            <div className="relative overflow-hidden h-full rounded-3xl border border-[#FFB22C]/25 bg-[#202026]/85 p-6 sm:p-7 lg:p-8 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-[#FFB22C]/50 flex flex-col justify-between gap-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#FFB22C]/10 blur-3xl"
              />
              <Sparkle className="top-6 right-7" size={18} delay={1.1} float />

              <div className="relative z-10 flex flex-col gap-5">
                <div className="border-b border-white/10 pb-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB22C]/30 bg-[#FFB22C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FFB22C]">
                    <span>✦</span>
                    <span>6 Pilar Pergerakan</span>
                  </span>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Misi PERISAI UMI
                  </h2>
                  <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-zinc-400">
                    Langkah strategis dan komitmen nyata untuk mewujudkan budaya riset yang unggul dan berintegritas:
                  </p>
                </div>

                {/* 6 Butir Misi */}
                <div className="space-y-3">
                  {missions.map((mission, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 sm:p-4 transition-all duration-200 hover:border-[#FFB22C]/40 hover:bg-[#FFB22C]/[0.06]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFB22C]/15 text-[#FFB22C] font-mono text-xs font-extrabold border border-[#FFB22C]/30 group-hover:bg-[#FFB22C] group-hover:text-[#1b1b1f] transition-colors">
                        0{idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm md:text-[15px] text-zinc-200 leading-relaxed pt-0.5">
                        {mission}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Ringkas Misi */}
              <div className="relative z-10 overflow-hidden rounded-2xl border border-[#FFB22C]/30 bg-gradient-to-r from-[#2b2b34] via-[#222229] to-[#1a1a20] px-5 py-4 text-center">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFB22C]/60 to-transparent" />
                <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                  <span className="text-[#FFB22C] font-extrabold">6 Misi Terpadu</span> — Membangun ekosistem riset, inovasi, kolaborasi, dan nilai keislaman di UMI.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
