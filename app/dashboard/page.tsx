"use client";

import { ArrowBigLeft, ArrowBigRight, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Chat from "../src/components/Chat";
import ChatHistory from "../src/components/ChatHistory";
import Navbar from "../src/components/Navbar";

export default function DashboardPage() {

  const router = useRouter();

  const [showRight, setShowRight] = useState(true);
  const [showLeft, setShowLeft] = useState(true);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 w-full overflow-hidden">
        {/* LEFT */}
        <div
          className={`transition-all duration-300 border-r border-gray-800 py-4 overflow-hidden ${
            showLeft ? "w-[20%]" : "w-[4%] p-0"
          }`}
        >
          <h2>
            {showLeft && (
              <div className="flex flex-col px-4">
                <div className="relative flex justify-between">
                  <h1 className="text-[20px] md:text-2xl font-medium font-serif mb-2 tracking-wider md:mb-4">
                    Chat History
                  </h1>
                  <button
                    onClick={() => setShowLeft(!showLeft)}
                    title="hide history"
                    className={`bg-gray-800 cursor-pointer h-fit text-white px-3 py-1 rounded absolute'right-0'`}
                  >
                    {showLeft ? <ArrowBigLeft /> : <ArrowBigRight />}
                  </button>
                </div>
                <div>
                  <button onClick={()=>router.push('/dashboard')} className="text-[16px] w-full px-4 py-1 rounded-md flex items-center gap-2 cursor-pointer font-medium hover:bg-gray-700 active:bg-gray-800 mb-2 tracking-wider md:mb-4">
                    <PlusCircle size={18} /> <span>New chat</span> 
                  </button>
                </div>

                <div className="h-screen no-scrollbar">
                  {" "}
                  {/* or h-full on a flex child */}
                  <ChatHistory isActive={true} />
                </div>
              </div>
            )}
            <button
              hidden={showLeft}
              title="view history"
              onClick={() => setShowLeft(!showLeft)}
              className={`bg-gray-800 text-white cursor-pointer px-3 py-1 rounded absolute'right-0'`}
            >
              {showLeft ? <ArrowBigLeft /> : <ArrowBigRight />}
            </button>
          </h2>
        </div>

        {/* MIDDLE */}
        <div className="flex-1 flex-col border-r border-gray-300 p-4 relative overflow-hidden">
          <div className="flex justify-between items-center"></div>

          {/* chat */}
          <div className="h-full w-full">
            <Chat />
          </div>
        </div>

        {/* RIGHT */}
        <div
          className={`transition-all duration-300 border-l border-gray-300 py-4 overflow-hidden ${
            showRight ? "w-[20%]" : "w-[4%] p-0"
          }`}
        >
          {showRight && (
            <div className="flex flex-col px-4">
              <div className="relative flex justify-between">
                <button
                  onClick={() => setShowRight(!showRight)}
                  title="hide history"
                  className={`bg-gray-800 cursor-pointer h-fit text-white px-3 py-1 rounded absolute'right-0'`}
                >
                  {showLeft ? <ArrowBigRight /> : <ArrowBigLeft />}
                </button>
                <h1 className="text-[20px] md:text-2xl font-medium font-serif mb-2 tracking-wider md:mb-4">
                  Bookmarks
                </h1>
              </div>

              {/* <ChatHistory isActive={true} /> */}
            </div>
          )}
          <button
            hidden={showRight}
            onClick={() => setShowRight(!showRight)}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            {showRight ? <ArrowBigRight /> : <ArrowBigLeft />}
          </button>
        </div>
      </div>
    </div>
  );
}
