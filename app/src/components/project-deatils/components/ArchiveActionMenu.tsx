"use client";

import { useEffect, useRef } from "react";

import axios from "axios";

import { useQueryClient } from "@tanstack/react-query";

import { Bookmark, MoreHorizontal, Share2, Trash2, Upload } from "lucide-react";

import toast from "react-hot-toast";

function ArchiveActionMenu({ itemId, openActionId, setOpenActionId }: any) {
  const queryClient = useQueryClient();

  const menuRef = useRef<HTMLDivElement | null>(null);

  const isOpen = openActionId === itemId;

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [isOpen, setOpenActionId]);

  const closeMenu = () => setOpenActionId(null);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/projects/archive/${itemId}`);

      toast.success("Deleted");

      queryClient.invalidateQueries({
        queryKey: ["archive"],
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete");
    } finally {
      closeMenu();
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await axios.post(`/api/projects/bookmark/${itemId}`,{ id: Number(itemId) });
      console.log('res', res);

      toast.success("Bookmarked");
    } catch (error) {
      console.log(error);
      toast.error("Failed to bookmark");
    } finally {
      closeMenu();
    }
  };

  const handleUnarchive = async () => {
    try {
      await axios.put(`/api/projects/archive/${itemId}`, {
        id: Number(itemId),
        status: 2,
      });

      toast.success("Unarchived");

      queryClient.invalidateQueries({
        queryKey: ["archive"],
      });
    } catch (error) {
      console.log("server error", error);
      toast.error("Failed to unarchive");
    } finally {
      closeMenu();
    }
  };

  const actions = [
    {
      icon: Bookmark,
      label: "Bookmark",
      action: handleBookmark,
    },
    {
      icon: Upload,
      label: "Unarchive",
      action: handleUnarchive,
    },
    {
      icon: Share2,
      label: "Share",
      action: closeMenu,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpenActionId(isOpen ? null : itemId)}
        className="
flex items-center justify-center
w-7 h-7 rounded-lg
text-gray-500 hover:text-white
hover:bg-white/10
transition-all duration-200
opacity-0 group-hover:opacity-100
"
      >
        {" "}
        <MoreHorizontal className="w-4 h-4" />{" "}
      </button>
      {isOpen && (
        <div
          className="
        absolute right-0 top-full mt-2 z-50
        w-44 rounded-xl overflow-hidden
        bg-[#161616]
        border border-white/10
        shadow-2xl shadow-black/40
        animate-in fade-in zoom-in-95 duration-150
      "
        >
          {actions.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="
            w-full flex items-center gap-3
            px-3 py-2.5 text-sm
            text-gray-300 hover:text-white
            hover:bg-white/5
            transition-colors
          "
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          <div className="border-t border-white/10" />

          <button
            onClick={handleDelete}
            className="
          w-full flex items-center gap-3
          px-3 py-2.5 text-sm
          text-red-400 hover:text-red-300
          hover:bg-red-500/10
          transition-colors
        "
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ArchiveActionMenu;
