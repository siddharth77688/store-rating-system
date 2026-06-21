"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getAuthToken, getAuthUser } from "../../lib/api";
import Navbar from "../../components/Navbar";
import StarRating from "../../components/StarRating";
import { 
  BarChart, Star, Users, ShieldAlert, Loader2, Lock, Eye, EyeOff
} from "lucide-react";

export default function OwnerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeDetail, setStoreDetail] = useState<any>(null);
  const [noStoreError, setNoStoreError] = useState(false);

  // Settings Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "ratings" | "settings">("analytics");

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token || !user || user.role !== "STORE_OWNER") {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
    loadStoreDashboard();
  }, [router]);

  const loadStoreDashboard = async () => {
    setLoading(true);
    setNoStoreError(false);
    try {
      const response = await api.get("/owner/dashboard");
      if (response.success && response.data) {
        setStoreDetail(response.data);
      }
    } catch (e: any) {
      if (e.message && e.message.includes("No store associated")) {
        setNoStoreError(true);
      }
      console.error(e);
    } finally {
      setLoading(false);
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
        setPasswordStatus({ type: "success", msg: "Password changed successfully!" });
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
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading store statistics...</p>
          </div>
        ) : noStoreError ? (
          /*  NO STORE ASSIGNED STATE*/
          <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
            <div className="bg-rose-500/10 p-4 rounded-3xl inline-block border border-rose-500/20">
              <ShieldAlert className="w-12 h-12 text-rose-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-100">No Store Assigned Yet</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Your store owner account is registered, but it has not been associated with any business outlet yet. 
              Please contact the system administrator to link your store.
            </p>
            <div className="pt-4">
              <button
                onClick={loadStoreDashboard}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Check Association Status
              </button>
            </div>
          </div>
        ) : (
          /*  ACTIVE STATE WITH ASSOCIATED STORE */
          <>
            {/* Store Information Banner */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40"></div>
              
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest font-mono">
                  Store Owner Dashboard
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {storeDetail?.store.name}
                </h1>
                <p className="text-sm text-slate-400">
                  📍 {storeDetail?.store.address}
                </p>
                <p className="text-xs text-slate-500">
                  ✉️ {storeDetail?.store.email}
                </p>
              </div>

              {/* Aggregated ratings display */}
              <div className="flex items-center space-x-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                <div className="text-center">
                  <div className="flex items-center space-x-1 justify-center">
                    <span className="text-3xl font-black text-amber-400">
                      {storeDetail?.store.overallRating.toFixed(1)}
                    </span>
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium block mt-1">
                    Overall Rating
                  </span>
                </div>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-200">
                    {storeDetail?.store.totalRatings}
                  </span>
                  <span className="text-xs text-slate-400 font-medium block mt-1">
                    Total Reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="border-b border-white/5 flex space-x-6 text-sm font-semibold">
              <button
                onClick={() => setActiveSubTab("analytics")}
                className={`pb-4 transition relative cursor-pointer ${
                  activeSubTab === "analytics" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Analytics & Distribution
                {activeSubTab === "analytics" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab("ratings")}
                className={`pb-4 transition relative cursor-pointer ${
                  activeSubTab === "ratings" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Rating Submissions ({storeDetail?.ratings.length})
                {activeSubTab === "ratings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab("settings")}
                className={`pb-4 transition relative cursor-pointer ${
                  activeSubTab === "settings" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Account Security Settings
                {activeSubTab === "settings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
                )}
              </button>
            </div>

            {/* Sub Tab Panel Content */}
            <div className="space-y-6">
              {activeSubTab === "analytics" && (
                /*  ANALYTICS SUB TAB */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Rating Distribution Card */}
                  <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2 mb-6">
                      <BarChart className="w-5 h-5 text-indigo-400" />
                      <span>Rating Distribution</span>
                    </h3>

                    <div className="space-y-4">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = storeDetail?.ratingsDistribution[stars] || 0;
                        const percentage = storeDetail?.store.totalRatings > 0 
                          ? (count / storeDetail?.store.totalRatings) * 100 
                          : 0;

                        return (
                          <div key={stars} className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1 w-12 text-slate-400 font-medium">
                              <span>{stars}</span>
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            </div>
                            <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-12 text-right font-mono text-slate-400 font-semibold">
                              {count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary card */}
                  <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2 mb-4">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <span>Audience Overview</span>
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mt-2">
                        Get metrics of how customers interact with your branch. Each customer accounts for exactly one vote. 
                        They can modify their stars value anytime which updates your summary average immediately.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-center">
                        <span className="text-xs text-slate-500 font-semibold uppercase block">Store Code</span>
                        <span className="text-lg font-mono font-bold text-slate-300 mt-1 block">#00{storeDetail?.store.id}</span>
                      </div>
                      <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-center">
                        <span className="text-xs text-slate-500 font-semibold uppercase block">Status</span>
                        <span className="text-lg font-semibold text-emerald-400 mt-1 block">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === "ratings" && (
                /*  RATINGS SUB TAB  */
                <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                  {storeDetail?.ratings.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 text-sm">
                      No ratings have been submitted for your store yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-slate-950/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Customer Name</th>
                            <th className="py-4 px-6">Customer Email</th>
                            <th className="py-4 px-6">Rating Value</th>
                            <th className="py-4 px-6">Submitted Date</th>
                            <th className="py-4 px-6">Customer Address</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {storeDetail?.ratings.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-900/40 transition">
                              <td className="py-4 px-6 font-semibold text-slate-200">{item.userName}</td>
                              <td className="py-4 px-6 text-slate-400">{item.email || "N/A (user1@storerating.com)"}</td>
                              <td className="py-4 px-6">
                                <StarRating rating={item.rating} size="sm" />
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                                Boston, MA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === "settings" && (
                /*  PASSWORD CHANGE SETTINGS  */
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}
