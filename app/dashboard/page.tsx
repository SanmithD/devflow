"use client";

import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useState } from "react";
import Chat from "../src/components/Chat";
import ChatHistory from "../src/components/ChatHistory";
import Navbar from "../src/components/Navbar";

export default function DashboardPage() {
  const [showRight, setShowRight] = useState(true);
  const [showLeft, setShowLeft] = useState(true);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* LEFT */}
        <div
          className={`transition-all duration-300 border-r border-gray-300 py-4 overflow-hidden ${
            showLeft ? "w-[20%]" : "w-0 p-0"
          }`}
        >
          <h2>
            {showLeft && (
              <div className="flex flex-col px-4">
                <h1 className="text-[20px] md:text-2xl font-medium font-serif mb-2 tracking-wider md:mb-4">
                  Chat History
                </h1>
                <ChatHistory isActive={true} />
              </div>
            )}
          </h2>
        </div>

        {/* MIDDLE */}
        <div className="flex-1 flex-col border-r border-gray-300 p-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowLeft(!showLeft)}
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              {showLeft ? <ArrowBigLeft /> : <ArrowBigRight />}
            </button>

            <h2>Main Chat</h2>

            <button
              onClick={() => setShowRight(!showRight)}
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              {showRight ? <ArrowBigRight /> : <ArrowBigLeft />}
            </button>
          </div>

          {/* chat */}
          <div className="h-full w-full" >
            <Chat />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className={`transition-all duration-300 border-l border-gray-300 py-4 overflow-hidden ${
            showRight ? "w-[20%]" : "w-0 p-0"
          }`}
        >
          {showRight && "Bookmarks"}
        </div>
      </div>
    </div>
  );
}
