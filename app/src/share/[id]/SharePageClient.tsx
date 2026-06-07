"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
    text: string;
    createdAt: string;
}

export default function SharePageClient({ text, createdAt }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white font-sans flex flex-col">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

                * { box-sizing: border-box; }

                body { background: #0a0a0f; }

                .page-wrapper {
                    font-family: 'Syne', sans-serif;
                    min-height: 100vh;
                    background: #0a0a0f;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .noise {
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.4;
                }

                .glow-orb {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(120px);
                    pointer-events: none;
                    z-index: 0;
                }

                .glow-orb-1 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
                    top: -100px;
                    right: -100px;
                }

                .glow-orb-2 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
                    bottom: -80px;
                    left: -80px;
                }

                header {
                    position: relative;
                    z-index: 10;
                    padding: 24px 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }

                .logo-mark {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #6366f1, #10b981);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 800;
                    color: white;
                }

                .logo-text {
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.3px;
                }

                .badge {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    padding: 4px 10px;
                    background: rgba(99, 102, 241, 0.15);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 20px;
                    color: #a5b4fc;
                    letter-spacing: 0.5px;
                }

                .content-area {
                    position: relative;
                    z-index: 10;
                    flex: 1;
                    max-width: 800px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 60px 40px;
                }

                .meta-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .meta-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.8); }
                }

                .meta-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    color: rgba(255,255,255,0.35);
                    letter-spacing: 0.5px;
                }

                .response-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    overflow: hidden;
                    position: relative;
                }

                .response-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), rgba(16, 185, 129, 0.5), transparent);
                }

                .card-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .card-dots {
                    display: flex;
                    gap: 6px;
                }

                .card-dots span {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                }

                .card-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .response-text {
                    padding: 32px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    line-height: 1.85;
                    color: rgba(255,255,255,0.82);
                    white-space: pre-wrap;
                    word-break: break-word;
                    max-height: 520px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(99,102,241,0.3) transparent;
                }

                .response-text::-webkit-scrollbar {
                    width: 4px;
                }
                .response-text::-webkit-scrollbar-track { background: transparent; }
                .response-text::-webkit-scrollbar-thumb {
                    background: rgba(99,102,241,0.3);
                    border-radius: 2px;
                }

                .actions {
                    margin-top: 28px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 22px;
                    border-radius: 10px;
                    font-family: 'Syne', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                    letter-spacing: 0.2px;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25);
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 28px rgba(99, 102, 241, 0.4);
                }

                .btn-secondary {
                    background: rgba(255,255,255,0.06);
                    color: rgba(255,255,255,0.7);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }

                .btn-success {
                    background: linear-gradient(135deg, #059669, #10b981);
                    color: white;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
                }

                .cta-section {
                    position: relative;
                    z-index: 10;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding: 32px 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .cta-text h3 {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 0 0 4px;
                    color: white;
                }

                .cta-text p {
                    font-size: 13px;
                    color: rgba(255,255,255,0.4);
                    margin: 0;
                    font-family: 'JetBrains Mono', monospace;
                }

                .btn-cta {
                    background: white;
                    color: #0a0a0f;
                    font-weight: 700;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    font-family: 'Syne', sans-serif;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .btn-cta:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(255,255,255,0.15);
                }

                @media (max-width: 640px) {
                    header { padding: 16px 20px; }
                    .content-area { padding: 40px 20px; }
                    .cta-section { padding: 24px 20px; }
                    .response-text { padding: 20px; font-size: 13px; }
                }
            `}</style>

            <div className="page-wrapper">
                <div className="noise" />
                <div className="glow-orb glow-orb-1" />
                <div className="glow-orb glow-orb-2" />

                <header>
                    <Link href="/" className="logo">
                        <div className="logo-mark">D</div>
                        <span className="logo-text">DevFlow</span>
                    </Link>
                    <span className="badge">SHARED RESPONSE</span>
                </header>

                <div className="content-area">
                    <div className="meta-row">
                        <div className="meta-dot" />
                        <span className="meta-label">Generated on {formattedDate}</span>
                    </div>

                    <div className="response-card">
                        <div className="card-header">
                            <div className="card-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="card-label">AI Response</span>
                        </div>
                        <div className="response-text">{text}</div>
                    </div>

                    <div className="actions">
                        <button
                            className={`btn ${copied ? "btn-success" : "btn-primary"}`}
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    Copy Text
                                </>
                            )}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ url: window.location.href, title: "DevFlow Response" });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("URL copied!");
                                }
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            Share URL
                        </button>
                    </div>
                </div>

                <div className="cta-section">
                    <div className="cta-text">
                        <h3>Want AI responses like this?</h3>
                        <p>DevFlow — your AI-powered DevOps assistant</p>
                    </div>
                    <button className="btn-cta" onClick={() => window.location.href = "/"}>
                        Try DevFlow →
                    </button>
                </div>
            </div>
        </main>
    );
}