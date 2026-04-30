"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

function ChatHistory({ isActive }: { isActive: boolean }) {
  const [limit] = useState(40);

  let fetchHistory;
  if (isActive) {
    fetchHistory = async () => {
      const res = await axios.post("/api/projects/history", {
        limit,
      });

      return res.data.messages;
    };
  }

  const { data: history, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });

  console.log("data", history);

  return <div>ChatHistory</div>;
}

export default ChatHistory;
