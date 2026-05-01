"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Archive,
  Bookmark,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ActionMenuProps {
  itemId: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

function ActionMenu({ itemId, openId, setOpenId }: ActionMenuProps) {
  const isOpen = openId === itemId;
  const menuRef = useRef<HTMLDivElement>(null);

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

  const actions = [
    { icon: Pencil, label: "Rename", onClick: () => {} },
    { icon: Bookmark, label: "Bookmark", onClick: () => {} },
    { icon: Archive, label: "Archive", onClick: () => {} },
    { icon: Share2, label: "Share", onClick: () => {} },
  ];

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
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
              onClick={() => { onClick(); setOpenId(null); }}
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
          <button
            onClick={() => setOpenId(null)}
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

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
      <div className="w-4 h-4 rounded bg-white/10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-white/10 rounded-full w-3/4" />
        <div className="h-2.5 bg-white/[0.06] rounded-full w-1/3" />
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
        <p className="text-sm font-medium text-gray-400">No conversations yet</p>
        <p className="text-xs text-gray-600 mt-0.5">Your chat history will appear here</p>
      </div>
    </div>
  );
}

export default function ChatHistory({ isActive }: { isActive: boolean }) {

  const router = useRouter();
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchHistory = async ({ pageParam = 40 }: { pageParam: number }): Promise<HistoryPage> => {
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
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const history = data?.pages.flatMap((page) => page.messages) ?? [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
                  hover:bg-white/[0.06] active:bg-white/[0.09]
                  transition-colors duration-100
                "
              >
                {/* Icon */}
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-600 group-hover:text-gray-500 transition-colors" />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p onClick={()=>router.push(`/dashboard/projects/${item.id}`)} className="text-sm text-gray-300 truncate leading-snug group-hover:text-gray-100 transition-colors">
                    {item.title || item.name || "Untitled"}
                  </p>
                  {item.updatedAt && (
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-none">
                      {timeAgo(item.updatedAt)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <ActionMenu
                  itemId={item.id}
                  openId={openActionId}
                  setOpenId={setOpenActionId}
                />
              </div>
            ))}

            {/* Infinite scroll sentinel */}
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
    </div>
  );
}