"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getAuthToken, getAuthUser } from "../../lib/api";
import Navbar from "../../components/Navbar";
import StarRating from "../../components/StarRating";
import { 
  Search, Loader2, Star, MapPin, Mail, ChevronLeft, ChevronRight, Lock
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stores data
  const [stores, setStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Sub Tab
  const [activeSubTab, setActiveSubTab] = useState<"stores" | "settings">("stores");

  // Settings Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token || !user || user.role !== "USER") {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/stores?page=${page}&size=6&sort=${sortBy}&order=${sortOrder}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await api.get(url);
      if (response.success && response.data) {
        setStores(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    if (currentUser && activeSubTab === "stores") {
      loadStores();
    }
  }, [currentUser, activeSubTab, loadStores]);

  const handleRateStore = async (storeId: number, ratingValue: number) => {
    try {
      const response = await api.post("/ratings", { storeId, rating: ratingValue });
      if (response.success) {
        // Refresh stores list to display updated stats and user's rating
        loadStores();
      }
    } catch (e: any) {
      alert(e.message || "Failed to submit rating.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordStatus({
        type: "error",
        msg: "New password must be 8-16 characters and contain at least one uppercase letter and one special character.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.put("/users/password", { oldPassword, newPassword });
      if (response.success) {
        setPasswordStatus({ type: "success", msg: "Password updated successfully!" });
        setOldPassword("");
        setNewPassword("");
      } else {
        setPasswordStatus({ type: "error", msg: response.message || "Failed to update password." });
      }
    } catch (err: any) {
      setPasswordStatus({ type: "error", msg: err.message || "Incorrect old password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090d16] text-slate-100">
      <Navbar user={currentUser} />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Browse Registered Stores
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Find, view, and submit interactive ratings for local businesses.
            </p>
          </div>

          <div className="border-b border-white/5 md:border-none flex space-x-6 text-sm font-semibold">
            <button
              onClick={() => setActiveSubTab("stores")}
              className={`pb-2 md:pb-0 transition relative cursor-pointer ${
                activeSubTab === "stores" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stores Listing
              {activeSubTab === "stores" && (
                <span className="md:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`pb-2 md:pb-0 transition relative cursor-pointer ${
                activeSubTab === "settings" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Security Settings
              {activeSubTab === "settings" && (
                <span className="md:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
              )}
            </button>
          </div>
        </div>

        {activeSubTab === "stores" ? (
          /*  STORES TAB */
          <div className="space-y-6">
            {/* Search and Sorting */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
              <div className="relative w-full sm:max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search stores by name or address..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-semibold uppercase">Sort By:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                    setPage(0);
                  }}
                  className="px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="id-asc">Default (ID)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="overallRating-desc">Highest Rated</option>
                  <option value="overallRating-asc">Lowest Rated</option>
                  <option value="totalRatings-desc">Most Reviewed</option>
                </select>
              </div>
            </div>

            {/* Grid of Stores */}
            {loading ? (
              <div className="py-40 flex justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : stores.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                No stores found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="glass rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between glass-hover group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent group-hover:via-indigo-500 transition duration-300"></div>
                    
                    <div className="space-y-4">
                      {/* Name & Code */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-xl text-slate-100 group-hover:text-indigo-300 transition duration-200">
                            {store.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono">CODE: #00{store.id}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-white/5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-amber-400 text-xs">{store.overallRating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-500">({store.totalRatings})</span>
                        </div>
                      </div>

                      {/* Location details */}
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <p className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{store.address}</span>
                        </p>
                        <p className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{store.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Interactive Rating Segment */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-col items-center space-y-2 bg-slate-950/30 p-3 rounded-2xl">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        {store.userRating !== null ? "Your Active Rating" : "Rate this Store"}
                      </span>
                      <StarRating
                        rating={store.userRating || 0}
                        interactive={true}
                        onRatingChange={(val) => handleRateStore(store.id, val)}
                        size="md"
                      />
                      {store.userRating !== null && (
                        <span className="text-[10px] text-indigo-400 font-medium">
                          You rated {store.userRating} Stars (click to change)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-slate-500 py-2">
                <span>Page {page + 1} of {totalPages}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /*  SETTINGS TAB  */
          <div className="max-w-md glass rounded-3xl p-8 border border-white/5 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <span>Update Password</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Improve security by updating your login credentials.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordStatus && (
                <div
                  className={`text-sm p-3 rounded-xl border text-center ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {passwordStatus.msg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Old Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-white/5 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-white/5 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 cursor-pointer text-sm shadow-lg shadow-indigo-500/10"
              >
                {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
