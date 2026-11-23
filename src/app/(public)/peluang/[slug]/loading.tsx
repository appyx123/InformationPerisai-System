export default function PeluangDetailLoading() {
  return (
    <div className="relative min-h-screen bg-[#1b1b1f] text-white animate-pulse">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-full bg-white/10" />
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-full bg-[#FFB22C]/15" />
            <div className="h-7 w-24 rounded-full bg-white/5" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-44 rounded-full bg-emerald-500/15" />
          <div className="h-9 sm:h-12 w-full rounded-2xl bg-white/10" />
          <div className="h-9 sm:h-12 w-2/3 rounded-2xl bg-white/10" />
          <div className="h-4 w-64 rounded bg-white/5" />
        </div>

        <div className="aspect-[16/9] w-full rounded-3xl border border-white/10 bg-white/[0.06]" />

        <div className="h-28 w-full rounded-3xl border border-[#FFB22C]/25 bg-[#24242a]" />

        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-4 w-11/12 rounded bg-white/5" />
          <div className="h-4 w-5/6 rounded bg-white/5" />
          <div className="h-4 w-3/4 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
