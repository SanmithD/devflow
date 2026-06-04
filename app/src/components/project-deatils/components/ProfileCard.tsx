"use client";

import { UserType } from "@/app/src/types/profile.type";
import {
    AlertCircle,
    Calendar,
    Camera,
    CheckCircle,
    Crown,
    Mail,
    User,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export default function ProfileCard({ user }: { user: UserType | null }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.user_name ?? "");
  const [avatarSrc, setAvatarSrc] = useState(user?.image ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("image", avatarSrc);
  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  }, []);

  const handleSave = async () => {
    // TODO: call your PATCH /api/user endpoint here
    setEditMode(false);
  };

  const plan = user?.subscription_plan
    ? user.subscription_plan.charAt(0).toUpperCase() +
      user.subscription_plan.slice(1)
    : "Free";

  if (!user) return <p>not found</p>;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-full">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className={`relative flex items-center justify-center w-24 h-24 rounded-full border-2 overflow-hidden
            ${editMode ? "cursor-pointer border-white/20" : "border-white/10"}
            ${isDragging ? "border-blue-400" : ""}
          `}
          onClick={() => editMode && fileInputRef.current?.click()}
          onDragOver={(e) => {
            if (editMode) {
              e.preventDefault();
              setIsDragging(true);
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={editMode ? handleDrop : undefined}
        >
          {avatarSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={avatarSrc}
                alt="Profile"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-xl font-medium text-white/60">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {editMode && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
              <Camera size={20} className="text-white" />
            </div>
          )}
        </div>
        {editMode && (
          <p className="text-xs text-white/40">
            Drop image here or click to upload
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
        />
        <span className="text-lg font-medium text-white">
          {name || user?.email}
        </span>
      </div>

      {/* Fields */}
      <div className="border border-white/10 rounded-xl overflow-hidden mb-6">
        {/* Name */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <User size={16} className="text-white/30 shrink-0" />
          <span className="text-xs text-white/50 w-20 shrink-0">Name</span>
          {editMode ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none"
              placeholder="Full name"
            />
          ) : (
            <span className="flex-1 text-sm text-white">{name || "—"}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Mail size={16} className="text-white/30 shrink-0" />
          <span className="text-xs text-white/50 w-20 shrink-0">Email</span>
          <span className="flex-1 text-sm text-white/70">{user?.email}</span>
          {user?.emailVerified ? (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> Verified
            </span>
          ) : (
            <button className="flex items-center gap-1 text-xs text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full hover:bg-amber-400/10 transition-colors">
              <AlertCircle size={11} /> Verify
            </button>
          )}
        </div>

        {/* Plan */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Crown size={16} className="text-white/30 shrink-0" />
          <span className="text-xs text-white/50 w-20 shrink-0">Plan</span>
          <span className="flex-1 text-sm text-white">{plan}</span>
          <button className="text-xs border border-white/20 text-white/70 px-3 py-0.5 rounded-full hover:bg-white/5 transition-colors">
            Upgrade
          </button>
        </div>

        {/* Joined */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Calendar size={16} className="text-white/30 shrink-0" />
          <span className="text-xs text-white/50 w-20 shrink-0">
            Member since
          </span>
          <span className="flex-1 text-sm text-white/70">{joinedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="px-5 py-2 text-sm border border-white/20 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm bg-white text-black rounded-lg font-medium hover:opacity-85 transition-opacity"
            >
              Save changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-5 py-2 text-sm border border-white/20 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
          >
            Edit profile
          </button>
        )}
      </div>
    </div>
  );
}
