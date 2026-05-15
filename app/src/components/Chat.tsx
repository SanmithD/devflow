"use client";

import axios from "axios";
import {
  ArrowUp,
  CopyIcon,
  FilePlus2Icon,
  LoaderIcon,
  Mic,
  MicOff,
  Square
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useUserInfo } from "../hooks/UserDetail";
import BotActions from "./project-deatils/components/ChatAction";
import { VideoLinkPreview } from "./project-deatils/components/VideoPreview";

// ── Main Chat component ───────────────────────────────────────────────────────
function Chat() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>(
    [],
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  let pendingProjectId: string | null = null;

  const user = useUserInfo();

  console.log("user", user);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-resize textarea (1 row default, max 4 rows) ────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 24; // px per row approx
    const maxHeight = lineHeight * 4 + 16; // 4 rows + padding
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [message]);

  // ── Load past messages ───────────────────────────────────────────────────────
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

  // ── Stop streaming ───────────────────────────────────────────────────────────
  const handleStop = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (userText: string) => {
    if (loading || !userText.trim()) {
      toast.error("Message is required");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    // Append user msg + empty bot placeholder; mark the bot as "streaming"
    setMessages((prev) => [
      ...prev,
      { type: "user", text: userText },
      { type: "bot", text: "", streaming: true } as any,
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

      if (response.status === 400) {
        const errorData = await response.json();

        toast.error(errorData.message);
        return ;
      }

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
                    streaming: true,
                  } as any;
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
      if ((error as Error).name === "AbortError") return;
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      // Mark the last bot message as no longer streaming
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.type === "bot") {
          updated[updated.length - 1] = { ...last, streaming: false } as any;
        }
        return updated;
      });
      setLoading(false);
    }
  };

  // ── Regenerate ───────────────────────────────────────────────────────────────
  const handleRegenerate = (index: number) => {
    const userMsg = messages[index - 1];
    if (!userMsg || userMsg.type !== "user") return;
    setMessages((prev) => prev.slice(0, index));
    sendMessage(userMsg.text);
  };

  // ── Mic toggle ───────────────────────────────────────────────────────────────
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setMessage(transcript);
    };

    recognition.onerror = () => {
      toast.error("Microphone error");
      setListening(false);
    };

    recognition.start();
  };

  // ── File upload trigger ──────────────────────────────────────────────────────
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Selected: ${file.name}`);
      // TODO: handle file upload logic here
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full">
      {/* Messages */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
        {messages.map((msg: any, index) =>
          msg.type === "user" ? (
            <div key={index} className="flex justify-end">
              <div className="group flex flex-col items-end max-w-[70%]">
                <div className="px-4 py-2 w-full rounded-2xl shadow bg-gray-800 text-white">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
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
            <div key={index} className="flex justify-start">
              <div className="group flex flex-col max-w-[90%]">
                <div className="px-4 py-2 rounded-2xl shadow bg-transparent text-white">
                  <div
                    className="
                      prose prose-sm max-w-none text-white
                      [&_p]:my-2 [&_p]:mb-8 [&_p]:leading-6
                      [&_ul]:my-8 [&_ul]:pl-10
                      [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:mb-10
                      [&_li]:my-2 [&_li]:leading-6
                      [&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:text-base [&_h1]:font-semibold
                      [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold
                      [&_h3]:mt-2 [&_h3]:mb-0 [&_h3]:text-sm [&_h3]:font-semibold
                      [&_h4]:mt-1 [&_h4]:mb-0
                      [&_pre]:my-3
                      [&_blockquote]:my-0 [&_blockquote]:py-0
                      [&_table]:my-0
                      [&_hr]:my-7
                      [&_img]:rounded-xl [&_img]:my-0
                      [&_a]:text-blue-400
                      [&_strong]:text-white
                      [&_code]:text-pink-400
                      [&>*:first-child]:mt-0
                      [&>*:last-child]:mb-0
                    "
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
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
                                className="absolute top-2 right-2 text-xs bg-zinc-800 px-2 py-1 rounded text-white z-10"
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
                            <VideoLinkPreview href={href ?? ""}>
                              {children}
                            </VideoLinkPreview>
                          );
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Loader only for the actively streaming message */}
                  {msg.streaming && (
                    <LoaderIcon className="animate-spin mt-1" size={14} />
                  )}
                </div>

                {/* Actions only when message is complete */}
                {msg.text && !msg.streaming && (
                  <BotActions
                    text={msg.text}
                    textId={msg.id}
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
        <div className="max-w-3xl mx-auto border rounded-3xl px-3 py-2 flex items-end gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          {/* Hidden file input */}
          <input
            hidden
            ref={fileInputRef}
            type="file"
            name="media"
            id="media"
            onChange={handleFileChange}
          />

          {/* Upload button */}
          <button
            onClick={handleFileButtonClick}
            className="p-2 rounded-full hover:bg-gray-500 transition-colors shrink-0"
            title="Attach file"
          >
            <FilePlus2Icon size={20} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(message);
              }
            }}
            placeholder="Type a message..."
            disabled={loading}
            rows={1}
            style={{ resize: "none", overflowY: "hidden" }}
            className="flex-1 bg-transparent outline-none py-2 leading-6 min-h-10"
          />

          {/* Mic toggle */}
          <button
            onClick={toggleListening}
            title={listening ? "Stop listening" : "Start voice input"}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              listening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "hover:bg-gray-500"
            }`}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Send / Stop */}
          {loading ? (
            <button
              onClick={handleStop}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shrink-0"
              title="Stop generating"
            >
              <Square size={20} />
            </button>
          ) : (
            <button
              onClick={() => sendMessage(message)}
              disabled={!message.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 shrink-0 transition-colors"
              title="Send message"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Terms And Condition */}
      <div
        className="w-full cursor-pointer flex justify-center"
        onClick={() => router.push("/dashboard/terms")}
      >
        <p className="text-gray-500 text-sm hover:text-emerald-500">
          DevFlow Agent can make mistakes,Please double-check responses.
        </p>
      </div>
    </div>
  );
}

export default Chat;
