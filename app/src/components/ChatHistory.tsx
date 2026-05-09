"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Archive,
  Bookmark,
  Check,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  TrashIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface HistoryItem {
  id: string;
  title?: string;
  name?: string;
  updatedAt?: string;
}

interface HistoryPage {
  messages: HistoryItem[];
  hasMore: boolean;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface ActionMenuProps {
  itemId: string;
  itemTitle: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
}

function ActionMenu({
  itemId,
  itemTitle,
  openId,
  setOpenId,
  renamingId,
  setRenamingId,
}: ActionMenuProps) {
  const isOpen = openId === itemId;
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpenId]);

  // FIX 1: handlers are now properly called (no missing `()`, no wrong method)
  const handleRename = () => {
    setRenamingId(itemId);
    setOpenId(null);
  };

  const handleDelete = async () => {
    setOpenId(null);
    try {
      // FIX 2: DELETE with a body must use `data` config, not a second positional arg
      await axios.delete(`/api/projects/history/${itemId}`);
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (error) {
      console.error("delete error", error);
      toast.error("Failed to delete");
    }
  };

  const handleBookmark = async () => {
    setOpenId(null);
    try {
      // FIX 3: bookmark is likely a POST/PUT, not DELETE — adjust to your API
      await axios.post(`/api/projects/bookmark/${itemId}`,{ id: itemId });
      toast.success("Bookmarked");
    } catch (error) {
      console.error("bookmark error", error);
      toast.error("Failed to bookmark");
    }
  };

  const handleArchive = async () => {
    setOpenId(null);
    try {
      // FIX 4: archive is likely a POST/PUT, not DELETE — adjust to your API
      await axios.post(`/api/projects/archive/${itemId}`, { id: itemId });
      toast.success("Archived");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (error) {
      console.error("archive error", error);
      toast.error("Failed to archive");
    }
  };

  const actions = [
    // FIX 5: onClick values now correctly reference the functions (no `() => handleX` wrapping)
    { icon: Pencil, label: "Rename", onClick: handleRename },
    { icon: Bookmark, label: "Bookmark", onClick: handleBookmark },
    { icon: Archive, label: "Archive", onClick: handleArchive },
    { icon: Share2, label: "Share", onClick: () => setOpenId(null) },
  ];

  return (
    <div
      ref={menuRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpenId(isOpen ? null : itemId)}
        aria-label="More actions"
        aria-expanded={isOpen}
        className={`
          flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150
          text-gray-400 hover:text-gray-100 hover:bg-white/10
          ${isOpen ? "opacity-100 bg-white/10 text-gray-100" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 top-full mt-1 z-50
            w-44 py-1 rounded-xl overflow-hidden
            bg-gray-800 border border-white/10
            shadow-xl shadow-black/40
            animate-in fade-in slide-in-from-top-1 duration-150
          "
        >
          {actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="
                w-full flex items-center gap-2.5 px-3 py-2
                text-sm text-gray-300 hover:text-gray-100 hover:bg-white/10
                transition-colors duration-100 text-left
              "
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              {label}
            </button>
          ))}
          <div className="my-1 border-t border-white/10" />
          {/* FIX 6: was `{setOpenId(null), handleDelete}` — comma operator bug, never called handleDelete */}
          <button
            onClick={handleDelete}
            className="
              w-full flex items-center gap-2.5 px-3 py-2
              text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10
              transition-colors duration-100 text-left
            "
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// NEW: Inline rename input shown directly in the list item
interface RenameInputProps {
  itemId: string;
  currentTitle: string;
  onDone: () => void;
}

function RenameInput({ itemId, currentTitle, onDone }: RenameInputProps) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentTitle) {
      onDone();
      return;
    }
    try {
      await axios.put(`/api/projects/history/${itemId}`, {
        title: trimmed,
        id: itemId,
      });
      toast.success("Renamed");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (error) {
      console.error("rename error", error);
      toast.error("Failed to rename");
    } finally {
      onDone();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onDone();
  };

  return (
    <div
      className="flex items-center gap-1 flex-1 min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
          flex-1 min-w-0 bg-white/10 text-gray-100 text-sm
          rounded-md px-2 py-0.5 outline-none
          border border-white/20 focus:border-white/40
          transition-colors
        "
      />
      <button
        onClick={handleSave}
        className="text-green-400 hover:text-green-300 shrink-0"
        aria-label="Confirm rename"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDone}
        className="text-gray-500 hover:text-gray-300 shrink-0"
        aria-label="Cancel rename"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
      <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded-full w-3/4" />
        <div className="h-2.5 bg-white/6 rounded-full w-1/3" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-gray-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">
          No conversations yet
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          Your chat history will appear here
        </p>
      </div>
    </div>
  );
}

export default function ChatHistory({ isActive }: { isActive: boolean }) {
  const router = useRouter();
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  const fetchHistory = async ({
    pageParam = 40,
  }: {
    pageParam: number;
  }): Promise<HistoryPage> => {
    const res = await axios.post("/api/projects/history", { limit: pageParam });
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
    initialPageParam: 40,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined;
      return pages.length * 40 + 40;
    },
    enabled: isActive,
  });

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const history = data?.pages.flatMap((page) => page.messages) ?? [];

  const handleDeleteAll = async () => {
    if (!history?.length) {
      setIsModelOpen(false);
      toast.error("History already cleared");
      return;
    }

    setIsModelOpen(false);
    setIsDeleteLoading(true);

    try {
      await axios.delete(`/api/projects/history`);
      toast.success("Deleted");

      setIsModelOpen(false);
      await fetchHistory({ pageParam: 40 });
    } catch (error) {
      console.error("archive error", error);
      toast.error("Failed to archive");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden no-scrollbar">
      <div>
        <button
          className="cursor-pointer hover:text-red-500 "
          onClick={() => setIsModelOpen(true)}
        >
          <TrashIcon size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="space-y-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <p className="text-sm text-gray-400">Failed to load history</p>
            <p className="text-xs text-gray-600">Please try again later</p>
          </div>
        ) : history.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {history.map((item) => (
              <div
                key={item.id}
                className="
                  group relative flex items-center gap-2.5 px-3 py-2.5
                  rounded-lg cursor-pointer select-none
                  hover:bg-white/6 active:bg-white/9
                  transition-colors duration-100
                "
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-600 group-hover:text-gray-500 transition-colors" />

                <div className="flex-1 min-w-0">
                  {/* NEW: show inline rename input when this item is being renamed */}
                  {renamingId === item.id ? (
                    <RenameInput
                      itemId={item.id}
                      currentTitle={item.title || item.name || ""}
                      onDone={() => setRenamingId(null)}
                    />
                  ) : (
                    <>
                      <p
                        onClick={() =>
                          router.push(`/dashboard/projects/${item.id}`)
                        }
                        className="text-sm text-gray-300 truncate leading-snug group-hover:text-gray-100 transition-colors"
                      >
                        {item.title || item.name || "Untitled"}
                      </p>
                      {item.updatedAt && (
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-none">
                          {timeAgo(item.updatedAt)}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Hide action menu while renaming this item */}
                {renamingId !== item.id && (
                  <ActionMenu
                    itemId={item.id}
                    itemTitle={item.title || item.name || ""}
                    openId={openActionId}
                    setOpenId={setOpenActionId}
                    renamingId={renamingId}
                    setRenamingId={setRenamingId}
                  />
                )}
              </div>
            ))}

            <div
              ref={observerRef}
              className="h-8 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600 border-t-transparent animate-spin" />
                  Loading more…
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isModelOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center">
          <div className="p-6 rounded-lg shadow-lg text-center bg-gray-800">
            <h1 className="mb-4">Are you sure want to delete all history?</h1>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsModelOpen(false)}
                className="px-4 py-2 cursor-pointer bg-gray-500 hover:bg-gray-400 active:bg-gray-600 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={isDeleteLoading}
                className="px-4 py-2 bg-red-500 cursor-pointer hover:bg-red-400 active:bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
