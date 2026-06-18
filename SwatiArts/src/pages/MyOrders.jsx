import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Definitive operational stages for live timeline tracking
const TRACKING_STEPS = [
  { key: "pending", label: "Design Review", icon: "✨" },
  { key: "approved", label: "Confirmed", icon: "✓" },
  { key: "in_progress", label: "At Atelier", icon: "🪡" },
  { key: "completed", label: "Dispatched", icon: "📦" },
];

const GOLD = "#C9943A";
const MAROON = "#8B1A1A";
const DARK = "#2C0F00";

const STATUS_META = {
  pending: {
    color: "text-amber-800 bg-amber-50 border-amber-200",
    stepIndex: 0,
    phrase: "Awaiting artisan validation",
  },
  approved: {
    color: "text-[#8B5A1F] bg-[#FBF1DC] border-[#E3C589]",
    stepIndex: 1,
    phrase: "Materials being prepared",
  },
  in_progress: {
    color: "text-[#8B1A1A] bg-[#F8E9E9] border-[#E0B5B5]",
    stepIndex: 2,
    phrase: "Embroidery currently active",
  },
  completed: {
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    stepIndex: 3,
    phrase: "Order completed & shipped",
  },
  cancelled: {
    color: "text-stone-500 bg-stone-100 border-stone-200",
    stepIndex: -1,
    phrase: "Order cancelled",
  },
};

