"use client";

import axios from "axios";
import { ArrowUp, ShareIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // ✅ For tables support

function Chat() {
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPastMessage = async () => {
    try {
      const res = await axios.get(`/api/projects/${Number(projectId)}/logs`);
      const logs = res?.data?.result || [];
      const formatted = logs
        .map((item: any) => [
          { type: "user", text: item.input },
          { type: "bot", text: item.response },
        ])
        .flat();
      setMessages(formatted);
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchPastMessage();
  }, [projectId]);

  const handleChat = async () => {
    if (loading || !message.trim()) {
      toast.error("Message is required");
      return;
    }

    setLoading(true);
    const userText = message;

    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setMessage("");
    setMessages((prev) => [...prev, { type: "bot", text: "" }]);

    try {
      const response = await fetch("/api/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          projectId: projectId ? Number(projectId) : null,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim().startsWith("data:"));

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, "").trim();

          if (data === "[DONE]") {
            break;
          }

          if (data) {
            try {
              const parsed = JSON.parse(data);
              const text = parsed.text || "";

              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];

                if (last?.type === "bot") {
                  updated[updated.length - 1] = {
                    ...last,
                    text: last.text + text,
                  };
                }

                return updated;
              });
            } catch (err) {
              console.error("Chunk parse error:", err, "Data:", data);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow max-w-[70%] ${
                msg.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.type === "bot" ? (
                <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <ShareIcon className="text-gray-500" size={20} />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleChat}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;