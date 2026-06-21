"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getAuthUser } from "../lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "ADMIN":
        router.replace("/admin");
        break;
      case "STORE_OWNER":
        router.replace("/owner");
        break;
      case "USER":
        router.replace("/user");
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#090d16] text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Redirecting to your workspace...
        </p>
      </div>
    </div>
  );
}
