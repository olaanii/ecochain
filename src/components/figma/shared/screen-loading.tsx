export function ScreenLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading screen...</p>
      </div>
    </div>
  );
}
