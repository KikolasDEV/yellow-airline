export const FlightSkeleton = () => (
  <div className="surface-card animate-pulse p-6">
    <div className="mb-8 flex items-center justify-between gap-3">
      <div className="h-10 w-24 rounded-2xl bg-slate-200/60"></div>
      <div className="h-4 w-20 rounded-full bg-slate-200/50"></div>
      <div className="h-10 w-24 rounded-2xl bg-slate-200/60"></div>
    </div>
    
    <div className="space-y-3">
      <div className="h-3 w-28 rounded-full bg-yellow-200/60"></div>
      <div className="h-4 w-2/3 rounded bg-slate-200/60"></div>
      <div className="h-3 w-1/2 rounded bg-slate-200/50"></div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="h-10 w-28 rounded-xl bg-slate-200/60"></div>
        <div className="h-12 w-36 rounded-full bg-yellow-200/60"></div>
      </div>
    </div>
  </div>
);
