import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const STATUS_META = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  approved: { label: "Approved", badge: "bg-orange-100 text-orange-800 border-orange-200" },
  in_progress: { label: "In Progress", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "Completed", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", badge: "bg-rose-100 text-rose-800 border-rose-200" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ───────────────────────────────────────────────────────────
// Manage Order Drawer — Flipkart-seller-style order action panel
// ───────────────────────────────────────────────────────────
function ManageOrderDrawer({ order, onClose, onUpdated, onDeleted }) {
  const [status, setStatus] = useState(order.status);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || "");
  const [quotedPrice, setQuotedPrice] = useState(order.quotedPrice || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery ? order.estimatedDelivery.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status,
          adminNotes,
          quotedPrice: quotedPrice || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const data = await res.json();
      toast.success("Order updated");
      onUpdated(data.order);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [quickActing, setQuickActing] = useState(null);
  const handleQuickAction = async (newStatus) => {
    setQuickActing(newStatus);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          quotedPrice: quotedPrice || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const data = await res.json();
      setStatus(newStatus);
      toast.success(`Order ${STATUS_META[newStatus]?.label.toLowerCase() || newStatus}`);
      onUpdated(data.order);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setQuickActing(null);
    }
  };

  // The natural next-step pipeline, like Flipkart seller flow: Pending → Approved → In Progress → Completed
  const PIPELINE = [
    { key: "approved", label: "Approve Order", icon: "✓", from: "pending" },
    { key: "in_progress", label: "Start Work", icon: "🪡", from: "approved" },
    { key: "completed", label: "Mark Completed", icon: "📦", from: "in_progress" },
  ];
  const nextStep = PIPELINE.find((s) => s.from === status);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/${order._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted");
      onDeleted(order._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full text-sm border border-stone-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-[#C9943A] focus:border-[#C9943A]";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[1000] bg-stone-900/50 backdrop-blur-sm flex justify-end"
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-[440px] h-full bg-[#FFFDF9] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-stone-200/60 flex items-center justify-between sticky top-0 bg-[#FFFDF9] z-10">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Manage Order</h3>
            <p className="text-xs text-stone-400 mt-0.5">#{order._id}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-stone-200/60 p-4 space-y-1.5">
            <p className="text-sm font-bold text-stone-900">{order.name}</p>
            <p className="text-xs text-stone-500">{order.email}</p>
            <p className="text-xs text-stone-500">{order.phone}</p>
            <p className="text-xs text-stone-400 mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg border border-stone-200/60 p-3">
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-1">Cloth Type</span>
              <span className="font-semibold text-stone-800">{order.clothType}</span>
            </div>
            <div className="bg-white rounded-lg border border-stone-200/60 p-3">
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-1">Budget</span>
              <span className="font-semibold text-stone-800">{order.budget || "—"}</span>
            </div>
            <div className="bg-white rounded-lg border border-stone-200/60 p-3 col-span-2">
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-1">Work Area</span>
              <span className="font-semibold text-stone-800">{(order.workArea || []).join(", ") || "—"}</span>
            </div>
            <div className="bg-white rounded-lg border border-stone-200/60 p-3 col-span-2">
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-1">Embroidery Type</span>
              <span className="font-semibold text-stone-800">{(order.embroideryType || []).join(", ") || "—"}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200/60 p-4">
            <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-2">Customer Description</span>
            <p className="text-sm text-stone-600 italic font-serif leading-relaxed">"{order.description}"</p>
          </div>

          {order.referenceImages?.length > 0 && (
            <div>
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-2">Reference Images</span>
              <div className="flex gap-2 flex-wrap">
                {order.referenceImages.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-stone-200/60" />

          {/* Pipeline tracker — visual progress like Flipkart/Myntra order tracking */}
          <div>
            <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-3">Order Pipeline</span>
            <div className="flex items-center justify-between">
              {["pending", "approved", "in_progress", "completed"].map((step, i, arr) => {
                const stepIndex = arr.indexOf(step);
                const currentIndex = arr.indexOf(status);
                const reached = status !== "cancelled" && currentIndex >= stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                        reached ? "bg-[#C9943A] border-[#C9943A] text-white" : "bg-white border-stone-200 text-stone-300"
                      }`}>
                        {reached ? "✓" : i + 1}
                      </div>
                      <span className={`text-[9px] font-semibold uppercase tracking-wide text-center ${reached ? "text-stone-700" : "text-stone-300"}`}>
                        {STATUS_META[step].label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${reached && currentIndex > stepIndex ? "bg-[#C9943A]" : "bg-stone-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {status === "cancelled" && (
              <p className="text-center text-xs font-semibold text-rose-600 mt-3 bg-rose-50 rounded-lg py-1.5">This order has been cancelled</p>
            )}
          </div>

          {/* Quick action buttons — one-tap, like Flipkart seller "Approve / Pack / Ship" */}
          <div className="grid grid-cols-1 gap-2.5">
            {nextStep && (
              <button
                onClick={() => handleQuickAction(nextStep.key)}
                disabled={quickActing !== null}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold uppercase tracking-wider py-3 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                <span>{nextStep.icon}</span>
                {quickActing === nextStep.key ? "Updating..." : nextStep.label}
              </button>
            )}
            {status !== "cancelled" && status !== "completed" && (
              <button
                onClick={() => handleQuickAction("cancelled")}
                disabled={quickActing !== null}
                className="w-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg disabled:opacity-60 transition-colors"
              >
                {quickActing === "cancelled" ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>

          <div className="h-px bg-stone-200/60" />

          <p className="text-[11px] text-stone-400 -mt-2">
            Need to set a different status, add a quote, or leave notes for the customer? Use the manual controls below.
          </p>

          {/* Management Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Order Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Quoted Price (₹)</label>
                <input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} className={inputClass} placeholder="e.g. 4500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Est. Delivery</label>
                <input type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Admin Notes (visible to customer)</label>
              <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className={inputClass} style={{ resize: "vertical" }} placeholder="e.g. Fabric sourced, work starts Monday" />
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div>
              <span className="block text-stone-400 uppercase tracking-wider text-[10px] mb-2">History</span>
              <div className="space-y-2">
                {order.statusHistory.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9943A]" />
                    <span className="font-semibold text-stone-700 capitalize">{h.status.replace("_", " ")}</span>
                    <span>· {new Date(h.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer actions */}
        <div className="p-6 border-t border-stone-200/60 sticky bottom-0 bg-[#FFFDF9] space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#C9943A] text-white text-sm font-bold uppercase tracking-wider py-3 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full text-rose-600 text-xs font-semibold uppercase tracking-wider py-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Delete Order
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 text-xs font-semibold uppercase tracking-wider py-2.5 border border-stone-200 rounded-lg text-stone-600">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 text-xs font-semibold uppercase tracking-wider py-2.5 bg-rose-600 text-white rounded-lg disabled:opacity-60">
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [managingOrder, setManagingOrder] = useState(null);

  const debouncedSearch = useDebounced(search);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) { navigate("/login"); return; }
    if (!user.isAdmin) { navigate("/"); return; }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 10 });
      if (activeTab !== "all") params.set("status", activeTab);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);

      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const handleOrderUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setManagingOrder(null);
    fetchOrders(); // refresh status counts
  };

  const handleOrderDeleted = (id) => {
    setOrders((prev) => prev.filter((o) => o._id !== id));
    setManagingOrder(null);
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9] text-stone-800 antialiased pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">All Orders</h1>
            <p className="text-xs text-stone-500 mt-1">
              {total} total order{total !== 1 ? "s" : ""} · Manage incoming requests, update status, and quote pricing.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or phone..."
              className="w-full text-sm border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-[#C9943A] focus:border-[#C9943A] bg-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
          </div>
        </div>

        {/* FILTER TABS with live counts */}
        <div className="flex flex-wrap gap-2.5 border-b border-stone-200/40 pb-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tab.key === "all"
              ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
              : statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? "text-white border-[#C9943A] bg-[#C9943A] shadow-sm"
                    : "text-[#C9943A] border-stone-200/60 bg-white/60 hover:bg-white"
                }`}
              >
                {tab.label.toUpperCase()}
                <span className={`text-[10px] px-1.5 rounded-full ${isActive ? "bg-white/25" : "bg-amber-50"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#C9943A]/25 border-t-[#C9943A] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone-400 font-serif italic">Loading orders...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="py-20 text-center">
            <p className="text-sm text-rose-600 mb-4">⚠ {error}</p>
            <button onClick={fetchOrders} className="text-xs font-bold uppercase tracking-wider bg-[#C9943A] text-white px-5 py-2.5 rounded-lg">
              Try Again
            </button>
          </div>
        )}

        {/* TABLE — Flipkart seller panel style */}
        {!loading && !error && (
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-20 bg-white/50 border border-dashed border-stone-200 rounded-2xl text-stone-400 text-sm"
                >
                  No orders found{activeTab !== "all" ? ` in "${activeTab.replace("_", " ")}"` : ""}{debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
                </motion.div>
              ) : (
                orders.map((order) => {
                  const meta = STATUS_META[order.status] || STATUS_META.pending;
                  return (
                    <motion.div
                      layout
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setManagingOrder(order)}
                      className="bg-white rounded-xl p-5 border border-stone-200/60 shadow-sm hover:shadow-md hover:border-[#C9943A]/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-stone-900 text-sm">{order.name}</h3>
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md border ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">
                          #{order._id.slice(-8)} · {order.clothType} · {order.phone}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 italic font-serif truncate max-w-md">
                          "{order.description}"
                        </p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400">Budget</p>
                          <p className="text-sm font-bold text-amber-800">{order.budget || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400">Placed</p>
                          <p className="text-xs font-medium text-stone-600">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setManagingOrder(order); }}
                          className="text-xs font-bold uppercase tracking-wider bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-[#C9943A] transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PAGINATION */}
        {!loading && !error && pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 disabled:opacity-40 bg-white"
            >
              ← Prev
            </button>
            <span className="text-xs text-stone-500">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 disabled:opacity-40 bg-white"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Manage drawer */}
      <AnimatePresence>
        {managingOrder && (
          <ManageOrderDrawer
            order={managingOrder}
            onClose={() => setManagingOrder(null)}
            onUpdated={handleOrderUpdated}
            onDeleted={handleOrderDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}