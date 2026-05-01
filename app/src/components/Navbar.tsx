"use client";

import { LogoutButton } from "@/app/auth/logout/page";
import { Bell, User2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Navbar() {

  const router = useRouter();

  return (
    <div className="flex justify-between items-center border-b px-2 md:px-4">
      {/* logo */}
      <div onClick={()=>router.push('/dashboard')} className="relative h-10 w-[20%] md:h-15 flex justify-start overflow-hidden">
        {/* Image */}
        <Image
          src="/devflow-logo.png"
          alt="logo"
          fill
          className="object-contain cursor-pointer hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
        />

        {/* Shine */}
        <div className="pointer-events-none absolute inset-0">
          <div className="shine absolute top-0 left-[-100%] h-full w-1 bg-gradient-to-r from-transparent via-blue-800/40 to-transparent"></div>
        </div>

        {/* Local CSS */}
        <style jsx>{`
          .shine {
            animation: shineMove 5s linear infinite;
          }

          @keyframes shineMove {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}</style>
      </div>
      {/* right side */}
      <div className="flex justify-between items-center w-[10%]" >
        {/* notification */}
        <div>
          <Bell size={30} />
        </div>
        <div>
          <LogoutButton/>
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
