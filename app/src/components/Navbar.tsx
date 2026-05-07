"use client";

import { LogoutButton } from "@/app/auth/logout/page";
import { Bell, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Navbar() {
  const router = useRouter();

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
      <div className="flex justify-between items-center w-[10%]">
        {/* notification */}
        <div>
          <Bell size={30} />
        </div>
        <div>
          <LogoutButton />
        </div>
        {/* profile */}
        <div>
          <User2Icon size={30} />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
