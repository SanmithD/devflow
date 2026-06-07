"use client";

import Image from "next/image";
import { useState } from "react";

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && !u.hostname.includes("music")) {
      return (
        u.searchParams.get("v") ||
        u.pathname.match(/\/(?:shorts|embed|live|v)\/([^/?&]+)/)?.[1] ||
        null
      );
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("?")[0] || null;
    }
  } catch {}
  return null;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function getYtThumbnails(id: string): string[] {
  return [
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/default.jpg`,
  ];
}

function YouTubePreview({
  id,
  href,
  children,
}: {
  id: string;
  href: string;
  children: React.ReactNode;
}) {
  const thumbnails = getYtThumbnails(id);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [useEmbed, setUseEmbed] = useState(false);

  const handleImgError = () => {
    if (thumbIndex < thumbnails.length - 1) {
      setThumbIndex((i) => i + 1);
    } else {
      setUseEmbed(true);
    }
  };

  return (
    <span className="block my-2 not-prose">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block group w-full max-w-sm"
      >
        <span className="block relative rounded-xl overflow-hidden border border-white/10 w-full aspect-video bg-black">
          {useEmbed ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <>
              <Image
                src={thumbnails[thumbIndex]}
                alt="YouTube thumbnail"
                fill
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-cover group-hover:opacity-80 transition-opacity duration-200"
                onError={handleImgError}
                unoptimized
              />
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-xl">
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-5 h-5 ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </>
          )}
        </span>

        <span className="block text-blue-400 underline hover:text-blue-300 transition-colors text-sm mt-1 truncate">
          {children}
        </span>
      </a>
    </span>
  );
}

export function VideoLinkPreview({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const ytId = getYouTubeId(href);
  const isVideo = isVideoUrl(href);

  if (ytId) {
    return (
      <YouTubePreview id={ytId} href={href}>
        {children}
      </YouTubePreview>
    );
  }

  if (isVideo) {
    return (
      <span className="block my-2 not-prose">
        <video
          src={href}
          controls
          preload="metadata"
          className="rounded-xl border border-white/10 max-w-sm w-full"
        />
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-400 underline hover:text-blue-300 transition-colors text-sm mt-1"
        >
          {children}
        </a>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline hover:text-blue-300 transition-colors"
    >
      {children}
    </a>
  );
}
