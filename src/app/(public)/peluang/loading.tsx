export default function PeluangLoading() {
  return (
    <div className="relative min-h-screen bg-[#1b1b1f] text-white animate-pulse">
      {/* Hero Skeleton */}
      <section className="border-b border-white/10 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-4">
          <div className="h-10 sm:h-14 w-72 sm:w-[480px] rounded-2xl bg-white/10" />
          <div className="h-4 w-full max-w-2xl rounded-lg bg-white/5" />
          <div className="h-4 w-3/4 max-w-lg rounded-lg bg-white/5" />
        </div>
      </section>

      {/* Explorer Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-7 w-60 rounded-xl bg-white/10" />
            <div className="h-6 w-20 rounded-full bg-[#FFB22C]/15" />
          </div>
          <div className="h-10 w-full sm:w-72 md:w-80 rounded-xl bg-[#16161a] border border-white/10" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#202026] overflow-hidden"
            >
              <div className="aspect-[16/10] sm:aspect-[16/9] w-full bg-white/[0.06]" />
              <div className="p-3 sm:p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3 w-20 rounded bg-[#FFB22C]/15" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
                <div className="h-4 sm:h-5 w-full rounded bg-white/10" />
                <div className="h-4 sm:h-5 w-3/4 rounded bg-white/10" />
                <div className="h-8 w-full rounded-xl bg-white/5" />
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div className="h-3 w-24 rounded bg-[#FFB22C]/20" />
                  <div className="h-6 w-16 rounded-lg bg-[#FFB22C]/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
