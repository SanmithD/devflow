"use client";

import axios from "axios";
import {
  ArrowUp,
  CopyIcon,
  FileIcon,
  FilePlus2Icon,
  LoaderIcon,
  Mic,
  MicOff,
  Square,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { isValidFile } from "../helper/validate_media_type";
import { MediaMetadata } from "../types/chat.type";
import BotActions from "./project-deatils/components/ChatAction";
import { VideoLinkPreview } from "./project-deatils/components/VideoPreview";

// ── File Preview Component (input area) ──────────────────────────────────────
function FilePreview({
  file,
  previewUrl,
  onRemove,
}: {
  file: File;
  previewUrl: string;
  onRemove: () => void;
}) {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="relative inline-flex items-center group mb-2">
      {isImage ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt={file.name}
            className="h-24 w-24 object-cover rounded-xl border border-white/10 shadow-lg"
          />
          <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-zinc-800/80 border border-white/10 rounded-xl px-3 py-2.5 min-w-[160px] max-w-[240px]">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FileIcon size={16} className="text-blue-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-white font-medium truncate">
              {file.name}
            </span>
            <span className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-700 hover:bg-red-500 border border-white/10 rounded-full flex items-center justify-center transition-colors shadow z-10"
        title="Remove file"
      >
        <X size={10} className="text-white" />
      </button>
    </div>
  );
}

// ── Media Preview (inside message bubble) ─────────────────────────────────────
function MediaPreview({ media }: { media: MediaMetadata }) {
  const isImage = media.type.startsWith("image/");
  const isPDF = media.format === "pdf" || media.type === "application/pdf";

  if (isImage) {
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-3"
      >
        <img
          src={media.url}
          alt={media.name}
          className="max-h-48 rounded-xl border border-white/10 shadow object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mb-3 bg-zinc-800/80 border border-white/10
                 rounded-xl px-3 py-2.5 min-w-[160px] max-w-[260px] hover:border-blue-500/50
                 transition-colors group"
    >
      <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
        {isPDF ? (
          <FileIcon size={16} className="text-red-400" />
        ) : (
          <FileIcon size={16} className="text-blue-400" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-white font-medium truncate group-hover:text-blue-300 transition-colors">
          {media.name}
        </span>
        <span className="text-xs text-gray-400">
          {(media.size / 1024).toFixed(1)} KB · {media.format.toUpperCase()}
        </span>
      </div>
      <ArrowUp size={12} className="text-gray-500 rotate-45 shrink-0 ml-auto" />
    </a>
  );
}

// ── Main Chat component ───────────────────────────────────────────────────────
function Chat() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string | undefined;

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ type: string; text: string }[]>(
    [],
  );
  const [isDragging, setIsDragging] = useState(false);
  // ── replace these two state lines ──
  const [limit, setLimit] = useState<number>(20);
  const [hasMore, setHasMore] = useState(true);

  // ── replace the messages scroll container ref ──
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);

  let pendingProjectId: string | null = null;

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 5 + 16;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [message]);

  // ── Load past messages ───────────────────────────────────────────────────────
  const fetchPastMessages = async (currentLimit: number, append = false) => {
    try {
      const res = await axios.post(`/api/projects/${Number(projectId)}/logs`, {
        limit: currentLimit,
      });
      const logs = res?.data?.messages || [];

      // if we got fewer than requested, no more pages
      setHasMore(res?.data?.hasMore ?? false);

      const formatted = logs
        .map((item: any) => [
          {
            type: "user",
            text: item.input,
            media: item.media_metadata ?? undefined,
          },
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
    fetchPastMessages(limit);
  }, [projectId]);

  // ── scroll up to load more ────────────────────────────────────────────────────
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore || loading) return;

    // trigger when user is within 60px of the top
    if (container.scrollTop <= 60) {
      const prevScrollHeight = container.scrollHeight;

      setLimit((prev) => {
        const newLimit = prev + 10;

        // fetch with new limit, then restore scroll position
        axios
          .post(`/api/projects/${Number(projectId)}/logs`, { limit: newLimit })
          .then((res) => {
            const logs = res?.data?.messages || [];
            setHasMore(res?.data?.hasMore ?? false);

            const formatted = logs
              .map((item: any) => [
                {
                  type: "user",
                  text: item.input,
                  media: item.media_metadata ?? undefined,
                },
                { type: "bot", text: item.response },
              ])
              .flat();

            setMessages(formatted);

            // restore scroll position after render
            requestAnimationFrame(() => {
              if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeight;
              }
            });
          })
          .catch(() => toast.error("Failed to load more messages"));

        return newLimit;
      });
    }
  };

  // ── Cleanup preview URL ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Stop streaming ───────────────────────────────────────────────────────────
  const handleStop = () => {
    abortControllerRef.current?.abort();
    setLoading(false);
  };

  // ── Remove attached file ─────────────────────────────────────────────────────
  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload file directly to backend ──────────────────────────────────────────
  // POST /api/upload  (multipart/form-data, field: "file")
  // Expected response: { media_metadata: MediaMetadata }
  const uploadFile = async (
    file: File,
    projectId: string,
  ): Promise<MediaMetadata | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", String(projectId));

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("client data", res.data);

      return res.data.data as MediaMetadata;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      return null;
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (userText: string) => {
    if (loading || !userText.trim()) {
      toast.error("Message is required");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let media_metadata: MediaMetadata | null = null;

    if (previewFile) {
      const toastId = toast.loading("Uploading file...");
      media_metadata = await uploadFile(previewFile, String(projectId));

      console.log("meta", media_metadata);
      toast.dismiss(toastId);

      if (!media_metadata) return;

      toast.success("File uploaded");
    }

    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: "user", text: userText, media: media_metadata ?? undefined },
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
          ...(media_metadata && { media_metadata }),
        }),
        signal: controller.signal,
      });

      if (response.status === 400) {
        const errorData = await response.json();
        toast.error(errorData.message);
        return;
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

  // ── Drag & Drop ──────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // ── File helpers ─────────────────────────────────────────────────────────────
  const processFile = (file: File) => {
    console.log("file type:", file.type, "file name:", file.name);
    if (!isValidFile(file)) {
      toast.error("Invalid file type (no audio/video allowed)");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileChange triggered", e.target.files);
    const file = e.target.files?.[0];
    console.log("selected file:", file?.name, file?.type, file?.size);
    if (!file) return;
    processFile(file);
  };

  const handleFileButtonClick = () => fileInputRef.current?.click();

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Messages ── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 w-full custom-scroll px-4 py-3 space-y-3"
      >
        {hasMore && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-gray-500">
              Scroll up to load more
            </span>
          </div>
        )}
        {messages.map((msg: any, index) =>
          msg.type === "user" ? (
            <div key={index} className="flex justify-end">
              <div className="group flex flex-col items-end max-w-[70%]">
                <div className="px-4 py-2 w-full rounded-2xl shadow bg-gray-800 text-white">
                  {msg.media && <MediaPreview media={msg.media} />}
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
                    className="prose prose-sm max-w-none text-white
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
                    [&>*:last-child]:mb-0"
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
                  {msg.streaming && (
                    <LoaderIcon className="animate-spin mt-1" size={14} />
                  )}
                </div>
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

      {/* ── Input Area ── */}
      <div className="mt-20 md:mt-8 place-content-end">
        <div className="p-3">
          <div className="max-w-3xl mx-auto">
            <div
              ref={inputWrapperRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-3xl border transition-all duration-200
                ${
                  isDragging
                    ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/5"
                    : "border-white/10 bg-zinc-900/60 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20"
                } shadow-lg backdrop-blur-sm`}
            >
              {isDragging && (
                <div className="absolute inset-0 rounded-3xl flex items-center justify-center z-20 pointer-events-none">
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <FilePlus2Icon size={18} />
                    <span>Drop file here</span>
                  </div>
                </div>
              )}

              <div
                className={`flex flex-col gap-0 ${isDragging ? "opacity-30 pointer-events-none" : ""}`}
              >
                {previewFile && previewUrl && (
                  <div className="px-4 pt-3 pb-1">
                    <FilePreview
                      file={previewFile}
                      previewUrl={previewUrl}
                      onRemove={removeFile}
                    />
                  </div>
                )}

                <div className="flex items-end gap-2 px-3 py-2">
                  <input
                    hidden
                    ref={fileInputRef}
                    type="file"
                    name="media"
                    id="media"
                    accept=".jpg,.jpeg,.png,.svg,.pdf,.txt,.json,.csv,.docx,.xlsx,.pptx"
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={handleFileButtonClick}
                    title="Attach file"
                    className={`p-2 rounded-xl transition-all duration-150 shrink-0 self-end mb-0.5
                      ${
                        previewFile
                          ? "text-blue-400 bg-blue-500/15 hover:bg-blue-500/25"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <FilePlus2Icon size={18} />
                  </button>

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
                    placeholder={
                      previewFile
                        ? `Add a message about ${previewFile.name}…`
                        : "Type a message…"
                    }
                    disabled={loading}
                    rows={1}
                    style={{ resize: "none", overflowY: "hidden" }}
                    className="flex-1 bg-transparent outline-none py-2 leading-6 min-h-10 text-white placeholder:text-gray-500 text-sm"
                  />

                  <div className="flex items-center gap-1 shrink-0 self-end mb-0.5">
                    <button
                      onClick={toggleListening}
                      title={listening ? "Stop listening" : "Start voice input"}
                      className={`p-2 rounded-xl transition-all duration-150
                        ${
                          listening
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse"
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      {listening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {loading ? (
                      <button
                        onClick={handleStop}
                        title="Stop generating"
                        className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-150"
                      >
                        <Square size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => sendMessage(message)}
                        disabled={!message.trim() && !previewFile}
                        title="Send message"
                        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
                      >
                        <ArrowUp size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {previewFile && (
                  <div className="px-4 pb-2.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-gray-500">
                      {previewFile.type.startsWith("image/") ? "Image" : "File"}{" "}
                      attached · {(previewFile.size / 1024).toFixed(1)} KB ·{" "}
                      <button
                        onClick={removeFile}
                        className="text-red-400/80 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full place-content-end cursor-pointer mb-0 flex justify-center"
          onClick={() => router.push("/dashboard/terms")}
        >
          <p className="text-gray-500 text-xs hover:text-emerald-500 transition-colors">
            DevFlow Agent can make mistakes. Please double-check responses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;
