"use client";

import { useEffect, useRef } from "react";

function Chat() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div ref={bottomRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
        {/* Incoming message */}
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]">
            Hey bro, how’s it going?
          </div>
        </div>

        {/* Outgoing message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]">
            All good man 😄 working on UI
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
