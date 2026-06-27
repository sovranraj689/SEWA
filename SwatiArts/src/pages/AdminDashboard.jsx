import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../components/Navbar";

/* ─── Constants ─────────────────────────────────────────── */
const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-100 text-amber-800 border border-amber-200"   },
  approved:    { label: "Approved",    color: "bg-orange-100 text-orange-800 border border-orange-200" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 border border-blue-200"       },
  completed:   { label: "Completed",   color: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  cancelled:   { label: "Cancelled",   color: "bg-rose-100 text-rose-800 border border-rose-200"       },
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const API_BASE = () => import.meta.env.VITE_API_URL || "";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ═══════════════════════════════════════════════════════════
   CUSTOMER MESSAGES PANEL (unchanged)
═══════════════════════════════════════════════════════════ */
function CustomerMessagesPanel() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId]   = useState(null);
  const [filter, setFilter]           = useState("all");

  const fetchMessages = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(
        `${API_BASE()}/api/contact${filter === "unread" ? "?unreadOnly=true" : ""}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) { setError(err.message); setMessages([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const iv = setInterval(fetchMessages, 30000);
    return () => clearInterval(iv);
  }, [filter]);

  const handleExpand = async (msg) => {
    const next = expandedId === msg._id ? null : msg._id;
    setExpandedId(next);
    if (next && !msg.isRead) {
      try {
        await fetch(`${API_BASE()}/api/contact/${msg._id}/read`, { method: "PUT", headers: authHeaders() });
        setMessages((p) => p.map((m) => m._id === msg._id ? { ...m, isRead: true } : m));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE()}/api/contact/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to delete");
      setMessages((p) => p.filter((m) => m._id !== id));
      toast.success("Message deleted");
    } catch (err) { toast.error(err.message); }
  };

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            Customer Messages
            {unreadCount > 0 && (
              <span className="bg-[#C9943A] text-white text-[11px] font-bold rounded-full px-2 py-0.5 leading-none">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-500">Submissions from the contact form, received live</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-200/40 p-1 rounded-xl border border-stone-200/40 text-xs font-semibold">
            {["all","unread"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${filter===f?"bg-white text-stone-900 shadow-sm":"text-stone-500 hover:text-stone-900"}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchMessages} title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200/60 bg-white text-stone-500 hover:text-[#C9943A] hover:border-[#C9943A]/40 transition-all text-sm">
            ↻
          </button>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-400 font-serif italic">Loading messages…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center px-6">
            <p className="text-sm text-rose-600 mb-3">⚠ {error}</p>
            <button onClick={fetchMessages} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-4 py-2 rounded-lg">Try Again</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="text-3xl mb-2">📬</div>
            <p className="text-sm font-bold text-stone-700">No messages yet</p>
            <p className="text-xs text-stone-400 mt-1">Customer messages will appear here as they come in.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-[480px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isOpen = expandedId === msg._id;
                return (
                  <motion.div key={msg._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    className="px-5 py-4 cursor-pointer hover:bg-amber-50/30 transition-colors" onClick={() => handleExpand(msg)}>
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center text-xs font-bold text-amber-800">
                          {msg.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        {!msg.isRead && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C9943A] ring-2 ring-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${!msg.isRead ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>{msg.name}</span>
                          <span className="text-[11px] text-stone-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <p className="text-xs text-stone-400 truncate">{msg.email}{msg.phone ? ` • ${msg.phone}` : ""}</p>
                        <p className={`text-sm mt-1 ${isOpen?"":"truncate"} text-stone-600`}>{msg.message}</p>
                        {isOpen && (
                          <motion.div initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} className="flex gap-2 mt-3">
                            <a href={`mailto:${msg.email}`} onClick={(e)=>e.stopPropagation()}
                              className="text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors">
                              Reply by Email
                            </a>
                            <button onClick={(e)=>handleDelete(msg._id,e)}
                              className="text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALL USERS PANEL  — new
   Fetches GET /api/admin/users
   Expects: { users: [{ _id, name, email, phone, isAdmin, createdAt, orderCount, lastActive }] }
═══════════════════════════════════════════════════════════ */
function UsersPanel() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("all"); // "all" | "customers" | "admins"
  const [sortBy, setSortBy]     = useState("newest"); // "newest" | "orders" | "name"
  const [expandedId, setExpanded] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE()}/api/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || (roleFilter === "admins" ? u.isAdmin : !u.isAdmin);
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "orders") return (b.orderCount || 0) - (a.orderCount || 0);
      if (sortBy === "name")   return (a.name || "").localeCompare(b.name || "");
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            All Users
            <span className="bg-stone-100 text-stone-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {users.length} total
            </span>
          </h2>
          <p className="text-xs text-stone-500">Every registered account on the platform</p>
        </div>
        <button onClick={fetchUsers} title="Refresh"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200/60 bg-white text-stone-500 hover:text-[#C9943A] hover:border-[#C9943A]/40 transition-all text-sm">
          ↻
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200/60 bg-white focus:outline-none focus:border-[#C9943A]/50 focus:ring-2 focus:ring-[#C9943A]/10 text-stone-700"
          />
        </div>

        {/* Role filter */}
        <div className="flex bg-stone-200/40 p-1 rounded-xl border border-stone-200/40 text-xs font-semibold">
          {[["all","All"],["customers","Customers"],["admins","Admins"]].map(([v,l]) => (
            <button key={v} onClick={() => setRole(v)}
              className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter===v?"bg-white text-stone-900 shadow-sm":"text-stone-500 hover:text-stone-900"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="text-xs border border-stone-200/60 bg-white rounded-xl px-3 py-2 text-stone-600 focus:outline-none focus:border-[#C9943A]/50">
          <option value="newest">Newest first</option>
          <option value="orders">Most orders</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-400 font-serif italic">Loading users…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center px-6">
            <p className="text-sm text-rose-600 mb-3">⚠ {error}</p>
            <button onClick={fetchUsers} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-4 py-2 rounded-lg">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm font-bold text-stone-700">{search ? "No users match your search" : "No users yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/60 text-stone-500 text-[11px] tracking-wider uppercase font-semibold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 pr-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="text-sm text-stone-700 divide-y divide-stone-100">
                <AnimatePresence>
                  {filtered.map((u) => {
                    const isOpen = expandedId === u._id;
                    const initials = u.name?.split(" ").map((w)=>w[0]).slice(0,2).join("").toUpperCase() || "?";
                    return (
                      <>
                        <tr key={u._id}
                          className="hover:bg-amber-50/20 transition-colors cursor-pointer group"
                          onClick={() => setExpanded(isOpen ? null : u._id)}>
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center text-[11px] font-bold text-amber-800 shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-semibold text-stone-900 text-sm leading-tight">{u.name || "—"}</div>
                                <div className="text-[11px] text-stone-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-stone-500 text-xs">{u.phone || <span className="text-stone-300">—</span>}</td>
                          <td className="p-4">
                            {u.isAdmin
                              ? <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Admin</span>
                              : <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-500">Customer</span>
                            }
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-stone-900">{u.orderCount ?? 0}</span>
                          </td>
                          <td className="p-4 text-stone-400 text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short",year:"numeric" }) : "—"}
                          </td>
                          <td className="p-4 pr-6 text-stone-400 text-xs">
                            <span className={u.lastActive ? "text-emerald-600 font-medium" : ""}>
                              {u.lastActive ? timeAgo(u.lastActive) : "—"}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isOpen && (
                          <tr key={`${u._id}-detail`} className="bg-amber-50/30">
                            <td colSpan={6} className="px-6 py-4">
                              <motion.div
                                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                                className="flex flex-wrap gap-6 text-xs text-stone-600">
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Email</div>
                                  <a href={`mailto:${u.email}`} className="text-[#C9943A] hover:underline font-medium">{u.email}</a>
                                </div>
                                {u.phone && (
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Phone</div>
                                    <span className="font-medium">{u.phone}</span>
                                  </div>
                                )}
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">User ID</div>
                                  <span className="font-mono text-stone-500">{u._id}</span>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Total Orders</div>
                                  <span className="font-bold text-stone-900">{u.orderCount ?? 0} orders</span>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Addresses saved</div>
                                  <span className="font-medium">{u.addressCount ?? 0}</span>
                                </div>
                                <div className="ml-auto">
                                  <Link to={`/admin/orders?user=${u._id}`}
                                    className="text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors">
                                    View Orders →
                                  </Link>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Footer summary */}
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-[11px] text-stone-400">
              <span>Showing <strong className="text-stone-600">{filtered.length}</strong> of <strong className="text-stone-600">{users.length}</strong> users</span>
              <span>{users.filter((u)=>!u.isAdmin).length} customers · {users.filter((u)=>u.isAdmin).length} admins</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   USER ACTIVITY FEED  — new
   Fetches GET /api/admin/activity
   Expects: { activities: [{ _id, type, user:{name,email}, meta, createdAt }] }
   type values: "order_placed" | "order_status" | "profile_update" | "register" | "login" | "address_added"
═══════════════════════════════════════════════════════════ */
const ACTIVITY_ICONS = {
  order_placed:    { icon: "📦", color: "from-amber-100 to-orange-100 text-amber-800",   label: "Order placed"    },
  order_status:    { icon: "🔄", color: "from-blue-100 to-sky-100 text-blue-800",        label: "Status updated"  },
  profile_update:  { icon: "✏️", color: "from-violet-100 to-purple-100 text-violet-800", label: "Profile updated" },
  register:        { icon: "🌟", color: "from-emerald-100 to-green-100 text-emerald-800",label: "New signup"      },
  login:           { icon: "🔑", color: "from-stone-100 to-slate-100 text-stone-600",    label: "Logged in"       },
  address_added:   { icon: "📍", color: "from-rose-100 to-pink-100 text-rose-800",       label: "Address saved"   },
};

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchActivity = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE()}/api/admin/activity?limit=40`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load activity (${res.status})`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchActivity();
    const iv = setInterval(fetchActivity, 60000);
    return () => clearInterval(iv);
  }, [fetchActivity]);

  const types = ["all", ...Object.keys(ACTIVITY_ICONS)];
  const filtered = typeFilter === "all"
    ? activities
    : activities.filter((a) => a.type === typeFilter);

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">User Activity Feed</h2>
          <p className="text-xs text-stone-500">Real-time log of user actions across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-stone-200/60 bg-white rounded-xl px-3 py-2 text-stone-600 focus:outline-none focus:border-[#C9943A]/50">
            <option value="all">All activity</option>
            {Object.entries(ACTIVITY_ICONS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={fetchActivity} title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200/60 bg-white text-stone-500 hover:text-[#C9943A] hover:border-[#C9943A]/40 transition-all text-sm">
            ↻
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-400 font-serif italic">Loading activity…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center px-6">
            <p className="text-sm text-rose-600 mb-3">⚠ {error}</p>
            <p className="text-xs text-stone-400 mb-3">Make sure your backend exposes <code className="bg-stone-100 px-1 rounded">/api/admin/activity</code></p>
            <button onClick={fetchActivity} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-4 py-2 rounded-lg">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="text-3xl mb-2">📡</div>
            <p className="text-sm font-bold text-stone-700">No activity yet</p>
            <p className="text-xs text-stone-400 mt-1">User actions will stream in here as they happen.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto">
            {filtered.map((act, i) => {
              const meta  = ACTIVITY_ICONS[act.type] || { icon:"•", color:"from-stone-100 to-stone-100 text-stone-500", label: act.type };
              const initials = act.user?.name?.split(" ").map((w)=>w[0]).slice(0,2).join("").toUpperCase() || "?";
              return (
                <motion.div
                  key={act._id || i}
                  initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-amber-50/20 transition-colors group"
                >
                  {/* Activity type icon */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-base shrink-0`}>
                    {meta.icon}
                  </div>

                  {/* User avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600 shrink-0">
                    {initials}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 leading-tight">
                      <span className="font-semibold">{act.user?.name || "Unknown user"}</span>
                      {" "}
                      <span className="text-stone-500">{describeActivity(act)}</span>
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{act.user?.email}</p>
                  </div>

                  {/* Badge + time */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-stone-400">{timeAgo(act.createdAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Converts an activity record to a human-readable sentence fragment */
function describeActivity(act) {
  switch (act.type) {
    case "order_placed":   return `placed a new order${act.meta?.clothType ? ` for ${act.meta.clothType}` : ""}`;
    case "order_status":   return `order status changed to ${act.meta?.status || "unknown"}`;
    case "profile_update": return "updated their profile";
    case "register":       return "created a new account";
    case "login":          return "logged into the platform";
    case "address_added":  return `saved a new ${act.meta?.label || ""} address`;
    default:               return act.meta?.description || act.type.replace(/_/g," ");
  }
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState(null);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users" | "activity"

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) { navigate("/login"); return; }
    if (!user.isAdmin) { navigate("/"); return; }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE()}/api/admin/stats`, { headers: authHeaders() });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); return;
      }
      if (!res.ok) throw new Error(`Failed to load dashboard data (${res.status})`);
      setData(await res.json());
    } catch (err) { setError(err.message); setData(null); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#FDF6E2] to-[#FFFDF9]">
      <Navbar />
      <div className="fixed inset-0 flex items-center justify-center">
        <motion.div animate={{ rotate:360 }} transition={{ duration:1.2,repeat:Infinity,ease:"linear" }}
          className="w-14 h-14 rounded-full border-4 border-[#C9943A]/20 border-t-[#C9943A]" />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-24 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Couldn't load the dashboard</h2>
        <p className="text-sm text-stone-500 mb-6">{error || "No data was returned from the server."}</p>
        <button onClick={fetchDashboard} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-5 py-3 rounded-lg">Try Again</button>
      </div>
    </div>
  );

  const { stats, recentOrders = [], monthlyTrend = [] } = data;

  const trendData = MONTH_NAMES.map((month, i) => {
    const match = monthlyTrend.find((item) => item._id?.month === i + 1);
    return { name: month, orders: match ? match.count : 0 };
  });

  const pieData = [
    { name:"Pending",     value: stats.pendingOrders,    color:"#C9943A" },
    { name:"In Progress", value: stats.inProgressOrders, color:"#A0522D" },
    { name:"Completed",   value: stats.completedOrders,  color:"#198754" },
  ].filter((d) => d.value > 0);

  const statCards = [
    { title:"Total Orders",    value: stats.totalOrders,    icon:"📋", badge:"Overall"   },
    { title:"Active Users",    value: stats.totalUsers,     icon:"👥", badge:"Customers" },
    { title:"Gallery Designs", value: stats.totalDesigns,   icon:"🎨", badge:"Portfolio" },
    { title:"Completed",       value: stats.completedOrders,icon:"✅", badge:"Fulfilled" },
  ];

  /* Tab config */
  const TABS = [
    { key:"overview", label:"Overview",      icon:"📊" },
    { key:"users",    label:"All Users",     icon:"👥" },
    { key:"activity", label:"User Activity", icon:"📡" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9] text-stone-800 antialiased font-sans pb-16">
      <Navbar />

      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <motion.div animate={{ y:[0,-25,0], rotate:[0,10,0] }} transition={{ duration:8,repeat:Infinity,ease:"easeInOut" }}
          className="absolute top-28 left-8 text-[140px] opacity-[0.04]">🪡</motion.div>
        <motion.div animate={{ y:[0,20,0], rotate:[0,-8,0] }} transition={{ duration:10,repeat:Infinity,ease:"easeInOut" }}
          className="absolute top-[60%] right-8 text-[140px] opacity-[0.04]">✨</motion.div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 space-y-8">

        {/* ── HERO ── */}
        <motion.div variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-amber-200/40 bg-gradient-to-r from-[#FAF3DF] via-[#F4E9CD] to-[#EFE1BD] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl z-10 flex items-center justify-between w-full gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-800/80 bg-amber-100/60 px-3 py-1 rounded-full">
                Workspace Core
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mt-3">
                Welcome To, Admin ✨ Panel
              </h1>
              <p className="text-stone-600 mt-2 text-sm sm:text-base leading-relaxed">
                Monitor custom embroidery metrics, user accounts, and design catalogs from your exclusive tracking hub.
              </p>
            </div>
            <button onClick={fetchDashboard} title="Refresh dashboard"
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-amber-300/50 bg-white/60 text-amber-800 hover:bg-white transition-all">↻</button>
          </div>
          <div className="hidden lg:block text-8xl opacity-15 select-none pr-4">👑</div>
        </motion.div>

        {/* ── KPI CARDS ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <motion.div key={card.title} whileHover={{ y:-4,scale:1.01 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{card.title}</span>
                <h3 className="text-3xl font-bold tracking-tight text-stone-900">{card.value ?? 0}</h3>
                <span className="inline-block text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">{card.badge}</span>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 flex items-center justify-center text-2xl shadow-inner">
                {card.icon}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── TAB SWITCHER ── */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-1 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-stone-200/60 shadow-sm w-fit">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#C9943A] text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
                }`}>
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-8">

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants}
                  className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-stone-200/60 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-stone-900">Order Growth Curve</h2>
                    <p className="text-xs text-stone-500">Monthly order volume this year</p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top:10,right:5,left:-25,bottom:0 }}>
                        <defs>
                          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#C9943A" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#C9943A" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{ fill:"#78716c" }} />
                        <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill:"#78716c" }} />
                        <Tooltip contentStyle={{ background:"#fff",borderRadius:"12px",border:"1px solid #e7e5e4",fontSize:"12px" }} />
                        <Area type="monotone" dataKey="orders" stroke="#C9943A" strokeWidth={3} fillOpacity={1} fill="url(#curveGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}
                  className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Order Breakdown</h2>
                    <p className="text-xs text-stone-500">Live status segmentation</p>
                  </div>
                  {pieData.length === 0 ? (
                    <div className="h-56 flex items-center justify-center text-sm text-stone-400 font-serif italic">No active orders yet.</div>
                  ) : (
                    <>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={85} paddingAngle={4}>
                              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 flex-wrap text-xs pt-2">
                        {pieData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5 font-medium text-stone-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor:d.color }} />{d.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Quick ops + Messages */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Quick Operations</h2>
                    <p className="text-xs text-stone-500">Instant access context tools</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { title:"Manage Orders",   icon:"📋", path:"/admin/orders", desc:"View and edit invoices"          },
                      { title:"Upload Catalogs", icon:"🎨", path:"/admin/upload", desc:"Add current design patterns"     },
                      { title:"Live Storefront", icon:"🌐", path:"/",             desc:"Open live market site view"      },
                    ].map((item) => (
                      <Link key={item.path} to={item.path} className="group">
                        <div className="bg-white/80 hover:bg-white rounded-2xl p-4 border border-stone-200/60 transition-all shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{item.icon}</div>
                            <div>
                              <h4 className="text-sm font-semibold text-stone-800 group-hover:text-[#C9943A] transition-colors">{item.title}</h4>
                              <p className="text-xs text-stone-400">{item.desc}</p>
                            </div>
                          </div>
                          <span className="text-stone-400 group-hover:text-stone-800 transform group-hover:translate-x-1 transition-all text-sm font-bold">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <div className="lg:col-span-2">
                  <CustomerMessagesPanel />
                </div>
              </div>

              {/* Recent Orders */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Recent Orders</h2>
                    <p className="text-xs text-stone-500">Latest custom orders placed on the platform</p>
                  </div>
                  <Link to="/admin/orders" className="text-xs font-bold text-[#C9943A] hover:underline bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    View all →
                  </Link>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-stone-200/60 shadow-sm">
                  {recentOrders.length === 0 ? (
                    <div className="py-16 text-center px-6">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-sm font-bold text-stone-700">No orders yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-50/70 border-b border-stone-200/60 text-stone-500 text-xs tracking-wider uppercase font-semibold">
                            <th className="p-4 pl-6">Client</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Budget</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6">Date</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-stone-700 divide-y divide-stone-100">
                          {recentOrders.map((order) => {
                            const s = STATUS_META[order.status] || STATUS_META.pending;
                            return (
                              <tr key={order._id} className="hover:bg-amber-50/20 transition-colors">
                                <td className="p-4 pl-6 font-medium text-stone-900">{order.name || order.user?.name || "—"}</td>
                                <td className="p-4 text-stone-600">{order.clothType}</td>
                                <td className="p-4 font-semibold text-amber-900">{order.budget || "—"}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${s.color}`}>{s.label}</span></td>
                                <td className="p-4 pr-6 text-stone-400 text-xs">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short",year:"numeric" })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <UsersPanel />
            </motion.div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <ActivityFeed />
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}