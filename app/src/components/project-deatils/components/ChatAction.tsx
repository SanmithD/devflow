"use client";

import { Copy, RefreshCw, Share2, Volume2 } from "lucide-react";
import toast from "react-hot-toast";

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center px-2 py-1 text-[11px] text-gray-400 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors whitespace-nowrap"
    >
      {icon}
    </button>
  );
}

// ── Action bar shown on hover beneath each bot message ───────────────────────
export default function BotActions({
  text,
  textId,
  onRegenerate,
}: {
  text: string;
  textId: number;
  onRegenerate: () => void;
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleShare = async () => {
    // Encode: timestamp prefix as ID, text as suffix
    const encoded = encodeURIComponent(text.slice(0, 200));
    const id = `${textId}-${Date.now()}_${encoded}`;
    const shareUrl = `${window.location.origin}/share/${id}`;

    if (navigator.share) {
      await navigator
        .share({
          title: "DevFlow Response",
          text: text.slice(0, 30) + "...",
          url: shareUrl,
        })
        .catch(() => null);
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    }
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return toast.error("Speech not supported");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-1 mt-1 pl-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <ActionButton
        icon={<Copy size={12} />}
        label="Copy"
        onClick={handleCopy}
      />
      <ActionButton
        icon={<Share2 size={12} />}
        label="Share"
        onClick={handleShare}
      />
      <ActionButton
        icon={<Volume2 size={12} />}
        label="Speak"
        onClick={handleSpeak}
      />
      <ActionButton
        icon={<RefreshCw size={12} />}
        label="Regenerate"
        onClick={onRegenerate}
      />
    </div>
  );
}
