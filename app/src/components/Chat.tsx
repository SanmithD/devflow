"use client";

import axios from "axios";
import {
  ArrowUp,
  Copy,
  CopyIcon,
  LoaderIcon,
  RefreshCw,
  Share2,
  Square,
  Volume2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { UseAuth } from "../hooks/UserDetail";

// ── Action bar shown on hover beneath each bot message ──────────────────────
function BotActions({
  text,
  onRegenerate,
}: {
  text: string;
  onRegenerate: () => void;
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied (Web Share API not available)");
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

// ── Main Chat component ──────────────────────────────────────────────────────
function Chat() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>(
    [],
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  let pendingProjectId: string | null = null;

  const handleStop = async () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  const { user } = UseAuth();

  console.log('user', user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPastMessages = async () => {
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
    fetchPastMessages();
  }, [projectId]);

  const sendMessage = async (userText: string) => {
    if (loading || !userText.trim()) {
      toast.error("Message is required");
      return;
    }
    

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: "user", text: userText },
      { type: "bot", text: "" },
    ]);
    setMessage("");

    try {
      const response = await fetch("/api/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          projectId: projectId ? Number(projectId) : null,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split("\n")
          .filter((l) => l.trim().startsWith("data:"));

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, "").trim();
          if (data === "[DONE]") break;

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

                pendingProjectId = parsed.id;
                return updated;
              });
            } catch (err) {
              console.error("Chunk parse error:", err);
            }
          }
        }
        if (pendingProjectId) {
          router.push(`/dashboard/projects/${pendingProjectId}`);
        }
      }
    } catch (error) {
      console.error(error);
      if ((error as Error).name === "AbortError") {
        return;
      }
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = (index: number) => {
    // Find the user message that preceded this bot message
    const userMsg = messages[index - 1];
    if (!userMsg || userMsg.type !== "user") return;

    // Remove this bot message (and optionally re-send)
    setMessages((prev) => prev.slice(0, index));
    sendMessage(userMsg.text);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
        {messages.map((msg, index) =>
          msg.type === "user" ? (
            <div key={index} className="flex justify-end">
              {/* group added */}
              <div className="group flex flex-col items-end max-w-[70%]">
                <div className="px-4 py-2 rounded-2xl shadow bg-gray-800 text-white">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Copy button (hidden until hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition mt-1">
                  <button
                    title="Copy"
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      toast.success("Copied");
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    <CopyIcon size={12} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Wrap bot message + action bar in a `group` so hover works together
            <div key={index} className="flex justify-start">
              <div className="group flex flex-col max-w-[70%]">
                <div className="px-4 py-2 rounded-2xl shadow bg-transparent text-white">
                  <div className="prose prose-sm text-sm/6 max-w-none md:tracking-wide prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-table:text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");

                          return !inline ? (
                            <div className="relative my-3">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    String(children),
                                  );
                                  toast.success("Copied code");
                                }}
                                className="absolute top-2 right-2 text-xs bg-zinc-800 px-2 py-1 rounded text-white"
                              >
                                Copy
                              </button>

                              <SyntaxHighlighter
                                language={match?.[1]}
                                PreTag="div"
                                style={oneDark}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-zinc-800 px-1 py-0.5 rounded text-pink-400">
                              {children}
                            </code>
                          );
                        },
                        a({ href, children }: any) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline hover:text-blue-300 transition"
                            >
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  {loading && <LoaderIcon className="animate-spin" size={14} />}
                </div>

                {/* Only show actions once the message has content */}
                {msg.text && (
                  <BotActions
                    text={msg.text}
                    onRegenerate={() => handleRegenerate(index)}
                  />
                )}
              </div>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(message);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {loading ? (
            <button
              onClick={handleStop}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <Square size={20} /> {/* lucide-react Square icon */}
            </button>
          ) : (
            <button
              onClick={() => sendMessage(message)}
              disabled={!message.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
