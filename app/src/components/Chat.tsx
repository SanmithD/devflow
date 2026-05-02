"use client";

import axios from "axios";
import { ArrowUp, ShareIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function Chat() {
  const params = useParams();
  const router = useRouter();

  const projectId = params?.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // fetch old messages
  const fetchPastMessage = async () => {
    try {
      const project_id = Number(projectId);
      const res = await axios.get(`/api/projects/${project_id}/logs`);

      const logs = res?.data?.result || [];

      const formatted = logs
        .map((item: any) => [
          { type: "user", text: item.input },
          { type: "bot", text: item.response },
        ])
        .flat();

      setMessages(formatted);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchPastMessage();
  }, [projectId]);

  const handleChat = async () => {
    if (loading) return;

    try {
      if (!message.trim()) {
        toast.error("Message is required");
        return;
      }

      setLoading(true);

      const userMessage = { type: "user", text: message };
      setMessages((prev) => [...prev, userMessage]);

      setMessage("");

      const res = await axios.post("/api/projects", {
        message,
        projectId: Number(projectId),
      });

      const newProjectId = res?.data?.result?.projectId;

      // 👇 update URL after first message
      if (!projectId && newProjectId) {
        router.push(`/dashboard/projects/${newProjectId}`);
      }

      const botMessage = {
        type: "bot",
        text: res?.data?.result?.response,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
      toast.error("Fail to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow max-w-[70%] ${
                msg.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <div>
            <ShareIcon/>
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChat();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2"
          />

          <button
            onClick={handleChat}
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            <ArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
