"use client";

import { useEffect, useState } from "react";
import Archive from "./tabs/Archive";
import Bookmark from "./tabs/Bookmark";

type TabType = "archive" | "bookmark" | "system";

const STORAGE_KEY = "details-active-tab";

function Details({ isActive }: { isActive: boolean }) {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window === "undefined") {
      return "bookmark";
    }

    const savedTab = localStorage.getItem(STORAGE_KEY);

    if (
      savedTab === "archive" ||
      savedTab === "bookmark" ||
      savedTab === "system"
    ) {
      return savedTab;
    }

    return "bookmark";
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: "archive", label: "Archive" },
    { id: "bookmark", label: "Bookmark" },
    { id: "system", label: "System" },
  ];

  // Save active tab
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeTab);
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-950 text-white rounded-xl">

      {/* Tabs Header */}
      <div className="flex items-center overflow-x-auto border-b border-zinc-800 no-scrollbar">
        {tabs.map((tab) => {
          const isTabActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${
                isTabActive
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}

              {isTabActive && (
                <span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === "archive" && (
          <Archive isActive={isActive} />
        )}

        {activeTab === "bookmark" && (
          <Bookmark isActive={isActive} />
        )}

        {activeTab === "system" && (
          <div className="text-sm text-zinc-400">
            System content goes here...
          </div>
        )}
      </div> 
    </div>
  );
}

export default Details;