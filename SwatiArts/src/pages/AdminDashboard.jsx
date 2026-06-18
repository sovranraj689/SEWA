import { useState, useEffect } from "react";
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

const STATUS_META = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 border border-amber-200" },
  approved: { label: "Approved", color: "bg-orange-100 text-orange-800 border border-orange-200" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 border border-blue-200" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  cancelled: { label: "Cancelled", color: "bg-rose-100 text-rose-800 border border-rose-200" },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ───────────────────────────────────────────────────────────
// Customer Messages Panel — 100% backend, no mock data
// ───────────────────────────────────────────────────────────
function CustomerMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/contact${filter === "unread" ? "?unreadOnly=true" : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
      const data = await res.json();
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleExpand = async (msg) => {
    const next = expandedId === msg._id ? null : msg._id;
    setExpandedId(next);

    if (next && !msg.isRead) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`/api/contact/${msg._id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silent fail, not critical
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMessages((prev) => prev.filter((m) => m._id !== id));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message);
    }
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
          <div className="flex bg-stone-200/40 backdrop-blur-sm p-1 rounded-xl border border-stone-200/40 text-xs font-semibold">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  filter === f ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchMessages}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200/60 bg-white text-stone-500 hover:text-[#C9943A] hover:border-[#C9943A]/40 transition-all text-sm"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone-400 font-serif italic">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center px-6">
            <p className="text-sm text-rose-600 mb-3">⚠ {error}</p>
            <button onClick={fetchMessages} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-4 py-2 rounded-lg">
              Try Again
            </button>
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
                  <motion.div
                    key={msg._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 py-4 cursor-pointer hover:bg-amber-50/30 transition-colors"
                    onClick={() => handleExpand(msg)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center text-xs font-bold text-amber-800">
                          {msg.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        {!msg.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C9943A] ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${!msg.isRead ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>
                            {msg.name}
                          </span>
                          <span className="text-[11px] text-stone-400 shrink-0">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <p className="text-xs text-stone-400 truncate">{msg.email}{msg.phone ? ` • ${msg.phone}` : ""}</p>
                        <p className={`text-sm mt-1 ${isOpen ? "" : "truncate"} text-stone-600`}>
                          {msg.message}
                        </p>

                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2 mt-3"
                          >
                            <a
                              href={`mailto:${msg.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-bold uppercase tracking-wider bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
                            >
                              Reply by Email
                            </a>
                            <button
                              onClick={(e) => handleDelete(msg._id, e)}
                              className="text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
                            >
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

// ───────────────────────────────────────────────────────────
// Core Dashboard Container
// ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.isAdmin) {
      navigate("/");
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error(`Failed to load dashboard data (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#FDF6E2] to-[#FFFDF9]">
        <Navbar />
        <div className="fixed inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-full border-4 border-[#C9943A]/20 border-t-[#C9943A]"
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-24 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Couldn't load the dashboard</h2>
          <p className="text-sm text-stone-500 mb-6">
            {error || "No data was returned from the server."}
          </p>
          <button
            onClick={fetchDashboard}
            className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-5 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentOrders = [], monthlyTrend = [] } = data;

  // Normalizes trend data structure to guarantee 12 months are visually presented gracefully
  const trendData = MONTH_NAMES.map((month, index) => {
    const matchedRecord = monthlyTrend.find((item) => item._id?.month === index + 1);
    return {
      name: month,
      orders: matchedRecord ? matchedRecord.count : 0,
    };
  });

  const pieData = [
    { name: "Pending", value: stats.pendingOrders, color: "#C9943A" },
    { name: "In Progress", value: stats.inProgressOrders, color: "#A0522D" },
    { name: "Completed", value: stats.completedOrders, color: "#198754" },
  ].filter((d) => d.value > 0);

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: "📋", badge: "Overall" },
    { title: "Active Users", value: stats.totalUsers, icon: "👥", badge: "Customers" },
    { title: "Gallery Designs", value: stats.totalDesigns, icon: "🎨", badge: "Portfolio" },
    { title: "Completed", value: stats.completedOrders, icon: "✅", badge: "Fulfilled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9] text-stone-800 antialiased font-sans pb-16">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 left-8 text-[140px] opacity-[0.04]"
        >
          🪡
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] right-8 text-[140px] opacity-[0.04]"
        >
          ✨
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10 space-y-10"
      >
        {/* HERO SECTION */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-amber-200/40 bg-gradient-to-r from-[#FAF3DF] via-[#F4E9CD] to-[#EFE1BD] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="max-w-xl z-10 flex items-center justify-between w-full gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-800/80 bg-amber-100/60 px-3 py-1 rounded-full">
                Workspace Core
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mt-3">
                Welcome Back, Admin ✨
              </h1>
              <p className="text-stone-600 mt-2 text-sm sm:text-base leading-relaxed">
                Seamlessly monitor custom embroidery metrics, user accounts, and design catalogs from your exclusive tracking hub.
              </p>
            </div>
            <button
              onClick={fetchDashboard}
              title="Refresh dashboard"
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-amber-300/50 bg-white/60 text-amber-800 hover:bg-white transition-all"
            >
              ↻
            </button>
          </div>
          <div className="hidden lg:block text-8xl opacity-15 select-none pr-4">👑</div>
        </motion.div>

        {/* KPI METRIC CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{card.title}</span>
                <h3 className="text-3xl font-bold tracking-tight text-stone-900">{card.value ?? 0}</h3>
                <span className="inline-block text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                  {card.badge}
                </span>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 flex items-center justify-center text-2xl shadow-inner">
                {card.icon}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CHARTS GRAPHICS VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Area Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-stone-900">Order Growth Curve</h2>
              <p className="text-xs text-stone-500">Visualizing monthly analytics pipeline metrics</p>
            </div>
            {trendData.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-sm text-stone-400 font-serif italic">
                No order data yet to chart.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9943A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C9943A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#78716c' }} />
                    <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#78716c' }} />
                    <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="orders" stroke="#C9943A" strokeWidth={3} fillOpacity={1} fill="url(#curveGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Allocation Distribution Pie Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-stone-900">Order Breakdown</h2>
              <p className="text-xs text-stone-500">Live operational standing segmentation</p>
            </div>
            {pieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-sm text-stone-400 font-serif italic">
                No active orders yet.
              </div>
            ) : (
              <>
                <div className="h-56 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={85} paddingAngle={4}>
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip cornerRadius={8} textAnchor="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center gap-4 flex-wrap text-xs pt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 font-medium text-stone-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* INTERACTION HUB & MESSAGES BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Shortcuts */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Quick Operations</h2>
              <p className="text-xs text-stone-500">Instant access context tools</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Manage System Orders", icon: "📋", path: "/admin/orders", desc: "View and edit invoices" },
                { title: "Upload New Catalogs", icon: "🎨", path: "/admin/upload", desc: "Add current design patterns" },
                { title: "Launch Core Storefront", icon: "🌐", path: "/", desc: "Open live market site view" },
              ].map((item, index) => (
                <Link key={index} to={item.path} className="group">
                  <div className="bg-white/80 hover:bg-white rounded-2xl p-4 border border-stone-200/60 transition-all duration-200 shadow-sm flex items-center justify-between">
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

          {/* Customer Messages Panel — live backend data only */}
          <div className="lg:col-span-2">
            <CustomerMessagesPanel />
          </div>
        </div>

        {/* RECENT ORDERS */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Incoming Work Pipelines</h2>
              <p className="text-xs text-stone-500">Direct breakdown overview monitoring portal logs</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-[#C9943A] hover:underline bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              Complete Ledger →
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-stone-200/60 shadow-sm">
            {recentOrders.length === 0 ? (
              <div className="py-16 text-center px-6">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-bold text-stone-700">No orders yet</p>
                <p className="text-xs text-stone-400 mt-1">Custom orders placed by customers will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200/60 text-stone-500 text-xs tracking-wider uppercase font-semibold">
                      <th className="p-4 pl-6">Client Identity</th>
                      <th className="p-4">Apparel Category</th>
                      <th className="p-4">Target Budget</th>
                      <th className="p-4">Operational Status</th>
                      <th className="p-4 pr-6">Log Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm text-stone-700 divide-y divide-stone-100">
                    {recentOrders.map((order) => {
                      const statusConfig = STATUS_META[order.status] || STATUS_META.pending;
                      return (
                        <tr key={order._id} className="hover:bg-amber-50/20 transition-colors group">
                          <td className="p-4 pl-6 font-medium text-stone-900">{order.name || order.user?.name || "—"}</td>
                          <td className="p-4 text-stone-600">{order.clothType}</td>
                          <td className="p-4 font-semibold text-amber-900">{order.budget || "—"}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-stone-400 group-hover:text-stone-600 transition-colors">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
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
    </div>
  );
}