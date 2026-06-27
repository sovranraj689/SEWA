import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE } from "../api/auth";

/* ─── Typography tokens ─────────────────────────────────── */
const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

/* ─── Palette ───────────────────────────────────────────── */
const GOLD        = "#C9A84C";
const GOLD_LIGHT  = "#E8C96A";
const GOLD_DIM    = "rgba(201,168,76,0.18)";
const MAROON      = "#8B1A1A";
const DARK        = "#1A0A00";
const DARK2       = "#251200";
const CREAM       = "#FAF3E0";
const CREAM2      = "#F3EAD0";
const TEXT_MUTED  = "rgba(26,10,0,0.45)";
const SIDEBAR_BG  = "#130600";

/* ─── Shared input styles ───────────────────────────────── */
const inputBase = {
  width: "100%", boxSizing: "border-box",
  border: `1px solid ${GOLD_DIM}`,
  padding: "11px 14px",
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "16px",
  background: "#fff",
  color: DARK,
  outline: "none",
  transition: "border-color 0.2s",
};
const inputStyle         = { ...inputBase };
const inputDisabledStyle = { ...inputBase, background: "rgba(26,10,0,0.04)", color: TEXT_MUTED, cursor: "not-allowed" };
const labelStyle = {
  ...S, fontSize: "10px", letterSpacing: "2px",
  textTransform: "uppercase", color: MAROON,
  display: "block", marginBottom: "6px",
};

/* ─── Sidebar sections ──────────────────────────────────── */
const ADDRESS_LABELS = ["Home", "Work", "Other"];
const SECTIONS = [
  { key: "overview",   label: "Overview",      icon: "✦"  },
  { key: "profile",    label: "Edit Profile",  icon: "👤" },
  { key: "addresses",  label: "Addresses",     icon: "📍" },
  { key: "orders",     label: "My Orders",     icon: "📦" },
  { key: "wishlist",   label: "Wishlist",      icon: "♡"  },
  { key: "security",   label: "Security",      icon: "🔒" },
];

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════ */

function SectionCard({ title, subtitle, children, noPad }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        border: `1px solid ${GOLD_DIM}`,
        borderRadius: "2px",
        boxShadow: "0 2px 18px rgba(26,10,0,0.05)",
        padding: noPad ? 0 : "28px 32px",
        overflow: "hidden",
      }}
    >
      {(title || subtitle) && (
        <div style={{ padding: noPad ? "28px 32px 0" : 0, marginBottom: "22px" }}>
          {title    && <h2 style={{ ...P, fontSize: "20px", color: DARK, margin: 0 }}>{title}</h2>}
          {subtitle && <p  style={{ ...C, fontSize: "15px", color: TEXT_MUTED, margin: "4px 0 0" }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, value, icon, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fffdf5" : "#fff",
        border: `1px solid ${hovered ? GOLD : GOLD_DIM}`,
        borderRadius: "2px",
        padding: "22px 20px",
        textAlign: "left",
        cursor: "pointer",
        boxShadow: hovered ? `0 8px 28px rgba(201,168,76,0.13)` : "0 2px 12px rgba(26,10,0,0.04)",
        transition: "all 0.18s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
        }} />
      )}
      <div style={{ fontSize: "20px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ ...P, fontSize: "32px", color: GOLD, fontWeight: 700, lineHeight: 1, marginBottom: "6px" }}>{value}</div>
      <div style={{ ...S, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: TEXT_MUTED }}>{label}</div>
    </button>
  );
}

