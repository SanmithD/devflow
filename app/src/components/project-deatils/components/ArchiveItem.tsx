"use client";

import { MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import ArchiveActionMenu from "./ArchiveActionMenu";

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

function ArchiveItem({ item, openActionId, setOpenActionId }: any) {
  const router = useRouter();

  const pathname = usePathname();

  const isActive = pathname.includes(item.id);

  return (
    <div
      className={`
group flex items-center gap-3
px-3 py-2.5 rounded-xl
border transition-all duration-200
cursor-pointer

    ${
      isActive
        ? "bg-white/8 border-white/10"
        : "border-transparent hover:bg-white/4"
    }
  `}
      onClick={() =>{ 
        if(process.env.NODE_ENV === 'development'){
          router.push(`/dashboard/projects/${item.id}`)
        }else{
          router.push(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${item.id}`)
        }
        }}
    >
      <MessageSquare className="w-4 h-4 text-gray-500 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">
          {item.title || "Untitled"}
        </p>

        <p className="text-[11px] text-gray-500 mt-1">
          {timeAgo(item.createdAt)}
        </p>
      </div>

      <ArchiveActionMenu
        itemId={String(item.id)}
        openActionId={openActionId}
        setOpenActionId={setOpenActionId}
      />
    </div>
  );
}

export default memo(ArchiveItem);