// Friendly customer-facing copy for each activity log entry (maps backend statusHistory.status)
const ACTIVITY_META = {
  pending: {
    label: "Order Placed",
    icon: "✨",
    color: "bg-amber-100 text-amber-800",
  },
  approved: {
    label: "Order Approved",
    icon: "✓",
    color: "bg-[#FBF1DC] text-[#8B5A1F]",
  },
  in_progress: {
    label: "Work Started",
    icon: "🪡",
    color: "bg-[#F8E9E9] text-[#8B1A1A]",
  },
  completed: {
    label: "Order Completed",
    icon: "📦",
    color: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Order Cancelled",
    icon: "✕",
    color: "bg-rose-100 text-rose-700",
  },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState("ACTIVE"); // ACTIVE, COMPLETED, ALL
  const [expandedHistory, setExpandedHistory] = useState({}); // { [orderId]: boolean }
  const navigate = useNavigate();

  const [lastSynced, setLastSynced] = useState(null);
  const prevStatusesRef = useRef({});

  const toggleHistory = (orderId) => {
    setExpandedHistory((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const fetchMyOrders = async (isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("LOGIN_REQUIRED");
      return;
    }

    try {
      // Vite-compatible environmental boundary setup
      const API_BASE = import.meta.env?.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("LOGIN_REQUIRED");
        return;
      }

      if (!res.ok) {
        throw new Error(
          `Failed to pull down your customized order history. (Status: ${res.status})`,
        );
      }

      const data = await res.json();

      // Match backend response key: data.orders
      if (data && Array.isArray(data.orders)) {
        // Detect status changes since the last fetch (admin approved / started / completed
        // an order while the customer was on this page) and notify with a toast.
        data.orders.forEach((o) => {
          const prev = prevStatusesRef.current[o._id];
          if (prev && prev !== o.status) {
            const friendly =
              TRACKING_STEPS.find((s) => s.key === o.status)?.label || o.status;
            toast.success(
              `Order #${o._id.slice(-8).toUpperCase()} is now "${friendly}"`,
              { icon: "🪡" },
            );
          }
          prevStatusesRef.current[o._id] = o.status;
        });

        setOrders(data.orders);
        setLastSynced(new Date());
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Database connection error:", err);
      if (!isBackgroundSync) {
        setError(err.message || "Something went wrong fetching your records.");
        toast.error(
          err.message || "Something went wrong fetching your records.",
        );
      }
    } finally {
      if (!isBackgroundSync) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    // Poll periodically so status changes made by admin (approve / start work / complete)
    // reflect here automatically — keeps the pipeline "connected" to the admin panel live.
    const interval = setInterval(() => fetchMyOrders(true), 8000);

    // Also sync immediately when the customer switches back to this tab —
    // covers the common case of admin approving in one tab while this is open in another.
    const handleFocus = () => fetchMyOrders(true);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchMyOrders(true);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Compute live relative execution intervals for dynamic fulfillment calculations
  const calculateDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const diffTime = new Date(dueDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : "Delivering today";
  };

  const filteredOrders = orders.filter((order) => {
    if (!order || !order.status) return true;
    if (filterTab === "ACTIVE")
      return order.status !== "completed" && order.status !== "cancelled";
    if (filterTab === "COMPLETED") return order.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF9] via-[#FAF2DB] to-[#FFFDF9] text-stone-800 antialiased flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-8">
          {/* Header Typography Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-800 bg-amber-100/60 px-3 py-1 rounded-full">
                Customer Space
              </span>
              <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight mt-3">
                Track My{" "}
                <span className="text-[#C9943A] italic font-normal font-sans">
                  Custom Orders
                </span>
              </h1>
            </div>

            {/* Filter Controls + Refresh */}
            {!error && (
              <div className="flex items-center gap-3">
                <div className="flex bg-stone-200/40 backdrop-blur-sm p-1 rounded-xl border border-stone-200/40 max-w-max text-xs font-semibold">
                  {["ACTIVE", "COMPLETED", "ALL"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        filterTab === tab
                          ? "bg-white text-stone-900 shadow-sm"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fetchMyOrders()}
                  title="Refresh"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200/60 bg-white text-stone-500 hover:text-[#C9943A] hover:border-[#C9943A]/40 transition-all text-sm"
                >
                  ↻
                </button>
              </div>
            )}
          </div>

          {lastSynced && !loading && !error && (
            <p className="text-[10px] text-stone-400 -mt-2">
              Last synced{" "}
              {lastSynced.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
              — tap ↻ above to sync now
            </p>
          )}

          {/* Core Dynamic Component Router view states */}
          {loading ? (
            <div className="text-center py-24 font-serif text-lg text-stone-400 italic space-y-3">
              <div className="w-8 h-8 border-2 border-[#C9943A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Synchronizing structural pipeline requests...
            </div>
          ) : error === "LOGIN_REQUIRED" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/60 border border-dashed border-stone-200 rounded-3xl p-8"
            >
              <div className="text-4xl mb-3 select-none">🔒</div>
              <h3 className="text-lg font-bold text-stone-800">
                Please Sign In
              </h3>
              <p className="text-xs text-stone-400 mt-1 mb-6">
                Log in to view and track your custom embroidery orders.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-block text-xs font-bold tracking-wider uppercase bg-[#C9943A] text-white px-5 py-3 rounded-xl shadow-md hover:bg-[#b0802f] transition-all"
              >
                Go to Login
              </button>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/60 border border-dashed border-red-200 rounded-3xl p-8"
            >
              <div className="text-4xl mb-3 select-none">⚠️</div>
              <h3 className="text-lg font-bold text-stone-800">
                Couldn't load your orders
              </h3>
              <p className="text-xs text-stone-400 mt-1 mb-6">{error}</p>
              <button
                onClick={() => fetchMyOrders()}
                className="inline-block text-xs font-bold tracking-wider uppercase bg-[#C9943A] text-white px-5 py-3 rounded-xl shadow-md hover:bg-[#b0802f] transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/60 border border-dashed border-stone-200 rounded-3xl p-8"
            >
              <div className="text-4xl mb-3 select-none">🪡</div>
              <h3 className="text-lg font-bold text-stone-800">
                No Orders Spotted
              </h3>
              <p className="text-xs text-stone-400 mt-1 mb-6">
                You don't have any custom orders running in this scope block.
              </p>
              <a
                href="/custom-order"
                className="inline-block text-xs font-bold tracking-wider uppercase bg-[#C9943A] text-white px-5 py-3 rounded-xl shadow-md hover:bg-[#b0802f] transition-all"
              >
                Commission Custom Work
              </a>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => {
                  if (!order) return null;

                  const currentStatus = order.status || "pending";
                  const meta =
                    STATUS_META[currentStatus] || STATUS_META.pending;
                  const currentStep = meta.stepIndex;

                  const formattedWorkArea = Array.isArray(order.workArea)
                    ? order.workArea.join(", ")
                    : order.workArea;
                  const formattedEmbroidery = Array.isArray(
                    order.embroideryType,
                  )
                    ? order.embroideryType.join(", ")
                    : order.embroidery || "Custom Pattern";

                  return (
                    <motion.div
                      layout
                      key={order._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm relative overflow-hidden flex flex-col gap-6 group hover:shadow-md transition-all duration-300"
                    >
                      {/* Left Accent Bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9943A]" />

                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-stone-100 pb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block">
                            Identifier
                          </span>
                          <h2 className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#C9943A] transition-colors">
                            #
                            {order._id
                              ? order._id.slice(-8).toUpperCase()
                              : "N/A"}{" "}
                            <span className="font-sans font-medium text-xs text-stone-400 ml-1">
                              • Ordered{" "}
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short" },
                                  )
                                : "Recently"}
                            </span>
                          </h2>
                        </div>
                        <div className="text-right sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}
                          >
                            {currentStatus.replace("_", " ").toUpperCase()}
                          </span>
                          <p className="text-[11px] text-stone-400 italic">
                            {meta.phrase}
                          </p>
                        </div>
                      </div>

                      {/* Info Spec Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="block text-stone-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                            Apparel Family
                          </span>
                          <span className="text-stone-800 font-medium">
                            {order.clothType || "Suit"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                            Target Coordinates
                          </span>
                          <span className="text-stone-800 font-medium truncate block">
                            {formattedWorkArea || "Neckline"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                            Artistry Medium
                          </span>
                          <span className="text-stone-800 font-medium truncate block">
                            {formattedEmbroidery}
                          </span>
                        </div>
                        <div>
                          <span className="block text-stone-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                            Budget Class
                          </span>
                          <span className="text-[#C9943A] font-bold font-serif">
                            {order.budget || "Standard"}
                          </span>
                        </div>
                      </div>

                      {/* Description Paragraph */}
                      {order.description && (
                        <p className="text-xs sm:text-sm text-stone-500 font-serif leading-relaxed bg-stone-50/50 border border-stone-100 rounded-xl p-3 italic">
                          "{order.description}"
                        </p>
                      )}

                      {/* LIVE VISUAL TRACKING TIMELINE STEPS BLOCK — themed gold/maroon, merged with activity log below */}
                      {currentStep !== -1 && (
                        <div
                          className="rounded-2xl overflow-hidden border"
                          style={{ borderColor: "rgba(201,148,58,0.25)" }}
                        >
                          <div
                            className="p-5 space-y-4"
                            style={{
                              background:
                                "linear-gradient(135deg, #FBF1DC 0%, #FAF3E0 100%)",
                            }}
                          >
                            <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                              <span
                                className="font-bold tracking-wide flex items-center gap-1.5"
                                style={{ color: MAROON }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full animate-pulse"
                                  style={{ background: GOLD }}
                                />
                                Live Tracking Pipeline
                                <span
                                  className="font-normal text-[10px]"
                                  style={{ color: "rgba(44,15,0,0.35)" }}
                                >
                                  (status: {currentStatus})
                                </span>
                              </span>
                              {order.estimatedDelivery &&
                                currentStatus !== "completed" && (
                                  <span
                                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-md"
                                    style={{
                                      color: "#8B5A1F",
                                      background: "rgba(201,148,58,0.15)",
                                    }}
                                  >
                                    ⏱{" "}
                                    {calculateDaysRemaining(
                                      order.estimatedDelivery,
                                    )}{" "}
                                    (
                                    {new Date(
                                      order.estimatedDelivery,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                    )
                                  </span>
                                )}
                            </div>

                            {/* Progress Line Graph Bar */}
                            <div className="relative pt-2 pb-6">
                              {/* Background Track Line */}
                              <div
                                className="absolute top-5 left-3 right-3 h-1 rounded-full z-0"
                                style={{ background: "rgba(201,148,58,0.2)" }}
                              />
                              {/* Dynamic Percentage fill line */}
                              <div
                                className="absolute top-5 left-3 h-1 rounded-full z-0 transition-all duration-1000"
                                style={{
                                  width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 98}%`,
                                  background: `linear-gradient(to right, ${GOLD}, ${MAROON})`,
                                }}
                              />

                              <div className="relative flex justify-between items-center z-10">
                                {TRACKING_STEPS.map((step, index) => {
                                  const isPassed = index <= currentStep;
                                  const isCurrent = index === currentStep;

                                  return (
                                    <div
                                      key={step.key}
                                      className="flex flex-col items-center"
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition-all duration-500 ${isCurrent ? "scale-110 font-bold" : ""}`}
                                        style={
                                          isCurrent
                                            ? {
                                                background: MAROON,
                                                color: "#FAF3E0",
                                                boxShadow:
                                                  "0 0 0 4px rgba(139,26,26,0.15)",
                                              }
                                            : isPassed
                                              ? {
                                                  background: GOLD,
                                                  color: "#fff",
                                                }
                                              : {
                                                  background: "#fff",
                                                  color: "rgba(44,15,0,0.3)",
                                                  border:
                                                    "2px solid rgba(201,148,58,0.25)",
                                                }
                                        }
                                      >
                                        {step.icon}
                                      </div>
                                      <span
                                        className="absolute mt-9 text-[10px] font-bold tracking-tight whitespace-nowrap transition-colors"
                                        style={{
                                          color: isCurrent
                                            ? DARK
                                            : isPassed
                                              ? "#7A3B1E"
                                              : "rgba(44,15,0,0.3)",
                                        }}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* ACTIVITY TIMELINE — merged directly under the pipeline, same card, no gap */}
                          {order.statusHistory?.length > 0 && (
                            <div
                              className="border-t"
                              style={{ borderColor: "rgba(201,148,58,0.2)" }}
                            >
                              <button
                                onClick={() => toggleHistory(order._id)}
                                className="w-full flex items-center justify-between px-5 py-3 transition-colors text-xs font-bold tracking-wide"
                                style={{
                                  color: MAROON,
                                  background: expandedHistory[order._id]
                                    ? "rgba(201,148,58,0.06)"
                                    : "transparent",
                                }}
                              >
                                <span className="flex items-center gap-1.5">
                                  📋 Activity Timeline
                                  <span
                                    className="font-normal"
                                    style={{ color: "rgba(44,15,0,0.4)" }}
                                  >
                                    ({order.statusHistory.length})
                                  </span>
                                </span>
                                <span
                                  className={`transition-transform ${expandedHistory[order._id] ? "rotate-180" : ""}`}
                                >
                                  ⌄
                                </span>
                              </button>

                              <AnimatePresence>
                                {expandedHistory[order._id] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                    style={{ background: "#fff" }}
                                  >
                                    <div className="px-5 py-4 space-y-4">
                                      {order.statusHistory
                                        .slice()
                                        .reverse()
                                        .map((entry, i) => {
                                          const am =
                                            ACTIVITY_META[entry.status] ||
                                            ACTIVITY_META.pending;
                                          const isLatest = i === 0;
                                          return (
                                            <div key={i} className="flex gap-3">
                                              <div className="flex flex-col items-center">
                                                <span
                                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${am.color}`}
                                                  style={
                                                    isLatest
                                                      ? {
                                                          boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${GOLD}`,
                                                        }
                                                      : {}
                                                  }
                                                >
                                                  {am.icon}
                                                </span>
                                                {i <
                                                  order.statusHistory.length -
                                                    1 && (
                                                  <span
                                                    className="w-px flex-1 mt-1"
                                                    style={{
                                                      background:
                                                        "rgba(201,148,58,0.25)",
                                                    }}
                                                  />
                                                )}
                                              </div>
                                              <div className="pb-3 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span
                                                    className="text-xs font-bold"
                                                    style={{ color: DARK }}
                                                  >
                                                    {am.label}
                                                  </span>
                                                  {isLatest && (
                                                    <span
                                                      className="text-[9px] font-bold uppercase tracking-wide text-white px-1.5 py-0.5 rounded"
                                                      style={{
                                                        background: GOLD,
                                                      }}
                                                    >
                                                      Latest
                                                    </span>
                                                  )}
                                                </div>
                                                <p
                                                  className="text-[11px] mt-0.5"
                                                  style={{
                                                    color: "rgba(44,15,0,0.4)",
                                                  }}
                                                >
                                                  {entry.updatedAt
                                                    ? new Date(
                                                        entry.updatedAt,
                                                      ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                          day: "numeric",
                                                          month: "short",
                                                          year: "numeric",
                                                          hour: "numeric",
                                                          minute: "2-digit",
                                                        },
                                                      )
                                                    : "Date unavailable"}
                                                </p>
                                                {entry.note && (
                                                  <p
                                                    className="text-xs font-serif italic mt-1.5 rounded-lg px-3 py-1.5"
                                                    style={{
                                                      color: "#7A3B1E",
                                                      background:
                                                        "rgba(201,148,58,0.08)",
                                                      border:
                                                        "1px solid rgba(201,148,58,0.15)",
                                                    }}
                                                  >
                                                    "{entry.note}"
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quoted price + admin note */}
                      {(order.quotedPrice || order.adminNotes) && (
                        <div className="flex flex-col sm:flex-row gap-4 border-t border-stone-100 pt-4">
                          {order.quotedPrice && (
                            <div className="text-xs">
                              <span className="block text-stone-400 uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                                Quoted Price
                              </span>
                              <span className="text-stone-900 font-bold font-serif text-base">
                                ₹{order.quotedPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {order.adminNotes && (
                            <div className="text-xs flex-1 bg-amber-50/60 border border-amber-100 rounded-xl p-3">
                              <span className="block text-amber-700 uppercase tracking-wider font-bold text-[10px] mb-1">
                                Note from SwatiArts
                              </span>
                              <span className="text-stone-600 font-serif italic">
                                {order.adminNotes}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
