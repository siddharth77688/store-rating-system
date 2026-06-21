"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getAuthToken, getAuthUser } from "../../lib/api";
import Navbar from "../../components/Navbar";
import { 
  Users as UsersIcon, Store as StoreIcon, Star, Plus, Search, 
  ChevronLeft, ChevronRight, Loader2, ArrowUpDown, UserPlus, FolderPlus
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<"users" | "stores">("users");

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    adminCount: 0,
    storeOwnerCount: 0,
    normalUserCount: 0,
  });

  // Users Tab Table State
  const [usersData, setUsersData] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersFilter, setUsersFilter] = useState({ name: "", email: "", role: "" });
  const [usersSort, setUsersSort] = useState({ field: "id", order: "asc" });

  // Stores Tab Table State
  const [storesData, setStoresData] = useState<any[]>([]);
  const [storesPage, setStoresPage] = useState(0);
  const [storesTotalPages, setStoresTotalPages] = useState(0);
  const [storesFilter, setStoresFilter] = useState({ name: "", email: "", address: "" });
  const [storesSort, setStoresSort] = useState({ field: "id", order: "asc" });

  // Modals Open State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Add User Form State
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", address: "", role: "USER" });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userFormLoading, setUserFormLoading] = useState(false);

  // Add Store Form State
  const [storeForm, setStoreForm] = useState({ name: "", email: "", address: "", ownerId: "" });
  const [storeOwners, setStoreOwners] = useState<any[]>([]);
  const [storeFormError, setStoreFormError] = useState<string | null>(null);
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  // Verify Admin Auth
  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (!token || !user || user.role !== "ADMIN") {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    }
  };

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      let url = `/admin/users?page=${usersPage}&size=5&sort=${usersSort.field}&order=${usersSort.order}`;
      if (usersFilter.name) url += `&name=${encodeURIComponent(usersFilter.name)}`;
      if (usersFilter.email) url += `&email=${encodeURIComponent(usersFilter.email)}`;
      if (usersFilter.role) url += `&role=${encodeURIComponent(usersFilter.role)}`;

      const response = await api.get(url);
      if (response.success && response.data) {
        setUsersData(response.data.content);
        setUsersTotalPages(response.data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  }, [usersPage, usersFilter, usersSort]);

  // Fetch Stores
  const fetchStores = useCallback(async () => {
    try {
      let url = `/admin/stores?page=${storesPage}&size=5&sort=${storesSort.field}&order=${storesSort.order}`;
      if (storesFilter.name) url += `&name=${encodeURIComponent(storesFilter.name)}`;
      if (storesFilter.email) url += `&email=${encodeURIComponent(storesFilter.email)}`;
      if (storesFilter.address) url += `&address=${encodeURIComponent(storesFilter.address)}`;

      const response = await api.get(url);
      if (response.success && response.data) {
        setStoresData(response.data.content);
        setStoresTotalPages(response.data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch stores", e);
    }
  }, [storesPage, storesFilter, storesSort]);

  // Load store owners dropdown list
  const loadStoreOwners = async () => {
    try {
      const response = await api.get("/admin/users?role=STORE_OWNER&size=100");
      if (response.success && response.data) {
        setStoreOwners(response.data.content);
      }
    } catch (e) {
      console.error("Failed to fetch store owners list", e);
    }
  };

  // Trigger loading data based on active tab
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      if (activeTab === "users") {
        fetchUsers().then(() => setLoading(false));
      } else {
        fetchStores().then(() => setLoading(false));
        loadStoreOwners();
      }
    }
  }, [currentUser, activeTab, fetchUsers, fetchStores]);

  // Sorting handlers
  const handleUserSort = (field: string) => {
    const order = usersSort.field === field && usersSort.order === "asc" ? "desc" : "asc";
    setUsersSort({ field, order });
    setUsersPage(0);
  };

  const handleStoreSort = (field: string) => {
    const order = storesSort.field === field && storesSort.order === "asc" ? "desc" : "asc";
    setStoresSort({ field, order });
    setStoresPage(0);
  };

  // Add User Form Submission
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    // Validation
    if (userForm.name.length < 20 || userForm.name.length > 60) {
      setUserFormError("Name must be between 20 and 60 characters.");
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,16}$/;
    if (!passwordRegex.test(userForm.password)) {
      setUserFormError("Password must be 8-16 characters and contain 1 uppercase letter and 1 special character.");
      return;
    }
    if (userForm.address.length > 400) {
      setUserFormError("Address must not exceed 400 characters.");
      return;
    }

    setUserFormLoading(true);
    try {
      const response = await api.post("/admin/users", userForm);
      if (response.success) {
        setIsUserModalOpen(false);
        setUserForm({ name: "", email: "", password: "", address: "", role: "USER" });
        fetchUsers();
        fetchStats();
      } else {
        setUserFormError(response.message || "Failed to create user.");
      }
    } catch (err: any) {
      setUserFormError(err.message || "Email address is already registered.");
    } finally {
      setUserFormLoading(false);
    }
  };

  // Add Store Form Submission
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreFormError(null);

    if (storeForm.name.length > 100) {
      setStoreFormError("Store name must not exceed 100 characters.");
      return;
    }
    if (storeForm.address.length > 400) {
      setStoreFormError("Address must not exceed 400 characters.");
      return;
    }

    setStoreFormLoading(true);
    try {
      const response = await api.post("/admin/stores", {
        name: storeForm.name,
        email: storeForm.email,
        address: storeForm.address,
        ownerId: storeForm.ownerId ? parseInt(storeForm.ownerId) : null,
      });

      if (response.success) {
        setIsStoreModalOpen(false);
        setStoreForm({ name: "", email: "", address: "", ownerId: "" });
        fetchStores();
        fetchStats();
      } else {
        setStoreFormError(response.message || "Failed to create store.");
      }
    } catch (err: any) {
      setStoreFormError(err.message || "An error occurred. Check email or inputs.");
    } finally {
      setStoreFormLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090d16] text-slate-100">
      <Navbar user={currentUser} />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              System Admin Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage accounts, stores, roles, and platform health metrics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-500/10 font-medium text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-white/10 text-slate-200 px-4 py-2.5 rounded-xl transition cursor-pointer font-medium text-sm"
            >
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Add Store</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-white/5 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500 opacity-20"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Total Users
              </span>
              <div className="bg-indigo-500/10 p-2.5 rounded-xl">
                <UsersIcon className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">{stats.totalUsers}</span>
              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 font-mono">
                <span>Admin: {stats.adminCount}</span>
                <span>Owner: {stats.storeOwnerCount}</span>
                <span>User: {stats.normalUserCount}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-white/5 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 opacity-20"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Total Stores
              </span>
              <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                <StoreIcon className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">{stats.totalStores}</span>
              <p className="text-xs text-slate-500 mt-2">
                Registered physical outlets
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden border border-white/5 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 opacity-20"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Total Ratings
              </span>
              <div className="bg-amber-500/10 p-2.5 rounded-xl">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">{stats.totalRatings}</span>
              <p className="text-xs text-slate-500 mt-2">
                User ratings submitted overall
              </p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="border-b border-white/5 flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 transition relative cursor-pointer ${
              activeTab === "users" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Users Directory
            {activeTab === "users" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`pb-4 transition relative cursor-pointer ${
              activeTab === "stores" ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Stores Directory
            {activeTab === "stores" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500"></span>
            )}
          </button>
        </div>

        {/* Content Tab Panel */}
        <div className="space-y-6">
          {activeTab === "users" ? (
            /*  USERS TAB */
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={usersFilter.name}
                    onChange={(e) => {
                      setUsersFilter({ ...usersFilter, name: e.target.value });
                      setUsersPage(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by email..."
                    value={usersFilter.email}
                    onChange={(e) => {
                      setUsersFilter({ ...usersFilter, email: e.target.value });
                      setUsersPage(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={usersFilter.role}
                    onChange={(e) => {
                      setUsersFilter({ ...usersFilter, role: e.target.value });
                      setUsersPage(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">USER</option>
                    <option value="STORE_OWNER">STORE OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setUsersFilter({ name: "", email: "", role: "" });
                      setUsersPage(0);
                    }}
                    className="text-xs text-slate-500 hover:text-indigo-400 font-semibold transition cursor-pointer"
                  >
                    Clear Filter Filters
                  </button>
                </div>
              </div>

              {/* Table User List */}
              <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : usersData.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 text-sm">
                    No users matching criteria found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleUserSort("id")}>
                            <div className="flex items-center space-x-1">
                              <span>ID</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleUserSort("name")}>
                            <div className="flex items-center space-x-1">
                              <span>Name</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleUserSort("email")}>
                            <div className="flex items-center space-x-1">
                              <span>Email</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleUserSort("role")}>
                            <div className="flex items-center space-x-1">
                              <span>Role</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usersData.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-mono text-xs text-slate-400">{user.id}</td>
                            <td className="py-4 px-6 font-semibold text-slate-200">{user.name}</td>
                            <td className="py-4 px-6 text-slate-400">{user.email}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  user.role === "ADMIN"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : user.role === "STORE_OWNER"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{user.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500 py-2">
                  <span>Page {usersPage + 1} of {usersTotalPages}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setUsersPage(Math.max(0, usersPage - 1))}
                      disabled={usersPage === 0}
                      className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUsersPage(Math.min(usersTotalPages - 1, usersPage + 1))}
                      disabled={usersPage === usersTotalPages - 1}
                      className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /*  STORES TAB  */
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={storesFilter.name}
                    onChange={(e) => {
                      setStoresFilter({ ...storesFilter, name: e.target.value });
                      setStoresPage(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by email..."
                    value={storesFilter.email}
                    onChange={(e) => {
                      setStoresFilter({ ...storesFilter, email: e.target.value });
                      setStoresPage(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filter by address..."
                    value={storesFilter.address}
                    onChange={(e) => {
                      setStoresFilter({ ...storesFilter, address: e.target.value });
                      setStoresPage(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setStoresFilter({ name: "", email: "", address: "" });
                      setStoresPage(0);
                    }}
                    className="text-xs text-slate-500 hover:text-indigo-400 font-semibold transition cursor-pointer"
                  >
                    Clear Filter Filters
                  </button>
                </div>
              </div>

              {/* Table Store List */}
              <div className="glass rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                {loading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : storesData.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 text-sm">
                    No stores matching criteria found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-950/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleStoreSort("id")}>
                            <div className="flex items-center space-x-1">
                              <span>ID</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleStoreSort("name")}>
                            <div className="flex items-center space-x-1">
                              <span>Store Name</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleStoreSort("email")}>
                            <div className="flex items-center space-x-1">
                              <span>Store Email</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6">Owner</th>
                          <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleStoreSort("overallRating")}>
                            <div className="flex items-center space-x-1">
                              <span>Rating</span>
                              <ArrowUpDown className="w-3 h-3 opacity-60" />
                            </div>
                          </th>
                          <th className="py-4 px-6">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {storesData.map((store) => (
                          <tr key={store.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-4 px-6 font-mono text-xs text-slate-400">{store.id}</td>
                            <td className="py-4 px-6 font-semibold text-slate-200">{store.name}</td>
                            <td className="py-4 px-6 text-slate-400">{store.email}</td>
                            <td className="py-4 px-6">
                              {store.owner ? (
                                <div className="text-slate-200">
                                  <span>{store.owner.name}</span>
                                  <span className="block text-[10px] text-slate-500">{store.owner.email}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 italic">No Owner Assigned</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1.5">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-amber-400 text-sm">{store.overallRating.toFixed(1)}</span>
                                <span className="text-xs text-slate-500">({store.totalRatings})</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-400 max-w-xs truncate">{store.address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {storesTotalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500 py-2">
                  <span>Page {storesPage + 1} of {storesTotalPages}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setStoresPage(Math.max(0, storesPage - 1))}
                      disabled={storesPage === 0}
                      className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStoresPage(Math.min(storesTotalPages - 1, storesPage + 1))}
                      disabled={storesPage === storesTotalPages - 1}
                      className="p-2 border border-white/5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/*  ADD USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-3xl p-8 relative overflow-hidden border border-white/5 animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-6">
              Create New Account
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              {userFormError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center">
                  {userFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Min 20 characters"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Password</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="8-16 chars, 1 uppercase..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Assign Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USER">USER (Normal User)</option>
                    <option value="STORE_OWNER">STORE_OWNER (Store Owner)</option>
                    <option value="ADMIN">ADMIN (System Admin)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Address</label>
                <textarea
                  required
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500 h-20 resize-none"
                  placeholder="Max 400 characters address..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-white/5 rounded-xl hover:bg-slate-900 transition text-sm text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  {userFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  ADD STORE MODAL */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-3xl p-8 relative overflow-hidden border border-white/5 animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-6">
              Register New Store
            </h3>

            <form onSubmit={handleAddStore} className="space-y-4">
              {storeFormError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center">
                  {storeFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="SuperMart, Inc."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block">Store Email</label>
                  <input
                    type="email"
                    required
                    value={storeForm.email}
                    onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="store@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Assign Store Owner</label>
                <select
                  value={storeForm.ownerId}
                  onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Leave Unassigned (Optional) --</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Store Location Address</label>
                <textarea
                  required
                  value={storeForm.address}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-slate-100 placeholder-slate-700 text-sm focus:outline-none focus:border-indigo-500 h-24 resize-none"
                  placeholder="Street details, city, state..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-4 py-2 border border-white/5 rounded-xl hover:bg-slate-900 transition text-sm text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={storeFormLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  {storeFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Register Store</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
