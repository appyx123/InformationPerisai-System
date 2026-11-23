export default function PublicLoading() {
  return (
    <div className="relative min-h-screen bg-[#1b1b1f] text-white animate-pulse">
      {/* Hero Skeleton */}
      <section className="border-b border-white/10 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-4">
          <div className="h-6 w-40 rounded-full bg-[#FFB22C]/15 border border-[#FFB22C]/20" />
          <div className="h-10 sm:h-14 w-3/4 max-w-xl rounded-2xl bg-white/10" />
          <div className="h-4 w-5/6 max-w-lg rounded-lg bg-white/5" />
          <div className="h-4 w-2/3 max-w-md rounded-lg bg-white/5" />
        </div>
      </section>

      {/* Content Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-[#202026] overflow-hidden"
            >
              <div className="aspect-[16/9] w-full bg-white/[0.06]" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-28 rounded bg-[#FFB22C]/15" />
                <div className="h-5 w-full rounded-lg bg-white/10" />
                <div className="h-5 w-4/5 rounded-lg bg-white/10" />
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <div className="h-3 w-24 rounded bg-white/5" />
                  <div className="h-3 w-16 rounded bg-[#FFB22C]/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
