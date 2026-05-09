"use client";

interface DeleteArchiveModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteArchiveModal({
  open,
  loading,
  onClose,
  onConfirm,
}: DeleteArchiveModalProps) {
  if (!open) return null;

  return (
    <div
      className="
     fixed inset-0 z-999
     flex items-center justify-center
   "
    >
      {" "}
      <div
        className="
       absolute inset-0
       bg-black/60 backdrop-blur-sm
       animate-in fade-in duration-200
     "
        onClick={onClose}
      />
      <div
        className="
      relative z-10
      w-full max-w-md
      rounded-2xl
      border border-white/10
      bg-[#141414]
      p-6
      shadow-2xl shadow-black/50
      animate-in zoom-in-95 fade-in duration-200
    "
      >
        <h2 className="text-lg font-semibold text-white">Clear archive?</h2>

        <p className="mt-2 text-sm text-gray-400">
          This will permanently delete all archived chats.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="
          px-4 py-2 rounded-lg
          bg-white/5 hover:bg-white/10
          text-sm text-gray-300
          transition-colors
          cursor-pointer
        "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="
          px-4 py-2 rounded-lg
          bg-red-500 hover:bg-red-400
          disabled:opacity-50
          text-sm text-white
          transition-colors
          cursor-pointer
        "
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteArchiveModal;
