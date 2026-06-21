// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import toast from "react-hot-toast";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { API_BASE } from "../api/auth";

// const S = { fontFamily: "'Lato', sans-serif" };
// const P = { fontFamily: "'Playfair Display', serif" };
// const C = { fontFamily: "'Cormorant Garamond', serif" };

// const GOLD = "#C9A84C";
// const MAROON = "#8B1A1A";
// const DARK = "#1A0A00";
// const CREAM = "#FAF3E0";

// const labelStyle = { ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: MAROON, display: "block", marginBottom: "8px" };
// const inputStyle = {
//   width: "100%", boxSizing: "border-box", border: "1px solid rgba(201,168,76,0.3)",
//   padding: "12px 14px", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
//   background: "#fff", color: DARK, outline: "none",
// };
// const inputDisabledStyle = { ...inputStyle, background: "rgba(26,10,0,0.04)", color: "rgba(26,10,0,0.45)", cursor: "not-allowed" };

// export default function Profile() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [form, setForm] = useState({ name: "", phone: "" });
//   const [saving, setSaving] = useState(false);

//   const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
//   const [changingPw, setChangingPw] = useState(false);

//   const fetchProfile = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/login");
//         return;
//       }
//       const API_BASE = import.meta.env?.VITE_API_URL || "";
//       const res = await fetch(`${API_BASE}/api/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 401) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         navigate("/login");
//         return;
//       }
//       if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
//       const data = await res.json();
//       setUser(data.user);
//       setForm({ name: data.user.name || "", phone: data.user.phone || "" });
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleSaveProfile = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) return toast.error("Name cannot be empty");

//     setSaving(true);
//     try {
//       const token = localStorage.getItem("token");
//       const API_BASE = import.meta.env?.VITE_API_URL || "";
//       const res = await fetch(`${API_BASE}/api/auth/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ name: form.name, phone: form.phone }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to update profile");

//       setUser(data.user);
//       // Keep localStorage's cached user in sync (Navbar reads name/isAdmin from here)
//       const cached = JSON.parse(localStorage.getItem("user") || "{}");
//       localStorage.setItem("user", JSON.stringify({ ...cached, name: data.user.name, phone: data.user.phone }));

//       toast.success("Profile updated");
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     if (!pwForm.currentPassword) return toast.error("Enter your current password");
//     if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
//     if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("New passwords don't match");

//     setChangingPw(true);
//     try {
//       const token = localStorage.getItem("token");
//       const API_BASE = import.meta.env?.VITE_API_URL || "";
//       const res = await fetch(`${API_BASE}/api/auth/change-password`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to change password");

//       toast.success("Password updated successfully");
//       setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setChangingPw(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ background: CREAM, minHeight: "100vh" }}>
//         <Navbar />
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
//           <p style={{ ...P, fontSize: "20px", color: GOLD }}>Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !user) {
//     return (
//       <div style={{ background: CREAM, minHeight: "100vh" }}>
//         <Navbar />
//         <div style={{ textAlign: "center", padding: "100px 24px" }}>
//           <p style={{ ...P, fontSize: "20px", color: MAROON, marginBottom: "12px" }}>Couldn't load profile</p>
//           <p style={{ ...S, fontSize: "13px", color: "rgba(26,10,0,0.5)", marginBottom: "24px" }}>{error}</p>
//           <button
//             onClick={fetchProfile}
//             style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "12px 32px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer" }}
//           >
//             Try Again
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   const isAdmin = !!user.isAdmin;
//   const initial = user.name?.[0]?.toUpperCase() || "?";

//   return (
//     <div style={{ background: CREAM, minHeight: "100vh" }}>
//       <Navbar />

//       <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 24px 100px" }}>

