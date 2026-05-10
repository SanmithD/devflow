"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ArchiveEmpty from "../components/ArchiveEmpty";
import ArchiveItem from "../components/ArchiveItem";
import ArchiveSkeleton from "../components/ArchiveSkeleton";
import DeleteArchiveModal from "../components/DeleteArchiveModal";

interface ArchiveProps {
  isActive: boolean;
}

function Archive({ isActive }: ArchiveProps) {
  const queryClient = useQueryClient();

  const observerRef = useRef<HTMLDivElement | null>(null);

  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArchive = async ({ pageParam = 40 }) => {
    const res = await axios.post("/api/projects/archive", {
      limit: pageParam,
    });

    return res.data;
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["archive"],
    queryFn: fetchArchive,
    initialPageParam: 40,
    enabled: isActive,

    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.hasMore) return undefined;

      return pages.length * 40 + 40;
    },
  });

  const history = data?.pages.flatMap((page) => page.messages) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    const current = observerRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDeleteAll = async () => {
    if (!history.length) {
      toast.error("Archive already empty");
      return;
    }

    try {
      setIsDeleting(true);

      await axios.delete("/api/projects/archive");

      toast.success("Archive cleared");

      queryClient.invalidateQueries({
        queryKey: ["archive"],
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear archive");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {" "}
      <div className="h-full flex flex-col overflow-hidden no-scrollbar">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="
          flex items-center justify-center
          w-8 h-8 rounded-lg
          text-gray-500 hover:text-red-400
          hover:bg-red-500/10
          transition-all duration-200
          cursor-pointer
        "
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div
          className="
        flex-1 overflow-y-auto
        px-2 py-2 space-y-1
        scrollbar-thin scrollbar-thumb-white/10
      "
        >
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <ArchiveSkeleton key={i} />
              ))}
            </>
          ) : isError ? (
            <div className="flex items-center justify-center py-10 text-sm text-red-400">
              Failed to load archive
            </div>
          ) : history.length === 0 ? (
            <ArchiveEmpty />
          ) : (
            <>
              {history.map((item: any) => (
                <ArchiveItem
                  key={item.id}
                  item={item}
                  openActionId={openActionId}
                  setOpenActionId={setOpenActionId}
                />
              ))}

              <div
                ref={observerRef}
                className="h-10 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="text-xs text-gray-500 animate-pulse">
                    Loading more...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <DeleteArchiveModal
        open={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAll}
      />
    </>
  );
}

export default Archive;
