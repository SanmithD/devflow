"use client";

import LogoutButton from "@/app/auth/logout/page";
import { Bell, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UserType } from "../types/profile.type";
import ProfileCard from "./project-deatils/components/ProfileCard";

function Navbar({ user }: { user: UserType | null }) {
  const router = useRouter();
  const [profileVisible, setProfileVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileVisible(false);
      }
    };
    if (profileVisible)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileVisible]);

  return (
    <div className="flex justify-between items-center border-b border-b-gray-800 px-2 md:px-4">
      {/* Logo */}
      <div
        onClick={() => router.push("/dashboard")}
        className="relative h-10 w-[20%] md:h-15 flex justify-start overflow-hidden cursor-pointer"
      >
        <Image
          src="/devflow-logo.png"
          alt="logo"
          fill
          className="object-contain"
        />
      </div>

      {/* Right side */}
      <div className="flex justify-between items-center w-[15%]">
        <div>
          <Bell size={30} />
        </div>
        <div>
          <LogoutButton />
        </div>

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="
    relative
    w-8 h-8 md:w-10 md:h-10
    rounded-full overflow-hidden
    border border-gray-700
    flex items-center justify-center
  "
            onClick={() => setProfileVisible(!profileVisible)}
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="profile"
                fill
                className="object-cover"
              />
            ) : (
              <User2Icon size={20} />
            )}
          </div>

          {/* Dropdown */}
          {profileVisible && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
              <ProfileCard user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
