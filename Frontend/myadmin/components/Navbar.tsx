"use client";

import React from "react";
import { logout } from "../lib/api";
import { LogOut, Store, Shield, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4 text-rose-400" />;
      case "STORE_OWNER":
        return <Store className="w-4 h-4 text-emerald-400" />;
      default:
        return <UserIcon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "STORE_OWNER":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
  };

  return (
    <nav className="glass sticky top-0 z-40 w-full border-b border-white/5 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/25">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            StoreRating
          </span>
          <span className="hidden sm:inline-block text-xs ml-2 text-slate-500 font-mono">
            v1.0
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-200">
                {user.name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center space-x-1 uppercase ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleIcon(user.role)}
                <span className="ml-1">{user.role.replace("_", " ")}</span>
              </span>
            </div>
            <span className="text-xs text-slate-400">{user.email}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 hover:bg-rose-500/5 px-4 py-2 rounded-xl transition duration-200 cursor-pointer shadow-sm text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
