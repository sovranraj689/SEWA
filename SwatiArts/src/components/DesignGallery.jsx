import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All",
  "Neck",
  "Sleeve",
  "Border",
  "Full Body",
  "Dupatta",
  "Other",
];

const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const GOLD = "#C9A84C";
const MAROON = "#8B1A1A";
const DARK = "#1A0A00";
const CREAM = "#FAF3E0";
const GREEN = "#1A7A3C";

function seededDiscount(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 10 + (hash % 26); // 10% – 35%
}

function StarRating({ rating, size = 12 }) {
  return (
    <span style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= Math.round(rating) ? GOLD : "rgba(201,168,76,0.2)",
            fontSize: `${size}px`,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ───────────────────────────────────────────────────────────
// Edit Modal
// ───────────────────────────────────────────────────────────
function EditDesignModal({ design, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: design.title || "",
    category: design.category || "Neck",
    price: design.price ?? 0,
    embroideryType: design.embroideryType || "",
    fabric: design.fabric || "",
    deliveryTime: design.deliveryTime || "",
    description: design.description || "",
    tags: (design.tags || []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "tags") {
          fd.append(
            "tags",
            JSON.stringify(
              v
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            ),
          );
        } else {
          fd.append(k, v);
        }
      });

      const res = await fetch(`/api/designs/${design._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to update design");
      const data = await res.json();
      toast.success("Design updated");
      onSaved(data.design);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(201,168,76,0.3)",
    padding: "10px 12px",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "16px",
    background: "#fff",
    color: DARK,
  };
  const labelStyle = {
    ...S,
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: MAROON,
    display: "block",
    marginBottom: "6px",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,10,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CREAM,
          maxWidth: "520px",
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          border: "1px solid rgba(201,168,76,0.3)",
          padding: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ ...P, fontSize: "24px", color: DARK }}>Edit Design</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: MAROON,
              fontSize: "22px",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={labelStyle}>Embroidery Type</label>
              <input
                value={form.embroideryType}
                onChange={(e) => update("embroideryType", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Fabric</label>
              <input
                value={form.fabric}
                onChange={(e) => update("fabric", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Delivery Time</label>
            <input
              value={form.deliveryTime}
              onChange={(e) => update("deliveryTime", e.target.value)}
              style={inputStyle}
              placeholder="e.g. 10-14 days"
            />
          </div>

          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              style={inputStyle}
              placeholder="Bridal, Zari, Traditional"
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              ...S,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "13px",
              border: `1px solid ${GOLD}`,
              background: "transparent",
              color: GOLD,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              ...S,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "14px",
              border: `1px solid ${GOLD}`,
              background: GOLD,
              color: DARK,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// Delete Confirm Modal
// ───────────────────────────────────────────────────────────
function DeleteConfirmModal({ design, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/designs/${design._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete design");
      toast.success("Design deleted");
      onDeleted(design._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,10,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CREAM,
          maxWidth: "420px",
          width: "100%",
          border: `1px solid rgba(139,26,26,0.3)`,
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>🗑</div>
        <h3
          style={{ ...P, fontSize: "22px", color: DARK, marginBottom: "10px" }}
        >
          Delete this design?
        </h3>
        <p
          style={{
            ...C,
            fontSize: "16px",
            color: "rgba(26,10,0,0.6)",
            marginBottom: "28px",
          }}
        >
          "{design.title}" will be permanently removed, including its images.
          This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              ...S,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "13px",
              border: `1px solid ${GOLD}`,
              background: "transparent",
              color: GOLD,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              flex: 1,
              ...S,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "14px",
              border: `1px solid ${MAROON}`,
              background: MAROON,
              color: CREAM,
              cursor: "pointer",
              opacity: deleting ? 0.7 : 1,
              fontWeight: 700,
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// Icon button (admin controls)
// ───────────────────────────────────────────────────────────
function IconButton({ onClick, title, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "30px",
        height: "30px",
        border: `1px solid ${GOLD}`,
        background: hover ? GOLD : "rgba(26,10,0,0.88)",
        color: hover ? DARK : GOLD,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

// ───────────────────────────────────────────────────────────
// Wishlist heart (local-only, purely presentational delight)
// ───────────────────────────────────────────────────────────
function WishlistHeart({ designId }) {
  const [active, setActive] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return saved.includes(designId);
    } catch {
      return false;
    }
  });

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((prev) => {
      const next = !prev;
      try {
        const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const updated = next
          ? [...new Set([...saved, designId])]
          : saved.filter((id) => id !== designId);
        localStorage.setItem("wishlist", JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 4,
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.92)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        color: active ? MAROON : "rgba(26,10,0,0.35)",
        transition: "transform 0.15s ease, color 0.15s ease",
        transform: active ? "scale(1.08)" : "scale(1)",
        boxShadow: "0 1px 4px rgba(26,10,0,0.15)",
      }}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}

// ───────────────────────────────────────────────────────────
// Design Card — Flipkart/Myntra style product card
// ───────────────────────────────────────────────────────────
function DesignCard({ design, isAdmin, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const rawPrice = design.price;
  const price = typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice);
  const safePrice = !isNaN(price) ? price : 0;

  const discount = seededDiscount(design._id);
  const mrp = Math.round(safePrice / (1 - discount / 100));

  // crude deterministic delivery estimate, 3-7 days, based on id
  const deliveryDays = 3 + (design._id.charCodeAt(design._id.length - 1) % 5);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid",
        borderColor: hovered
          ? "rgba(201,168,76,0.45)"
          : "rgba(201,168,76,0.15)",
        boxShadow: hovered
          ? "0 10px 28px rgba(26,10,0,0.12)"
          : "0 1px 6px rgba(26,10,0,0.04)",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Admin controls */}
      {/* Admin controls */}
      {isAdmin && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 5,
            display: "flex",
            gap: "8px",
          }}
        >
          {/* EDIT BUTTON */}
          <motion.button
            title="Edit design"
            onClick={(e) => {
              e.preventDefault();
              onEdit(design);
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%", // Perfectly circular shape
              background: "transparent", // No background initially
              border: "1px solid #C9A84C", // Gold border outline
              color: "#C9A84C", // Gold icon initially
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
            }}
            whileHover={{
              backgroundColor: "#C9A84C", // Gold background fills in on hover
              color: "#fff", // Icon turns white on hover
            }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            whileTap={{ scale: 0.95 }}
          >
            ✎
          </motion.button>

          {/* DELETE BUTTON */}
          <motion.button
            title="Delete design"
            onClick={(e) => {
              e.preventDefault();
              onDelete(design);
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%", // Perfectly circular shape
              background: "transparent", // No background initially
              border: "1px solid #C9A84C", // Gold border outline
              color: "#C9A84C", // Gold icon initially
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              cursor: "pointer",
              outline: "none",
            }}
            whileHover={{
              backgroundColor: "#C9A84C", // Gold background fills in on hover
              color: "#fff", // Icon turns white on hover
            }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            whileTap={{ scale: 0.95 }}
          >
            🗑
          </motion.button>
        </div>
      )}

      {/* Wishlist heart (hidden for admin to avoid clashing with edit/delete) */}
      {!isAdmin && <WishlistHeart designId={design._id} />}

      <Link
        to={`/design/${design._id}`}
        style={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          color: "inherit",
        }}
      >
        {/* Image — square tile, full image always visible (contain, not cropped) */}
        <div
          style={{
            position: "relative",
            aspectRatio: "1/1",
            overflow: "hidden",
            background: "#FFF8EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {design.images?.[0] ? (
            <motion.img
              src={design.images[0]}
              alt={design.title}
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{ fontSize: "40px", marginBottom: "8px", opacity: 0.4 }}
              >
                🪡
              </div>
              <p
                style={{ ...C, fontSize: "13px", color: "rgba(26,10,0,0.35)" }}
              >
                No image
              </p>
            </div>
          )}

          {/* Discount ribbon — theme gold/maroon, not generic brown */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: MAROON,
              color: "#FFE9B0",
              ...S,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              padding: "6px 10px",
              textAlign: "center",
            }}
          >
            {discount}% OFF on this design
          </div>
        </div>

        {/* Card body */}
        <div
          style={{
            padding: "16px 18px 20px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Category tag, small like a brand label */}
          <span
            style={{
              ...S,
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: MAROON,
              marginBottom: "4px",
            }}
          >
            {design.category}
          </span>

          {/* Title */}
          <h3
            style={{
              ...P,
              fontSize: "17px",
              color: DARK,
              fontWeight: 700,
              marginBottom: "8px",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {design.title}
          </h3>

          {/* Rating pill — Flipkart style green badge */}
          {design.rating > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: GREEN,
                  color: "#fff",
                  ...S,
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "3px 7px",
                }}
              >
                {design.rating.toFixed(1)} ★
              </span>
              <span
                style={{ ...S, fontSize: "12px", color: "rgba(26,10,0,0.4)" }}
              >
                ({design.reviewCount || 0})
              </span>
            </div>
          ) : (
            <div style={{ marginBottom: "10px", height: "22px" }} />
          )}

          {/* Price block */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ ...S, fontSize: "19px", fontWeight: 700, color: DARK }}
            >
              ₹{safePrice.toLocaleString("en-IN")}
            </span>
            <span
              style={{
                ...S,
                fontSize: "13px",
                color: "rgba(26,10,0,0.4)",
                textDecoration: "line-through",
              }}
            >
              ₹{mrp.toLocaleString("en-IN")}
            </span>
            <span
              style={{ ...S, fontSize: "13px", color: GREEN, fontWeight: 700 }}
            >
              {discount}% off
            </span>
          </div>

          {/* Delivery estimate */}
          <div
            style={{
              ...S,
              fontSize: "12px",
              color: "rgba(26,10,0,0.45)",
              marginBottom: "12px",
            }}
          >
            🚚 Delivery in {deliveryDays}-{deliveryDays + 3} days
          </div>

          {/* Spacer pushes CTA to bottom for equal card heights */}
          <div style={{ flex: 1 }} />

          {/* CTA */}
          <motion.div
            animate={{
              backgroundColor: hovered ? "#C9943A" : "transparent",
              color: hovered ? "#fff" : "#C9943A",
              borderRadius: hovered ? "20px" : "0px",
            }}
            transition={{ duration: 0.18 }}
            style={{
              ...S,
              fontSize: "12px",
              fontWeight: " 600",
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "12px 0",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              border: "1px solid #D9B464",
            }}
          >
            View Details
            <motion.span
              animate={{ x: hovered ? 3 : 0 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: "14px" }}
            >
              →
            </motion.span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// Skeleton loading card (Flipkart-style shimmer placeholder)
// ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(201,168,76,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        className="shimmer"
        style={{ aspectRatio: "1/1", background: "rgba(201,168,76,0.08)" }}
      />
      <div style={{ padding: "13px 14px 16px" }}>
        <div
          className="shimmer"
          style={{
            height: "9px",
            width: "40%",
            marginBottom: "8px",
            background: "rgba(201,168,76,0.1)",
          }}
        />
        <div
          className="shimmer"
          style={{
            height: "13px",
            width: "80%",
            marginBottom: "10px",
            background: "rgba(201,168,76,0.1)",
          }}
        />
        <div
          className="shimmer"
          style={{
            height: "17px",
            width: "55%",
            marginBottom: "10px",
            background: "rgba(201,168,76,0.1)",
          }}
        />
        <div
          className="shimmer"
          style={{
            height: "30px",
            width: "100%",
            background: "rgba(201,168,76,0.1)",
          }}
        />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Main Gallery
// ───────────────────────────────────────────────────────────
export default function DesignGallery() {
  const location = useLocation();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [editingDesign, setEditingDesign] = useState(null);
  const [deletingDesign, setDeletingDesign] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = !!user?.isAdmin;

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/designs");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.designs || [];
      setDesigns(list.filter((d) => d.isActive !== false));
    } catch (err) {
      console.error("DesignGallery fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns, location.state?.refresh]);

  const handleDesignSaved = (updated) => {
    setDesigns((prev) =>
      prev.map((d) => (d._id === updated._id ? updated : d)),
    );
    setEditingDesign(null);
  };

  const handleDesignDeleted = (id) => {
    setDesigns((prev) => prev.filter((d) => d._id !== id));
    setDeletingDesign(null);
  };

  let filtered =
    activeCategory === "All"
      ? [...designs]
      : designs.filter((d) => d.category === activeCategory);

  if (sortBy === "price_low")
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sortBy === "price_high")
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sortBy === "rating")
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <section id="designs" style={{ padding: "100px 24px", background: CREAM }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            style={{
              ...S,
              fontSize: "11px",
              letterSpacing: "5px",
              textTransform: "uppercase",
              color: MAROON,
              marginBottom: "16px",
            }}
          >
            Our Collection
          </p>
          <h2
            style={{
              ...P,
              fontSize: "clamp(32px, 5vw, 48px)",
              color: DARK,
              fontWeight: 700,
              marginBottom: "18px",
            }}
          >
            Explore{" "}
            <span style={{ color: GOLD, fontStyle: "italic" }}>Designs</span>
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "60px",
                background:
                  "linear-gradient(to right, transparent, rgba(201,168,76,0.5))",
              }}
            />
            <span style={{ color: GOLD, fontSize: "16px" }}>✦</span>
            <div
              style={{
                height: "1px",
                width: "60px",
                background:
                  "linear-gradient(to left, transparent, rgba(201,168,76,0.5))",
              }}
            />
          </div>
        </div>

        {/* Sticky filter + sort bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "36px",
            padding: "14px 18px",
            background: "#fff",
            border: "1px solid rgba(201,168,76,0.18)",
            position: "sticky",
            top: "12px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...S,
                    fontSize: "10.5px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    border: "1px solid",
                    cursor: "pointer",
                    borderColor: active ? GOLD : "rgba(201,168,76,0.3)",
                    background: active ? GOLD : "transparent",
                    color: active ? DARK : "rgba(26,10,0,0.6)",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              ...S,
              fontSize: "11px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "9px 14px",
              border: "1px solid rgba(201,168,76,0.3)",
              background: "#fff",
              color: DARK,
              cursor: "pointer",
            }}
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Loading — skeleton grid */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <p
              style={{
                ...P,
                fontSize: "20px",
                color: MAROON,
                marginBottom: "12px",
              }}
            >
              Could not load designs
            </p>
            <p
              style={{
                ...S,
                fontSize: "13px",
                color: "rgba(26,10,0,0.5)",
                marginBottom: "24px",
              }}
            >
              {error}
            </p>
            <button
              onClick={fetchDesigns}
              style={{
                ...S,
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "12px 32px",
                border: `1px solid ${GOLD}`,
                background: "transparent",
                color: GOLD,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <div style={{ fontSize: "44px", marginBottom: "16px" }}>🪡</div>
            <p
              style={{
                ...P,
                fontSize: "22px",
                color: DARK,
                marginBottom: "12px",
              }}
            >
              {activeCategory === "All"
                ? "No designs yet"
                : `No ${activeCategory} designs yet`}
            </p>
            <p style={{ ...C, fontSize: "18px", color: "rgba(26,10,0,0.5)" }}>
              New designs will appear here once uploaded.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {filtered.map((design) => (
              <DesignCard
                key={design._id}
                design={design}
                isAdmin={isAdmin}
                onEdit={setEditingDesign}
                onDelete={setDeletingDesign}
              />
            ))}
          </motion.div>
        )}

        {/* Count */}
        {!loading && !error && filtered.length > 0 && (
          <p
            style={{
              ...S,
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(26,10,0,0.3)",
              textAlign: "center",
              marginTop: "44px",
            }}
          >
            {filtered.length} design{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All"
              ? ` in ${activeCategory}`
              : " in collection"}
          </p>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingDesign && (
          <EditDesignModal
            design={editingDesign}
            onClose={() => setEditingDesign(null)}
            onSaved={handleDesignSaved}
          />
        )}
        {deletingDesign && (
          <DeleteConfirmModal
            design={deletingDesign}
            onClose={() => setDeletingDesign(null)}
            onDeleted={handleDesignDeleted}
          />
        )}
      </AnimatePresence>

      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: shimmer-sweep 1.4s infinite;
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
