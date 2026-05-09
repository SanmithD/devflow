function ArchiveSkeleton() {
  return (
    <div
      className="
     flex items-center gap-3
     px-3 py-2.5 rounded-xl
     animate-pulse
   "
    >
      {" "}
      <div className="w-4 h-4 rounded bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded bg-white/10 w-3/4" />
        <div className="h-2 rounded bg-white/5 w-1/3" />
      </div>
    </div>
  );
}

export default ArchiveSkeleton;