//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
//           style={{ textAlign: "center", marginBottom: "48px" }}
//         >
//           <div style={{
//             width: "84px", height: "84px", borderRadius: "50%", margin: "0 auto 18px",
//             background: `linear-gradient(135deg, ${GOLD}, ${MAROON})`,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             color: CREAM, ...P, fontSize: "32px", fontWeight: 700,
//             border: `3px solid ${CREAM}`, boxShadow: "0 4px 16px rgba(26,10,0,0.15)",
//           }}>
//             {initial}
//           </div>
//           <p style={{ ...S, fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: MAROON, marginBottom: "10px" }}>
//             {isAdmin ? "Admin Account" : "My Account"}
//           </p>
//           <h1 style={{ ...P, fontSize: "clamp(28px, 4vw, 38px)", color: DARK, fontWeight: 700 }}>
//             {user.name}
//           </h1>
//         </motion.div>

//         {/* Profile info card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//           style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "32px", marginBottom: "28px" }}
//         >
//           <h2 style={{ ...P, fontSize: "20px", color: DARK, marginBottom: "24px" }}>Account Information</h2>

//           <form onSubmit={handleSaveProfile}>
//             <div style={{ marginBottom: "18px" }}>
//               <label style={labelStyle}>Full Name *</label>
//               <input
//                 style={inputStyle}
//                 value={form.name}
//                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                 placeholder="Your full name"
//               />
//             </div>

//             <div style={{ marginBottom: "18px" }}>
//               <label style={labelStyle}>Email <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(cannot be changed)</span></label>
//               <input style={inputDisabledStyle} value={user.email} disabled />
//             </div>

//             <div style={{ marginBottom: "26px" }}>
//               <label style={labelStyle}>Phone Number</label>
//               <input
//                 style={inputStyle}
//                 value={form.phone}
//                 onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
//                 placeholder="10-digit phone number"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={saving}
//               style={{
//                 ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
//                 padding: "14px 36px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
//                 cursor: "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1,
//               }}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </motion.div>

//         {/* Password change — customers only, keeps admin profile simpler */}
//         {!isAdmin && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
//             style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "32px" }}
//           >
//             <h2 style={{ ...P, fontSize: "20px", color: DARK, marginBottom: "8px" }}>Change Password</h2>
//             <p style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.5)", marginBottom: "22px" }}>
//               Leave blank if you don't want to change your password.
//             </p>

//             <form onSubmit={handleChangePassword}>
//               <div style={{ marginBottom: "16px" }}>
//                 <label style={labelStyle}>Current Password</label>
//                 <input
//                   type="password"
//                   style={inputStyle}
//                   value={pwForm.currentPassword}
//                   onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
//                 />
//               </div>

//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
//                 <div>
//                   <label style={labelStyle}>New Password</label>
//                   <input
//                     type="password"
//                     style={inputStyle}
//                     value={pwForm.newPassword}
//                     onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
//                     placeholder="Min. 6 characters"
//                   />
//                 </div>
//                 <div>
//                   <label style={labelStyle}>Confirm New Password</label>
//                   <input
//                     type="password"
//                     style={inputStyle}
//                     value={pwForm.confirmPassword}
//                     onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={changingPw}
//                 style={{
//                   ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
//                   padding: "14px 36px", border: `1px solid ${MAROON}`, background: "transparent", color: MAROON,
//                   cursor: "pointer", fontWeight: 700, opacity: changingPw ? 0.7 : 1,
//                 }}
//               >
//                 {changingPw ? "Updating..." : "Update Password"}
//               </button>
//             </form>
//           </motion.div>
//         )}

//         <p style={{ ...S, fontSize: "11px", color: "rgba(26,10,0,0.35)", textAlign: "center", marginTop: "32px" }}>
//           Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
//         </p>
//       </div>

//       <Footer />
//     </div>
//   );

// }


import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE } from "../api/auth";

const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const GOLD = "#C9A84C";
const MAROON = "#8B1A1A";
const DARK = "#1A0A00";
const CREAM = "#FAF3E0";

const labelStyle = { ...S, fontSize: "10.5px", letterSpacing: "2px", textTransform: "uppercase", color: MAROON, display: "block", marginBottom: "7px" };
const inputStyle = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(201,168,76,0.3)",
  padding: "11px 13px", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
  background: "#fff", color: DARK, outline: "none",
};
const inputDisabledStyle = { ...inputStyle, background: "rgba(26,10,0,0.04)", color: "rgba(26,10,0,0.45)", cursor: "not-allowed" };