/* ─── Address form modal ─────────────────────────────────── */
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
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.pincode)
      return toast.error("Please fill all address fields");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = existing ? `${API_BASE}/api/auth/addresses/${existing._id}` : `${API_BASE}/api/auth/addresses`;
      const res = await fetch(url, {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      toast.success(existing ? "Address updated" : "Address added");
      onSaved(data.addresses);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(26,10,0,0.65)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}
    >
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background:CREAM,maxWidth:"520px",width:"100%",maxHeight:"88vh",overflowY:"auto",border:`1px solid ${GOLD_DIM}`,padding:"32px",borderRadius:"2px",boxShadow:"0 24px 64px rgba(26,10,0,0.2)" }}
      >
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px" }}>
          <h3 style={{ ...P,fontSize:"22px",color:DARK,margin:0 }}>{existing ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",color:MAROON,fontSize:"24px",cursor:"pointer",lineHeight:1,padding:"0 4px" }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:"16px" }}>
            <label style={labelStyle}>Label</label>
            <div style={{ display:"flex",gap:"8px" }}>
              {ADDRESS_LABELS.map((l) => (
                <button key={l} type="button" onClick={() => update("label",l)} style={{ ...S,fontSize:"11px",letterSpacing:"1px",padding:"8px 18px",border:"1px solid",cursor:"pointer",borderColor:form.label===l?GOLD:GOLD_DIM,background:form.label===l?GOLD:"transparent",color:form.label===l?DARK:"rgba(26,10,0,0.6)",fontWeight:form.label===l?700:400,transition:"all 0.15s" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px" }}>
            <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} value={form.fullName} onChange={(e)=>update("fullName",e.target.value)} /></div>
            <div><label style={labelStyle}>Phone *</label><input style={inputStyle} value={form.phone} onChange={(e)=>update("phone",e.target.value)} /></div>
          </div>
          <div style={{ marginBottom:"16px" }}>
            <label style={labelStyle}>Street Address *</label>
            <input style={inputStyle} value={form.street} onChange={(e)=>update("street",e.target.value)} placeholder="House no, street, locality" />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"20px" }}>
            <div><label style={labelStyle}>City *</label><input style={inputStyle} value={form.city} onChange={(e)=>update("city",e.target.value)} /></div>
            <div><label style={labelStyle}>State *</label><input style={inputStyle} value={form.state} onChange={(e)=>update("state",e.target.value)} /></div>
            <div><label style={labelStyle}>Pincode *</label><input style={inputStyle} value={form.pincode} onChange={(e)=>update("pincode",e.target.value)} /></div>
          </div>
          <label style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"24px",cursor:"pointer" }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e)=>update("isDefault",e.target.checked)} />
            <span style={{ ...S,fontSize:"12.5px",color:TEXT_MUTED }}>Set as default address</span>
          </label>
          <div style={{ display:"flex",gap:"12px" }}>
            <button type="button" onClick={onClose} style={{ flex:1,...S,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",padding:"13px",border:`1px solid ${GOLD}`,background:"transparent",color:GOLD,cursor:"pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex:1,...S,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",padding:"14px",border:`1px solid ${GOLD}`,background:GOLD,color:DARK,cursor:"pointer",fontWeight:700,opacity:saving?0.7:1 }}>
              {saving?"Saving...":"Save Address"}
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
      const res = await fetch(`${API_BASE}/api/auth/addresses/${address._id}`,{ method:"DELETE",headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Failed to remove address");
      toast.success("Address removed");
      onDeleted(data.addresses);
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(26,10,0,0.65)",backdropFilter:"blur(5px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}
    >
      <motion.div
        initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
        onClick={(e)=>e.stopPropagation()}
        style={{ background:CREAM,maxWidth:"400px",width:"100%",border:`1px solid rgba(139,26,26,0.25)`,padding:"32px",textAlign:"center",borderRadius:"2px",boxShadow:"0 24px 64px rgba(26,10,0,0.2)" }}
      >
        <div style={{ fontSize:"32px",marginBottom:"14px" }}>📍</div>
        <h3 style={{ ...P,fontSize:"20px",color:DARK,marginBottom:"8px" }}>Remove this address?</h3>
        <p style={{ ...C,fontSize:"15px",color:TEXT_MUTED,marginBottom:"24px" }}>
          {address.street}, {address.city} will be permanently removed.
        </p>
        <div style={{ display:"flex",gap:"10px" }}>
          <button onClick={onClose} style={{ flex:1,...S,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",padding:"12px",border:`1px solid ${GOLD}`,background:"transparent",color:GOLD,cursor:"pointer" }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex:1,...S,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",padding:"12px",border:`1px solid ${MAROON}`,background:MAROON,color:CREAM,cursor:"pointer",fontWeight:700,opacity:deleting?0.7:1 }}>
            {deleting?"Removing...":"Remove"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const [form, setForm]               = useState({ name:"", phone:"" });
  const [saving, setSaving]           = useState(false);

  const [pwForm, setPwForm]           = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [changingPw, setChangingPw]   = useState(false);

  const [addressModal, setAddressModal]     = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [orders, setOrders]           = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const res = await fetch(`${API_BASE}/api/auth/me`,{ headers:{ Authorization:`Bearer ${token}` } });
      if (res.status===401) { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); return; }
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      const data = await res.json();
      setUser(data.user);
      setForm({ name:data.user.name||"", phone:data.user.phone||"" });
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/orders/my`,{ headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) { const data=await res.json(); setOrders(data.orders||[]); }
    } catch {} finally { setOrdersLoading(false); }
  }, []);

  const readWishlist = useCallback(() => {
    try { const s=JSON.parse(localStorage.getItem("wishlist")||"[]"); setWishlistCount(Array.isArray(s)?s.length:0); }
    catch { setWishlistCount(0); }
  }, []);

  useEffect(() => { fetchProfile(); fetchOrders(); readWishlist(); }, [fetchProfile, fetchOrders, readWishlist]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/auth/profile`,{ method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({ name:form.name,phone:form.phone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message||"Failed to update profile");
      setUser(data.user);
      const cached=JSON.parse(localStorage.getItem("user")||"{}");
      localStorage.setItem("user",JSON.stringify({ ...cached,name:data.user.name,phone:data.user.phone }));
      toast.success("Profile updated");
    } catch(err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) return toast.error("Enter your current password");
    if (pwForm.newPassword.length<6) return toast.error("New password must be at least 6 characters");
    if (pwForm.newPassword!==pwForm.confirmPassword) return toast.error("New passwords don't match");
    setChangingPw(true);
    try {
      const token=localStorage.getItem("token");
      const res=await fetch(`${API_BASE}/api/auth/change-password`,{ method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({ currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword }) });
      const data=await res.json();
      if (!res.ok) throw new Error(data.message||"Failed to change password");
      toast.success("Password updated successfully");
      setPwForm({ currentPassword:"",newPassword:"",confirmPassword:"" });
    } catch(err) { toast.error(err.message); }
    finally { setChangingPw(false); }
  };

  const handleAddressSaved  = (addresses) => { setUser((u)=>({...u,addresses})); setAddressModal(null); };
  const handleAddressDeleted= (addresses) => { setUser((u)=>({...u,addresses})); setDeletingAddress(null); };

  /* ── Loading / error states ── */
  if (loading) return (
    <div style={{ background:CREAM,minHeight:"100vh",display:"flex",flexDirection:"column" }}>
      <Navbar />
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <p style={{ ...P,fontSize:"18px",color:GOLD }}>Loading your profile…</p>
      </div>
    </div>
  );

  if (error||!user) return (
    <div style={{ background:CREAM,minHeight:"100vh",display:"flex",flexDirection:"column" }}>
      <Navbar />
      <div style={{ textAlign:"center",padding:"100px 24px" }}>
        <p style={{ ...P,fontSize:"20px",color:MAROON,marginBottom:"10px" }}>Couldn't load profile</p>
        <p style={{ ...S,fontSize:"13px",color:TEXT_MUTED,marginBottom:"24px" }}>{error}</p>
        <button onClick={fetchProfile} style={{ ...S,fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",padding:"12px 32px",border:`1px solid ${GOLD}`,background:"transparent",color:GOLD,cursor:"pointer" }}>Try Again</button>
      </div>
      <Footer />
    </div>
  );

  const isAdmin      = !!user.isAdmin;
  const initial      = user.name?.[0]?.toUpperCase()||"?";
  const addresses    = user.addresses||[];
  const activeOrders = orders.filter((o)=>!["completed","cancelled"].includes(o.status)).length;
  const visibleSections = isAdmin ? SECTIONS.filter((s)=>["overview","profile","security"].includes(s.key)) : SECTIONS;

  /* ── Nav item ── */
  const NavItem = ({ s }) => {
    const active = activeSection===s.key;
    return (
      <button
        onClick={() => { setActiveSection(s.key); setMobileMenuOpen(false); }}
        style={{
          width:"100%", display:"flex", alignItems:"center", gap:"12px",
          ...S, fontSize:"12.5px", letterSpacing:"0.3px",
          padding:"12px 18px", border:"none", cursor:"pointer", textAlign:"left",
          background: active ? "rgba(201,168,76,0.1)" : "transparent",
          color: active ? GOLD : "rgba(245,230,200,0.55)",
          fontWeight: active ? 700 : 400,
          borderLeft: active ? `3px solid ${GOLD}` : "3px solid transparent",
          transition:"all 0.15s ease",
          position:"relative",
        }}
      >
        <span style={{ fontSize:"13px",width:"18px",textAlign:"center",flexShrink:0 }}>{s.icon}</span>
        {s.label}
        {(s.key==="wishlist" && wishlistCount>0) && (
          <span style={{ marginLeft:"auto",...S,fontSize:"9px",background:GOLD,color:DARK,padding:"2px 7px",fontWeight:700,letterSpacing:"0.5px" }}>{wishlistCount}</span>
        )}
        {(s.key==="orders" && activeOrders>0) && (
          <span style={{ marginLeft:"auto",...S,fontSize:"9px",background:GOLD,color:DARK,padding:"2px 7px",fontWeight:700,letterSpacing:"0.5px" }}>{activeOrders}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* ── Thin gold accent bar at very top ── */}
      <div style={{ height:"3px", background:`linear-gradient(90deg, ${MAROON} 0%, ${GOLD} 50%, ${MAROON} 100%)` }} />

      <Navbar />

      {/* ════════════════════════════════════════
          FULL-HEIGHT LAYOUT: sidebar fixed, content scrolls
      ════════════════════════════════════════ */}
      <div style={{ display:"flex", height:"calc(100vh - 3px)", overflow:"hidden" }} className="profile-root">

        {/* ── SIDEBAR (fixed height, internal scroll if needed) ── */}
        <aside style={{
          width:"260px", flexShrink:0,
          background:SIDEBAR_BG,
          borderRight:`1px solid rgba(201,168,76,0.12)`,
          display:"flex", flexDirection:"column",
          overflowY:"auto",
        }} className="profile-sidebar">

          {/* Gold accent line on left edge */}
          <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"3px",background:`linear-gradient(180deg,transparent,${GOLD},transparent)`,pointerEvents:"none",zIndex:1 }} />

          {/* Identity */}
          <div style={{ padding:"36px 24px 28px", textAlign:"center", borderBottom:"1px solid rgba(201,168,76,0.1)", flexShrink:0 }}>
            <div style={{
              width:"72px",height:"72px",borderRadius:"50%",margin:"0 auto 16px",
              background:`linear-gradient(135deg,${GOLD},${MAROON})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:CREAM,...P,fontSize:"26px",fontWeight:700,
              border:`2px solid rgba(201,168,76,0.4)`,
              boxShadow:`0 0 0 4px rgba(201,168,76,0.08)`,
            }}>
              {initial}
            </div>
            <div style={{ ...P,fontSize:"16px",color:CREAM,fontWeight:700,marginBottom:"3px",lineHeight:1.3 }}>{user.name}</div>
            <div style={{ ...S,fontSize:"10.5px",color:"rgba(245,230,200,0.35)",wordBreak:"break-all" }}>{user.email}</div>
            {isAdmin && (
              <div style={{ marginTop:"10px",...S,fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:GOLD,background:"rgba(201,168,76,0.1)",padding:"3px 10px",display:"inline-block" }}>
                Admin
              </div>
            )}
          </div>

          {/* Quick stats strip */}
          <div style={{ display:"flex",borderBottom:"1px solid rgba(201,168,76,0.1)",flexShrink:0 }}>
            {[
              { v:orders.length,  l:"Orders"    },
              { v:addresses.length,l:"Addresses" },
              ...(!isAdmin?[{ v:wishlistCount,l:"Wishlist" }]:[]),
            ].map((s,i,arr)=>(
              <div key={s.l} style={{ flex:1,textAlign:"center",padding:"14px 8px",borderRight:i<arr.length-1?`1px solid rgba(201,168,76,0.1)`:"none" }}>
                <div style={{ ...P,fontSize:"20px",color:GOLD,fontWeight:700,lineHeight:1 }}>{s.v}</div>
                <div style={{ ...S,fontSize:"8.5px",letterSpacing:"1px",textTransform:"uppercase",color:"rgba(245,230,200,0.3)",marginTop:"3px" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Nav */}
          <nav style={{ padding:"10px 0",flex:1 }}>
            <div style={{ ...S,fontSize:"8.5px",letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(245,230,200,0.2)",padding:"12px 18px 6px" }}>Navigation</div>
            {visibleSections.map((s)=><NavItem key={s.key} s={s} />)}
          </nav>

          {/* Bottom logout hint */}
          <div style={{ padding:"20px 18px",borderTop:"1px solid rgba(201,168,76,0.1)",flexShrink:0 }}>
            <div style={{ ...S,fontSize:"10px",color:"rgba(245,230,200,0.2)",letterSpacing:"0.5px" }}>
              Member since {new Date(user.createdAt).toLocaleDateString("en-IN",{ month:"short",year:"numeric" })}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT (scrollable) ── */}
        <main style={{
          flex:1, overflowY:"auto",
          background:CREAM2,
          display:"flex", flexDirection:"column",
        }} className="profile-main">

          {/* ── Mobile top bar (hamburger) ── */}
          <div className="profile-mobile-bar" style={{
            display:"none",alignItems:"center",justifyContent:"space-between",
            background:SIDEBAR_BG,padding:"12px 18px",flexShrink:0,
            borderBottom:`1px solid rgba(201,168,76,0.15)`,position:"relative",zIndex:50,
          }}>
            <button onClick={()=>setMobileMenuOpen((v)=>!v)} aria-label="Menu" style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:"4px",padding:"6px" }}>
              <span style={{ width:"20px",height:"2px",background:GOLD,display:"block" }} />
              <span style={{ width:"20px",height:"2px",background:GOLD,display:"block" }} />
              <span style={{ width:"20px",height:"2px",background:GOLD,display:"block" }} />
            </button>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <span style={{ ...S,fontSize:"13px",color:CREAM,fontWeight:700 }}>{visibleSections.find((s)=>s.key===activeSection)?.label}</span>
              <div style={{ width:"34px",height:"34px",borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},${MAROON})`,display:"flex",alignItems:"center",justifyContent:"center",color:CREAM,...P,fontSize:"14px",fontWeight:700 }}>{initial}</div>
            </div>
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  <div onClick={()=>setMobileMenuOpen(false)} style={{ position:"fixed",inset:0,zIndex:55 }} />
                  <motion.nav initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
                    style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:SIDEBAR_BG,border:`1px solid rgba(201,168,76,0.15)`,padding:"6px 0",zIndex:60 }}
                  >
                    {visibleSections.map((s)=><NavItem key={s.key} s={s} />)}
                  </motion.nav>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* ── Page header ── */}
          <div style={{ padding:"32px 40px 0",flexShrink:0 }} className="profile-content-pad">
            <p style={{ ...S,fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:MAROON,margin:"0 0 6px" }}>
              {isAdmin?"Admin Account":"My Account"}
            </p>
            <h1 style={{ ...P,fontSize:"clamp(24px,3.5vw,34px)",color:DARK,fontWeight:700,margin:0 }}>
              Welcome back,{" "}
              <span style={{ color:GOLD,fontStyle:"italic" }}>{user.name?.split(" ")[0]}</span>
            </h1>
            {/* Thin gold divider */}
            <div style={{ marginTop:"20px",height:"1px",background:`linear-gradient(90deg,${GOLD_DIM},transparent)` }} />
          </div>

          {/* ── Section content ── */}
          <div style={{ flex:1,padding:"28px 40px 60px" }} className="profile-content-pad">
            <AnimatePresence mode="wait">

              {/* OVERVIEW */}
              {activeSection==="overview" && (
                <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:"flex",flexDirection:"column",gap:"24px" }}>
                  {/* Stat cards */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"16px" }}>
                    <StatCard label="Total Orders"    value={orders.length}   icon="📦" onClick={()=>setActiveSection("orders")} />
                    <StatCard label="Active Orders"   value={activeOrders}    icon="🪡" onClick={()=>setActiveSection("orders")} />
                    <StatCard label="Saved Addresses" value={addresses.length} icon="📍" onClick={()=>setActiveSection("addresses")} />
                    {!isAdmin && <StatCard label="Wishlist Items" value={wishlistCount} icon="♡" onClick={()=>setActiveSection("wishlist")} />}
                  </div>

                  {/* Account snapshot */}
                  <SectionCard title="Account Snapshot">
                    <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
                      {[
                        { label:"Full Name",    value:user.name },
                        { label:"Email",        value:user.email },
                        { label:"Phone",        value:user.phone||"Not added" },
                        { label:"Member Since", value:new Date(user.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"long",year:"numeric" }) },
                      ].map((row,i,arr)=>(
                        <div key={row.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<arr.length-1?`1px solid ${GOLD_DIM}`:"none" }}>
                          <span style={{ ...S,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:TEXT_MUTED }}>{row.label}</span>
                          <span style={{ ...C,fontSize:"16.5px",color:DARK }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={()=>setActiveSection("profile")}
                      style={{ marginTop:"22px",...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",padding:"12px 28px",border:`1px solid ${GOLD}`,background:"transparent",color:GOLD,cursor:"pointer",transition:"all 0.15s" }}
                      onMouseEnter={(e)=>{e.currentTarget.style.background=GOLD;e.currentTarget.style.color=DARK;}}
                      onMouseLeave={(e)=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=GOLD;}}
                    >
                      Edit Profile →
                    </button>
                  </SectionCard>
                </motion.div>
              )}

              {/* EDIT PROFILE */}
              {activeSection==="profile" && (
                <motion.div key="profile" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <SectionCard title="Edit Profile" subtitle="Update your personal information">
                    <form onSubmit={handleSaveProfile}>
                      <div style={{ marginBottom:"16px" }}>
                        <label style={labelStyle}>Full Name *</label>
                        <input style={inputStyle} value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} />
                      </div>
                      <div style={{ marginBottom:"16px" }}>
                        <label style={labelStyle}>Email <span style={{ opacity:0.5,textTransform:"none",letterSpacing:0 }}>(cannot be changed)</span></label>
                        <input style={inputDisabledStyle} value={user.email} disabled />
                      </div>
                      <div style={{ marginBottom:"28px" }}>
                        <label style={labelStyle}>Phone Number</label>
                        <input style={inputStyle} value={form.phone} onChange={(e)=>setForm((f)=>({...f,phone:e.target.value}))} placeholder="10-digit phone number" />
                      </div>
                      <button type="submit" disabled={saving}
                        style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",padding:"14px 36px",border:`1px solid ${GOLD}`,background:GOLD,color:DARK,cursor:"pointer",fontWeight:700,opacity:saving?0.7:1 }}>
                        {saving?"Saving…":"Save Changes"}
                      </button>
                    </form>
                  </SectionCard>
                </motion.div>
              )}

              {/* ADDRESSES */}
              {activeSection==="addresses" && !isAdmin && (
                <motion.div key="addresses" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:"flex",flexDirection:"column",gap:"20px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
                    <div>
                      <h2 style={{ ...P,fontSize:"20px",color:DARK,margin:"0 0 4px" }}>Saved Addresses</h2>
                      <p style={{ ...C,fontSize:"15px",color:TEXT_MUTED,margin:0 }}>Manage delivery addresses for your orders</p>
                    </div>
                    <button onClick={()=>setAddressModal("new")} style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",padding:"11px 22px",border:`1px solid ${GOLD}`,background:GOLD,color:DARK,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap" }}>
                      + Add Address
                    </button>
                  </div>

                  {addresses.length===0 ? (
                    <div style={{ background:"#fff",border:`1px dashed rgba(201,168,76,0.3)`,padding:"56px",textAlign:"center",borderRadius:"2px" }}>
                      <div style={{ fontSize:"32px",marginBottom:"12px" }}>📍</div>
                      <p style={{ ...C,fontSize:"17px",color:TEXT_MUTED,margin:0 }}>No saved addresses yet</p>
                    </div>
                  ) : (
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px" }}>
                      {addresses.map((addr)=>(
                        <div key={addr._id} style={{ background:"#fff",border:`1px solid ${addr.isDefault?GOLD:GOLD_DIM}`,padding:"22px",position:"relative",borderRadius:"2px",boxShadow:"0 2px 12px rgba(26,10,0,0.04)" }}>
                          {addr.isDefault && <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,${GOLD},${GOLD_LIGHT})` }} />}
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px" }}>
                            <span style={{ ...S,fontSize:"9.5px",letterSpacing:"2px",textTransform:"uppercase",color:MAROON,background:"rgba(139,26,26,0.07)",padding:"4px 10px" }}>{addr.label}</span>
                            {addr.isDefault && <span style={{ ...S,fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:DARK,background:GOLD,padding:"3px 8px",fontWeight:700 }}>Default</span>}
                          </div>
                          <div style={{ ...S,fontSize:"14px",fontWeight:700,color:DARK,marginBottom:"5px" }}>{addr.fullName}</div>
                          <div style={{ ...C,fontSize:"15px",color:"rgba(26,10,0,0.65)",lineHeight:1.7,marginBottom:"5px" }}>
                            {addr.street}, {addr.city},<br/>{addr.state} – {addr.pincode}
                          </div>
                          <div style={{ ...S,fontSize:"12px",color:TEXT_MUTED,marginBottom:"18px" }}>📞 {addr.phone}</div>
                          <div style={{ display:"flex",gap:"14px" }}>
                            <button onClick={()=>setAddressModal(addr)} style={{ ...S,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:GOLD,background:"none",border:"none",cursor:"pointer",padding:0,borderBottom:`1px solid ${GOLD}` }}>Edit</button>
                            <button onClick={()=>setDeletingAddress(addr)} style={{ ...S,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:MAROON,background:"none",border:"none",cursor:"pointer",padding:0,borderBottom:`1px solid ${MAROON}` }}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* MY ORDERS */}
              {activeSection==="orders" && !isAdmin && (
                <motion.div key="orders" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <SectionCard title="My Orders" subtitle="Recent custom embroidery orders">
                    {ordersLoading ? (
                      <p style={{ ...C,fontSize:"16px",color:TEXT_MUTED }}>Loading orders…</p>
                    ) : orders.length===0 ? (
                      <div style={{ textAlign:"center",padding:"32px 0" }}>
                        <div style={{ fontSize:"32px",marginBottom:"12px" }}>📦</div>
                        <p style={{ ...C,fontSize:"17px",color:TEXT_MUTED,marginBottom:"18px" }}>You haven't placed any orders yet</p>
                        <Link to="/custom-order" style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",color:GOLD,textDecoration:"none",borderBottom:`1px solid ${GOLD}` }}>Place Your First Order →</Link>
                      </div>
                    ) : (
                      <>
                        <div style={{ display:"flex",flexDirection:"column",gap:"8px",marginBottom:"22px" }}>
                          {orders.slice(0,4).map((o)=>(
                            <div key={o._id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"rgba(201,168,76,0.04)",border:`1px solid ${GOLD_DIM}`,borderRadius:"1px" }}>
                              <div>
                                <div style={{ ...S,fontSize:"13px",fontWeight:700,color:DARK,marginBottom:"2px" }}>{o.clothType}</div>
                                <div style={{ ...S,fontSize:"11px",color:TEXT_MUTED }}>#{o._id.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short" })}</div>
                              </div>
                              <span style={{ ...S,fontSize:"9.5px",letterSpacing:"1px",textTransform:"uppercase",color:GOLD,border:`1px solid ${GOLD}`,padding:"4px 12px" }}>
                                {o.status.replace("_"," ")}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Link to="/my-orders" style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",color:GOLD,textDecoration:"none",borderBottom:`1px solid ${GOLD}` }}>
                          View All Orders & Track Status →
                        </Link>
                      </>
                    )}
                  </SectionCard>
                </motion.div>
              )}

              {/* WISHLIST */}
              {activeSection==="wishlist" && !isAdmin && (
                <motion.div key="wishlist" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <SectionCard title="Wishlist" subtitle="Designs you've saved for later">
                    {wishlistCount===0 ? (
                      <div style={{ textAlign:"center",padding:"32px 0" }}>
                        <div style={{ fontSize:"32px",marginBottom:"12px" }}>♡</div>
                        <p style={{ ...C,fontSize:"17px",color:TEXT_MUTED,marginBottom:"18px" }}>Your wishlist is empty</p>
                        <Link to="/#designs" style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",color:GOLD,textDecoration:"none",borderBottom:`1px solid ${GOLD}` }}>Browse Designs →</Link>
                      </div>
                    ) : (
                      <>
                        <p style={{ ...C,fontSize:"17px",color:"rgba(26,10,0,0.65)",marginBottom:"18px" }}>
                          You have <strong style={{ color:GOLD }}>{wishlistCount}</strong> design{wishlistCount!==1?"s":""} saved.
                        </p>
                        <Link to="/wishlist" style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",color:GOLD,textDecoration:"none",borderBottom:`1px solid ${GOLD}` }}>View Full Wishlist →</Link>
                      </>
                    )}
                  </SectionCard>
                </motion.div>
              )}

              {/* SECURITY */}
              {activeSection==="security" && (
                <motion.div key="security" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <SectionCard title="Change Password" subtitle="Leave blank if you don't want to change your password">
                    <form onSubmit={handleChangePassword}>
                      <div style={{ marginBottom:"16px" }}>
                        <label style={labelStyle}>Current Password</label>
                        <input type="password" style={inputStyle} value={pwForm.currentPassword} onChange={(e)=>setPwForm((f)=>({...f,currentPassword:e.target.value}))} />
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"28px" }}>
                        <div>
                          <label style={labelStyle}>New Password</label>
                          <input type="password" style={inputStyle} value={pwForm.newPassword} onChange={(e)=>setPwForm((f)=>({...f,newPassword:e.target.value}))} placeholder="Min. 6 characters" />
                        </div>
                        <div>
                          <label style={labelStyle}>Confirm New Password</label>
                          <input type="password" style={inputStyle} value={pwForm.confirmPassword} onChange={(e)=>setPwForm((f)=>({...f,confirmPassword:e.target.value}))} />
                        </div>
                      </div>
                      <button type="submit" disabled={changingPw}
                        style={{ ...S,fontSize:"10.5px",letterSpacing:"2px",textTransform:"uppercase",padding:"14px 36px",border:`1px solid ${MAROON}`,background:"transparent",color:MAROON,cursor:"pointer",fontWeight:700,opacity:changingPw?0.7:1 }}>
                        {changingPw?"Updating…":"Update Password"}
                      </button>
                    </form>
                  </SectionCard>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <Footer />
        </main>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {addressModal && <AddressFormModal existing={addressModal==="new"?null:addressModal} onClose={()=>setAddressModal(null)} onSaved={handleAddressSaved} />}
        {deletingAddress && <DeleteAddressConfirm address={deletingAddress} onClose={()=>setDeletingAddress(null)} onDeleted={handleAddressDeleted} />}
      </AnimatePresence>

      <style>{`
        /* ── Responsive: collapse sidebar on mobile ── */
        @media (max-width: 768px) {
          .profile-root { flex-direction: column; height: auto; overflow: visible; }
          .profile-sidebar { display: none !important; }
          .profile-main { overflow-y: visible; }
          .profile-mobile-bar { display: flex !important; }
          .profile-content-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }

        /* ── Scrollbar styling for sidebar & main ── */
        .profile-sidebar::-webkit-scrollbar,
        .profile-main::-webkit-scrollbar { width: 4px; }
        .profile-sidebar::-webkit-scrollbar-track { background: transparent; }
        .profile-sidebar::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }
        .profile-main::-webkit-scrollbar-track { background: transparent; }
        .profile-main::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 2px; }

        /* ── Input focus ring ── */
        input:focus { border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
      `}</style>
    </>
  );
}