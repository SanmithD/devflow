"use client";

import { ArrowBigLeft, ArrowBigRight, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Chat from "../src/components/Chat";
import ChatHistory from "../src/components/ChatHistory";
import Navbar from "../src/components/Navbar";
import Details from "../src/components/project-deatils/Details";

export default function DashboardPage() {
  const router = useRouter();

  const [showLeft, setShowLeft] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showLeft");

      return saved ? JSON.parse(saved) : true;
    }

    return true;
  });

  const [showRight, setShowRight] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showRight");

      return saved ? JSON.parse(saved) : true;
    }

    return true;
  });

  const [leftWidth, setLeftWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leftWidth");

      return saved ? Number(saved) : 20;
    }

    return 20;
  });

  const [rightWidth, setRightWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rightWidth");

      return saved ? Number(saved) : 20;
    }

    return 20;
  });

  useEffect(() => {
    localStorage.setItem("showLeft", JSON.stringify(showLeft));

    localStorage.setItem("showRight", JSON.stringify(showRight));

    localStorage.setItem("leftWidth", leftWidth.toString());

    localStorage.setItem("rightWidth", rightWidth.toString());
  }, [showLeft, showRight, leftWidth, rightWidth]);


  const startResize = (e: React.MouseEvent, side: "left" | "right") => {
    e.preventDefault();

    const startX = e.clientX;

    const startWidth = side === "left" ? leftWidth : rightWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;

      let newWidth;

      if (side === "left") {
        newWidth = startWidth + (diff / window.innerWidth) * 100;

        newWidth = Math.max(15, Math.min(40, newWidth));

        setLeftWidth(newWidth);
      } else {
        newWidth = startWidth - (diff / window.innerWidth) * 100;

        newWidth = Math.max(15, Math.min(40, newWidth));

        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);

    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* NAVBAR */}

      <Navbar />

      {/* BODY */}

      <div className="flex flex-1 overflow-hidden">
        {/* ================= LEFT SIDEBAR ================= */}

        <div
          style={{
            width: showLeft ? `${leftWidth}%` : "60px",
          }}
          className="
            relative
            border-r
            border-gray-800
            transition-[width]
            duration-200
            overflow-hidden
            bg-[#0f0f0f]
          "
        >
          {showLeft ? (
            <div className="h-full flex flex-col p-4">
              {/* HEADER */}

              <div className="flex items-center justify-between mb-4">
                <h1
                  className="
                    text-xl
                    md:text-2xl
                    font-semibold
                    tracking-wide
                  "
                >
                  Chat History
                </h1>

                <button
                  onClick={() => setShowLeft(false)}
                  className="
                      bg-gray-800
                      hover:bg-gray-700
                      cursor-pointer
                      rounded-md
                      p-1
                    "
                >
                  <ArrowBigLeft />
                </button>
              </div>

              {/* NEW CHAT */}

              <button
                onClick={() => router.push("/dashboard")}
                className="
                    flex
                    items-center
                    gap-2
                    rounded-md
                    bg-gray-800
                    hover:bg-gray-700
                    px-4
                    py-2
                    mb-4
                    cursor-pointer
                  "
              >
                <PlusCircle size={18} />

                <span>New Chat</span>
              </button>

              {/* HISTORY */}

              <div
                className="
                  flex-1
                  overflow-y-auto
                  no-scrollbar
                "
              >
                <ChatHistory isActive />
              </div>
            </div>
          ) : (
            <div
              className="
                h-full
                flex
                items-start
                justify-center
                pt-4
              "
            >
              <button
                onClick={() => setShowLeft(true)}
                className="
                    bg-gray-800
                    hover:bg-gray-700
                    cursor-pointer
                    rounded-md
                    p-1
                  "
              >
                <ArrowBigRight />
              </button>
            </div>
          )}

          {/* RESIZE HANDLE */}

          {showLeft && (
            <div
              onMouseDown={(e) => startResize(e, "left")}
              className="
                  absolute
                  top-0
                  right-0
                  h-full
                  w-1
                  cursor-col-resize
                  hover:bg-blue-500
                "
            />
          )}
        </div>

        {/* ================= CENTER ================= */}

        <div
          className="
          flex-1
          overflow-hidden
          bg-[#111111]
        "
        >
          <div
            className="
            h-full
            overflow-y-auto
          "
          >
            <Chat />
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}

        <div
          style={{
            width: showRight ? `${rightWidth}%` : "60px",
          }}
          className="
            relative
            border-l
            border-gray-800
            transition-[width]
            duration-200
            overflow-hidden
            bg-[#0f0f0f]
          "
        >
          {showRight ? (
            <div
              className="
                h-full
                flex
                flex-col
                p-4
              "
            >
              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                "
              >
                <button
                  onClick={() => setShowRight(false)}
                  className="
                      bg-gray-800
                      hover:bg-gray-700
                      cursor-pointer
                      rounded-md
                      p-1
                    "
                >
                  <ArrowBigRight />
                </button>

                <h1
                  className="
                    text-xl
                    md:text-2xl
                    font-semibold
                    tracking-wide
                  "
                >
                  Details
                </h1>
              </div>

              {/* DETAILS */}

              <div
                className="
                  flex-1
                  overflow-y-auto
                  no-scrollbar
                "
              >
                <Details isActive />
              </div>
            </div>
          ) : (
            <div
              className="
                h-full
                flex
                items-start
                justify-center
                pt-4
              "
            >
              <button
                onClick={() => setShowRight(true)}
                className="
                    bg-gray-800
                    hover:bg-gray-700
                    cursor-pointer
                    rounded-md
                    p-1
                  "
              >
                <ArrowBigLeft />
              </button>
            </div>
          )}

          {/* RESIZE HANDLE */}

          {showRight && (
            <div
              onMouseDown={(e) => startResize(e, "right")}
              className="
                  absolute
                  top-0
                  left-0
                  h-full
                  w-1
                  cursor-col-resize
                  hover:bg-blue-500
                "
            />
          )}
        </div>
      </div>
    </div>
  );
}