const ADDRESS_LABELS = ["Home", "Work", "Other"];

const SECTIONS = [
  { key: "overview", label: "Overview", icon: "✦" },
  { key: "profile", label: "Edit Profile", icon: "👤" },
  { key: "addresses", label: "Addresses", icon: "📍" },
  { key: "orders", label: "My Orders", icon: "📦" },
  { key: "wishlist", label: "Wishlist", icon: "♡" },
  { key: "security", label: "Security", icon: "🔒" },
];

function SectionCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "32px" }}
    >
      <h2 style={{ ...P, fontSize: "21px", color: DARK, marginBottom: subtitle ? "4px" : "22px" }}>{title}</h2>
      {subtitle && <p style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.5)", marginBottom: "22px" }}>{subtitle}</p>}
      {children}
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────
// Address form modal — used for both add & edit
// ───────────────────────────────────────────────────────────
function AddressFormModal({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    label: existing?.label || "Home",
    fullName: existing?.fullName || "",
    phone: existing?.phone || "",
    street: existing?.street || "",
    city: existing?.city || "",
    state: existing?.state || "",
    pincode: existing?.pincode || "",
    isDefault: existing?.isDefault || false,
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode) {
      return toast.error("Please fill all address fields");
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = existing
        ? `${API_BASE}/api/auth/addresses/${existing._id}`
        : `${API_BASE}/api/auth/addresses`;
      const res = await fetch(url, {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      toast.success(existing ? "Address updated" : "Address added");
      onSaved(data.addresses);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,10,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CREAM, maxWidth: "520px", width: "100%",
          maxHeight: "85vh", overflowY: "auto",
          border: `1px solid rgba(201,168,76,0.3)`, padding: "32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h3 style={{ ...P, fontSize: "22px", color: DARK }}>{existing ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: MAROON, fontSize: "22px", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Label</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {ADDRESS_LABELS.map((l) => (
                <button
                  key={l} type="button" onClick={() => update("label", l)}
                  style={{
                    ...S, fontSize: "11px", letterSpacing: "1px", padding: "8px 18px",
                    border: "1px solid", cursor: "pointer",
                    borderColor: form.label === l ? GOLD : "rgba(201,168,76,0.3)",
                    background: form.label === l ? GOLD : "transparent",
                    color: form.label === l ? DARK : "rgba(26,10,0,0.6)",
                    fontWeight: form.label === l ? 700 : 400,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Street Address *</label>
            <input style={inputStyle} value={form.street} onChange={(e) => update("street", e.target.value)} placeholder="House no, street, locality" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input style={inputStyle} value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input style={inputStyle} value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Pincode *</label>
              <input style={inputStyle} value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => update("isDefault", e.target.checked)} />
            <span style={{ ...S, fontSize: "12.5px", color: "rgba(26,10,0,0.6)" }}>Set as default address</span>
          </label>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
              padding: "13px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer",
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
              padding: "14px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
              cursor: "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1,
            }}>
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteAddressConfirm({ address, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/addresses/${address._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove address");
      toast.success("Address removed");
      onDeleted(data.addresses);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,10,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: CREAM, maxWidth: "400px", width: "100%", border: `1px solid rgba(139,26,26,0.3)`, padding: "30px", textAlign: "center" }}
      >
        <div style={{ fontSize: "30px", marginBottom: "14px" }}>📍</div>
        <h3 style={{ ...P, fontSize: "20px", color: DARK, marginBottom: "8px" }}>Remove this address?</h3>
        <p style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.6)", marginBottom: "24px" }}>
          {address.street}, {address.city} will be removed from your saved addresses.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            padding: "12px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{
            flex: 1, ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            padding: "12px", border: `1px solid ${MAROON}`, background: MAROON, color: CREAM,
            cursor: "pointer", fontWeight: 700, opacity: deleting ? 0.7 : 1,
          }}>
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  const [addressModal, setAddressModal] = useState(null); // null | "new" | addressObject
  const [deletingAddress, setDeletingAddress] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      const data = await res.json();
      setUser(data.user);
      setForm({ name: data.user.name || "", phone: data.user.phone || "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // non-critical for profile overview
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const readWishlist = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(Array.isArray(stored) ? stored.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    readWishlist();
  }, [fetchProfile, fetchOrders, readWishlist]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setUser(data.user);
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cached, name: data.user.name, phone: data.user.phone }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) return toast.error("Enter your current password");
    if (pwForm.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("New passwords don't match");
    setChangingPw(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      toast.success("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const handleAddressSaved = (addresses) => {
    setUser((u) => ({ ...u, addresses }));
    setAddressModal(null);
  };
  const handleAddressDeleted = (addresses) => {
    setUser((u) => ({ ...u, addresses }));
    setDeletingAddress(null);
  };

  if (loading) {
    return (
      <div style={{ background: CREAM, minHeight: "100vh" }}>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <p style={{ ...P, fontSize: "20px", color: GOLD }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ background: CREAM, minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 24px" }}>
          <p style={{ ...P, fontSize: "20px", color: MAROON, marginBottom: "12px" }}>Couldn't load profile</p>
          <p style={{ ...S, fontSize: "13px", color: "rgba(26,10,0,0.5)", marginBottom: "24px" }}>{error}</p>
          <button onClick={fetchProfile} style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "12px 32px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer" }}>
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = !!user.isAdmin;
  const initial = user.name?.[0]?.toUpperCase() || "?";
  const addresses = user.addresses || [];
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const visibleSections = isAdmin ? SECTIONS.filter((s) => ["overview", "profile", "security"].includes(s.key)) : SECTIONS;

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{ ...S, fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: MAROON, marginBottom: "8px" }}>
            {isAdmin ? "Admin Account" : "My Account"}
          </p>
          <h1 style={{ ...P, fontSize: "clamp(28px, 4vw, 38px)", color: DARK, fontWeight: 700 }}>
            Welcome, <span style={{ color: GOLD, fontStyle: "italic" }}>{user.name?.split(" ")[0]}</span>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "32px", alignItems: "start" }} className="profile-grid">

          {/* ── Sidebar ── */}
          <div style={{ background: DARK, border: `1px solid rgba(201,168,76,0.2)`, position: "sticky", top: "24px" }}>
            {/* Identity block */}
            <div style={{ padding: "28px 24px", textAlign: "center", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 14px",
                background: `linear-gradient(135deg, ${GOLD}, ${MAROON})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: CREAM, ...P, fontSize: "24px", fontWeight: 700,
                border: `2px solid ${CREAM}`,
              }}>
                {initial}
              </div>
              <div style={{ ...P, fontSize: "17px", color: CREAM, fontWeight: 700, marginBottom: "2px" }}>{user.name}</div>
              <div style={{ ...S, fontSize: "11px", color: "rgba(245,230,200,0.45)" }}>{user.email}</div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "10px" }}>
              {visibleSections.map((s) => {
                const active = activeSection === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      ...S, fontSize: "13px", letterSpacing: "0.5px",
                      padding: "13px 14px", border: "none", cursor: "pointer", textAlign: "left",
                      background: active ? "rgba(201,168,76,0.12)" : "transparent",
                      color: active ? GOLD : "rgba(245,230,200,0.65)",
                      fontWeight: active ? 700 : 400,
                      borderLeft: active ? `3px solid ${GOLD}` : "3px solid transparent",
                      transition: "background-color 0.15s ease, color 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{s.icon}</span>
                    {s.label}
                    {s.key === "wishlist" && wishlistCount > 0 && (
                      <span style={{ marginLeft: "auto", ...S, fontSize: "10px", background: GOLD, color: DARK, padding: "1px 7px", fontWeight: 700 }}>
                        {wishlistCount}
                      </span>
                    )}
                    {s.key === "orders" && activeOrders > 0 && (
                      <span style={{ marginLeft: "auto", ...S, fontSize: "10px", background: GOLD, color: DARK, padding: "1px 7px", fontWeight: 700 }}>
                        {activeOrders}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── Content ── */}
          <div style={{ minWidth: 0 }}>
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeSection === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                    {[
                      { label: "Total Orders", value: orders.length, icon: "📦", onClick: () => setActiveSection("orders") },
                      { label: "Active Orders", value: activeOrders, icon: "🪡", onClick: () => setActiveSection("orders") },
                      { label: "Saved Addresses", value: addresses.length, icon: "📍", onClick: () => setActiveSection("addresses") },
                      ...(isAdmin ? [] : [{ label: "Wishlist Items", value: wishlistCount, icon: "♡", onClick: () => setActiveSection("wishlist") }]),
                    ].map((stat) => (
                      <button
                        key={stat.label}
                        onClick={stat.onClick}
                        style={{
                          background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "22px",
                          textAlign: "left", cursor: "pointer", transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = "0 8px 20px rgba(26,10,0,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ fontSize: "22px", marginBottom: "10px" }}>{stat.icon}</div>
                        <div style={{ ...P, fontSize: "28px", color: GOLD, fontWeight: 700, lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ ...S, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(26,10,0,0.45)", marginTop: "6px" }}>{stat.label}</div>
                      </button>
                    ))}
                  </div>

                  <SectionCard title="Account Snapshot">
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { label: "Full Name", value: user.name },
                        { label: "Email", value: user.email },
                        { label: "Phone", value: user.phone || "Not added" },
                        { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                      ].map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                          <span style={{ ...S, fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "rgba(26,10,0,0.4)" }}>{row.label}</span>
                          <span style={{ ...C, fontSize: "16px", color: DARK }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveSection("profile")}
                      style={{ marginTop: "20px", ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "12px 28px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer" }}
                    >
                      Edit Profile
                    </button>
                  </SectionCard>
                </motion.div>
              )}

              {/* EDIT PROFILE */}
              {activeSection === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SectionCard title="Edit Profile" subtitle="Update your personal information">
                    <form onSubmit={handleSaveProfile}>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>Full Name *</label>
                        <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>Email <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(cannot be changed)</span></label>
                        <input style={inputDisabledStyle} value={user.email} disabled />
                      </div>
                      <div style={{ marginBottom: "24px" }}>
                        <label style={labelStyle}>Phone Number</label>
                        <input style={inputStyle} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit phone number" />
                      </div>
                      <button type="submit" disabled={saving} style={{
                        ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                        padding: "14px 36px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
                        cursor: "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1,
                      }}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </SectionCard>
                </motion.div>
              )}

              {/* ADDRESSES */}
              {activeSection === "addresses" && !isAdmin && (
                <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ ...P, fontSize: "21px", color: DARK }}>Saved Addresses</h2>
                      <p style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.5)" }}>Manage delivery addresses for your custom orders</p>
                    </div>
                    <button
                      onClick={() => setAddressModal("new")}
                      style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "11px 22px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      + Add Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div style={{ background: "#fff", border: "1px dashed rgba(201,168,76,0.35)", padding: "48px", textAlign: "center" }}>
                      <div style={{ fontSize: "32px", marginBottom: "12px" }}>📍</div>
                      <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.5)" }}>No saved addresses yet</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                      {addresses.map((addr) => (
                        <div key={addr._id} style={{ background: "#fff", border: `1px solid ${addr.isDefault ? GOLD : "rgba(201,168,76,0.2)"}`, padding: "22px", position: "relative" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <span style={{ ...S, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: MAROON, background: "rgba(139,26,26,0.07)", padding: "4px 10px" }}>
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span style={{ ...S, fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: DARK, background: GOLD, padding: "3px 8px", fontWeight: 700 }}>
                                Default
                              </span>
                            )}
                          </div>
                          <div style={{ ...S, fontSize: "14px", fontWeight: 700, color: DARK, marginBottom: "4px" }}>{addr.fullName}</div>
                          <div style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.65)", lineHeight: 1.6, marginBottom: "4px" }}>
                            {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                          </div>
                          <div style={{ ...S, fontSize: "12px", color: "rgba(26,10,0,0.4)", marginBottom: "16px" }}>📞 {addr.phone}</div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setAddressModal(addr)} style={{ ...S, fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: GOLD, background: "none", border: "none", cursor: "pointer", padding: 0, borderBottom: `1px solid ${GOLD}` }}>
                              Edit
                            </button>
                            <button onClick={() => setDeletingAddress(addr)} style={{ ...S, fontSize: "10.5px", letterSpacing: "1.5px", textTransform: "uppercase", color: MAROON, background: "none", border: "none", cursor: "pointer", padding: 0, borderBottom: `1px solid ${MAROON}` }}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* MY ORDERS (summary, links to full page) */}
              {activeSection === "orders" && !isAdmin && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SectionCard title="My Orders" subtitle="Recent custom embroidery orders">
                    {ordersLoading ? (
                      <p style={{ ...C, fontSize: "16px", color: "rgba(26,10,0,0.4)" }}>Loading orders...</p>
                    ) : orders.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <div style={{ fontSize: "30px", marginBottom: "10px" }}>📦</div>
                        <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.5)", marginBottom: "18px" }}>You haven't placed any orders yet</p>
                        <Link to="/custom-order" style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}>
                          Place Your First Order →
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                          {orders.slice(0, 4).map((o) => (
                            <div key={o._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)" }}>
                              <div>
                                <div style={{ ...S, fontSize: "13px", fontWeight: 700, color: DARK }}>{o.clothType}</div>
                                <div style={{ ...S, fontSize: "11px", color: "rgba(26,10,0,0.4)" }}>
                                  #{o._id.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </div>
                              </div>
                              <span style={{ ...S, fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", color: GOLD, border: `1px solid ${GOLD}`, padding: "4px 10px" }}>
                                {o.status.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Link to="/my-orders" style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}>
                          View All Orders & Track Status →
                        </Link>
                      </>
                    )}
                  </SectionCard>
                </motion.div>
              )}

              {/* WISHLIST (summary, links to full page) */}
              {activeSection === "wishlist" && !isAdmin && (
                <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SectionCard title="Wishlist" subtitle="Designs you've saved for later">
                    {wishlistCount === 0 ? (
                      <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <div style={{ fontSize: "30px", marginBottom: "10px" }}>♡</div>
                        <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.5)", marginBottom: "18px" }}>Your wishlist is empty</p>
                        <Link to="/#designs" style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}>
                          Browse Designs →
                        </Link>
                      </div>
                    ) : (
                      <>
                        <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.65)", marginBottom: "18px" }}>
                          You have <strong style={{ color: GOLD }}>{wishlistCount}</strong> design{wishlistCount !== 1 ? "s" : ""} saved.
                        </p>
                        <Link to="/wishlist" style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: GOLD, textDecoration: "none", borderBottom: `1px solid ${GOLD}` }}>
                          View Full Wishlist →
                        </Link>
                      </>
                    )}
                  </SectionCard>
                </motion.div>
              )}

              {/* SECURITY */}
              {activeSection === "security" && (
                <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SectionCard title="Change Password" subtitle="Leave blank if you don't want to change your password">
                    <form onSubmit={handleChangePassword}>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={labelStyle}>Current Password</label>
                        <input type="password" style={inputStyle} value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                        <div>
                          <label style={labelStyle}>New Password</label>
                          <input type="password" style={inputStyle} value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" />
                        </div>
                        <div>
                          <label style={labelStyle}>Confirm New Password</label>
                          <input type="password" style={inputStyle} value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
                        </div>
                      </div>
                      <button type="submit" disabled={changingPw} style={{
                        ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                        padding: "14px 36px", border: `1px solid ${MAROON}`, background: "transparent", color: MAROON,
                        cursor: "pointer", fontWeight: 700, opacity: changingPw ? 0.7 : 1,
                      }}>
                        {changingPw ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />

      <AnimatePresence>
        {addressModal && (
          <AddressFormModal
            existing={addressModal === "new" ? null : addressModal}
            onClose={() => setAddressModal(null)}
            onSaved={handleAddressSaved}
          />
        )}
        {deletingAddress && (
          <DeleteAddressConfirm
            address={deletingAddress}
            onClose={() => setDeletingAddress(null)}
            onDeleted={handleAddressDeleted}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 800px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

