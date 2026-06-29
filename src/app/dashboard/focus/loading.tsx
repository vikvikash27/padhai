// Skeleton loading UI for the Focus Study Mode page.
// Shown by Next.js automatically while the server component fetches data.
export default function FocusLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Grid overlay — matches FocusMode */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1f_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1f_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

      {/* Top bar skeleton */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-24 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3.5 w-44 rounded bg-zinc-800/70 animate-pulse" />
          </div>
        </div>
        <div className="hidden sm:block h-7 w-28 rounded-xl bg-zinc-800 animate-pulse" />
      </header>

      {/* Main layout skeleton */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-auto">

        {/* LEFT COLUMN */}
        <div className="flex-1 p-6 space-y-6 flex flex-col">

          {/* Timer card skeleton — ~100px tall */}
          <div className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-zinc-800 animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-zinc-800 animate-pulse mx-auto mb-3" />
            {/* Big timer digits */}
            <div className="h-14 w-48 rounded-xl bg-zinc-800 animate-pulse mx-auto" />
            <div className="h-2.5 w-32 rounded bg-zinc-800/70 animate-pulse mx-auto mt-2" />
            {/* Buttons row */}
            <div className="flex justify-center gap-3 mt-5">
              <div className="h-9 w-28 rounded-xl bg-zinc-800 animate-pulse" />
              <div className="h-9 w-9 rounded-xl bg-zinc-800 animate-pulse" />
            </div>
          </div>

          {/* Blueprint / goal card skeleton */}
          <div className="relative bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-4 flex-1 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-zinc-800 animate-pulse" />
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-36 rounded bg-zinc-800 animate-pulse" />
            </div>
            {/* Goal title */}
            <div className="h-5 w-3/4 rounded bg-zinc-800 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-zinc-800/70 animate-pulse" />

            {/* Milestone list skeletons */}
            <div className="space-y-2 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                  <div
                    className="h-3 rounded bg-zinc-800 animate-pulse"
                    style={{ width: `${55 + i * 10}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN skeleton */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-zinc-800/60 p-6 space-y-6 shrink-0">

          {/* Resources card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-zinc-800 animate-pulse" />
              <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-zinc-950/40 rounded-xl">
                <div className="w-4 h-4 rounded bg-zinc-800 animate-pulse shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                  <div className="h-2.5 w-1/2 rounded bg-zinc-800/70 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Notes card */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
            <div className="h-32 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 animate-pulse" />
            <div className="h-8 w-24 rounded-xl bg-zinc-800 animate-pulse" />
          </div>

          {/* Check-in button */}
          <div className="h-12 w-full rounded-xl bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
