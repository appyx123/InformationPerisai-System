export default function TentangLoading() {
  return (
    <div className="min-h-screen bg-[#1b1b1f] text-white pb-14 animate-pulse">
      <section className="pt-16 pb-16 sm:pt-20 sm:pb-20 border-b border-[#FFB22C]/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-4">
          <div className="h-12 sm:h-16 w-64 sm:w-96 rounded-2xl bg-[#FFB22C]/20" />
          <div className="h-5 w-72 sm:w-96 rounded-lg bg-white/10" />
          <div className="h-4 w-full max-w-xl rounded-lg bg-white/5" />
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-36 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        <div className="h-56 w-full rounded-3xl border border-white/10 bg-[#2b2b31]/70" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 rounded-2xl border border-white/10 bg-[#2b2b31]/70" />
          <div className="h-64 rounded-2xl border border-white/10 bg-[#2b2b31]/70" />
        </div>
      </div>
    </div>
  );
}
