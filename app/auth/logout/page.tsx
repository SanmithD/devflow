"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export function LogoutButton() {

    const handleLogout = async() => {
        try {
            await signOut({ callbackUrl: "/auth/login" });

            // await axios.post('/api/auth/logout');

            toast.success('Account Logged out')
        } catch (error) {
            console.log('server error', error);
            toast.error('Fail to logout')
        }
    }
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-black text-white rounded"
    >
      Logout
    </button>
  );
}