"use client";

import { ArrowBigLeft, ArrowBigRight, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Chat from "../src/components/Chat";
import ChatHistory from "../src/components/ChatHistory";
import Navbar from "../src/components/Navbar";
import Details from "../src/components/project-deatils/Details";
import { UserType } from "../src/types/profile.type";

export default function DashboardPage({ user }: { user: UserType | null }) {
  const router = useRouter();

  const [showLeft, setShowLeft] = useState<boolean>(true);
  const [showRight, setShowRight] = useState<boolean>(true);
  const [leftWidth, setLeftWidth] = useState<number>(20);
  const [rightWidth, setRightWidth] = useState<number>(20);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedShowLeft = localStorage.getItem("showLeft");
    const savedShowRight = localStorage.getItem("showRight");
    const savedLeftWidth = localStorage.getItem("leftWidth");
    const savedRightWidth = localStorage.getItem("rightWidth");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedShowLeft !== null) setShowLeft(JSON.parse(savedShowLeft));
    if (savedShowRight !== null) setShowRight(JSON.parse(savedShowRight));
    if (savedLeftWidth !== null) setLeftWidth(Number(savedLeftWidth));
    if (savedRightWidth !== null) setRightWidth(Number(savedRightWidth));

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("showLeft", JSON.stringify(showLeft));
    localStorage.setItem("showRight", JSON.stringify(showRight));
    localStorage.setItem("leftWidth", leftWidth.toString());
    localStorage.setItem("rightWidth", rightWidth.toString());
  }, [showLeft, showRight, leftWidth, rightWidth, mounted]);

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

  // if (!user) {
  //   return <Login/>;
  // }

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <Navbar user={user} />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div
          suppressHydrationWarning
          style={{ width: showLeft ? `${leftWidth}%` : "60px" }}
          className="relative border-r border-gray-800 transition-[width] duration-200 overflow-hidden bg-[#0f0f0f]"
        >
          {showLeft ? (
            <div className="h-full flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
                  Chat History
                </h1>
                <button
                  onClick={() => setShowLeft(false)}
                  className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-md p-1"
                >
                  <ArrowBigLeft />
                </button>
              </div>
              <button
                onClick={() => router.push(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
                className="flex items-center gap-2 rounded-md bg-gray-800 hover:bg-gray-700 px-4 py-2 mb-4 cursor-pointer"
              >
                <PlusCircle size={18} />
                <span>New Chat</span>
              </button>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <ChatHistory isActive />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-start justify-center pt-4">
              <button
                onClick={() => setShowLeft(true)}
                className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-md p-1"
              >
                <ArrowBigRight />
              </button>
            </div>
          )}

          {showLeft && (
            <div
              onMouseDown={(e) => startResize(e, "left")}
              className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
            />
          )}
        </div>

        {/* CENTER */}
        <div className="flex-1 overflow-hidden bg-[#111111]">
          <div className="h-full overflow-y-auto">
            <Chat />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div
          suppressHydrationWarning
          style={{ width: showRight ? `${rightWidth}%` : "60px" }}
          className="relative border-l border-gray-800 transition-[width] duration-200 overflow-hidden bg-[#0f0f0f]"
        >
          {showRight ? (
            <div className="h-full flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowRight(false)}
                  className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-md p-1"
                >
                  <ArrowBigRight />
                </button>
                <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
                  Details
                </h1>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <Details isActive />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-start justify-center pt-4">
              <button
                onClick={() => setShowRight(true)}
                className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-md p-1"
              >
                <ArrowBigLeft />
              </button>
            </div>
          )}

          {showRight && (
            <div
              onMouseDown={(e) => startResize(e, "right")}
              className="absolute top-0 left-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}
