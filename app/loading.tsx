export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-t-white border-r-white/50 border-b-white/10 border-l-white/10 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-light uppercase tracking-[0.3em] text-white/30">
          Loading
        </p>
      </div>
    </div>
  );
}
