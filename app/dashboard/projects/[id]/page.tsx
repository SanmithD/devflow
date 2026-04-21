"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/ai", {
        prompt: input,
        projectId: id,
      });
      setResponse(response.data?.result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("server error", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">AI Debug Assistant</h1>

      {/* Input */}
      <textarea
        className="w-full border p-3 rounded mb-4"
        rows={5}
        placeholder="Paste your error or logs..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {/* Response */}
      {response && (
        <div className="mt-6 p-4 border rounded whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
};
