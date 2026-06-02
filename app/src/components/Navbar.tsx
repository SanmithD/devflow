"use client";

import { LogoutButton } from "@/app/auth/logout/page";
import { Bell, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserType } from "../types/profile.type";

function Navbar({ user }: { user: UserType | null }) {
  const router = useRouter();
  
  console.log("image", user?.image);

  return (
    <div className="flex justify-between items-center border-b border-b-gray-800 px-2 md:px-4">
      {/* logo */}
      <div
        onClick={() => router.push("/dashboard")}
        className="relative h-10 w-[20%] md:h-15 flex justify-start overflow-hidden"
      >
        {/* Image */}
        <Image
          src="/devflow-logo.png"
          alt="logo"
          fill
          className="object-contain"
        />
      </div>
      {/* right side */}
      <div className="flex justify-between items-center w-[15%]">
        {/* notification */}
        <div>
          <Bell size={30} />
        </div>
        <div>
          <LogoutButton />
        </div>
        {/* profile */}
        <div
          className="
  relative 
  w-8 h-8 
  md:w-10 md:h-10
  rounded-full 
  overflow-hidden 
  border border-gray-700 
  flex items-center justify-center
  cursor-pointer
  hover:border-emerald-400
  hover:border-2
"
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
      </div>
    </div>
  );
}

export default Navbar;
