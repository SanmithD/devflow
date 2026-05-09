import { ArchiveX } from "lucide-react";

function ArchiveEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {" "}
      <div
        className="
       w-12 h-12 rounded-2xl
       border border-white/10
       bg-white/5
       flex items-center justify-center
     "
      >
        {" "}
        <ArchiveX className="w-5 h-5 text-gray-500" />{" "}
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-300">
        No archived chats
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Archived conversations will appear here.
      </p>
    </div>
  );
}

export default ArchiveEmpty;
