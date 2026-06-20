import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const labelStyle = { ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: MAROON, display: "block", marginBottom: "8px" };
const inputStyle = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(201,168,76,0.3)",
  padding: "12px 14px", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
  background: "#fff", color: DARK, outline: "none",
};
const inputDisabledStyle = { ...inputStyle, background: "rgba(26,10,0,0.04)", color: "rgba(26,10,0,0.45)", cursor: "not-allowed" };

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const API_BASE = import.meta.env?.VITE_API_URL || "";
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
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name cannot be empty");

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env?.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUser(data.user);
      // Keep localStorage's cached user in sync (Navbar reads name/isAdmin from here)
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
      const API_BASE = import.meta.env?.VITE_API_URL || "";
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
          <button
            onClick={fetchProfile}
            style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "12px 32px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = !!user.isAdmin;
  const initial = user.name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ background: CREAM, minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 24px 100px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <div style={{
            width: "84px", height: "84px", borderRadius: "50%", margin: "0 auto 18px",
            background: `linear-gradient(135deg, ${GOLD}, ${MAROON})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: CREAM, ...P, fontSize: "32px", fontWeight: 700,
            border: `3px solid ${CREAM}`, boxShadow: "0 4px 16px rgba(26,10,0,0.15)",
          }}>
            {initial}
          </div>
          <p style={{ ...S, fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: MAROON, marginBottom: "10px" }}>
            {isAdmin ? "Admin Account" : "My Account"}
          </p>
          <h1 style={{ ...P, fontSize: "clamp(28px, 4vw, 38px)", color: DARK, fontWeight: 700 }}>
            {user.name}
          </h1>
        </motion.div>

        {/* Profile info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "32px", marginBottom: "28px" }}
        >
          <h2 style={{ ...P, fontSize: "20px", color: DARK, marginBottom: "24px" }}>Account Information</h2>

          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Email <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(cannot be changed)</span></label>
              <input style={inputDisabledStyle} value={user.email} disabled />
            </div>

            <div style={{ marginBottom: "26px" }}>
              <label style={labelStyle}>Phone Number</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit phone number"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                padding: "14px 36px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
                cursor: "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.div>

        {/* Password change — customers only, keeps admin profile simpler */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.2)", padding: "32px" }}
          >
            <h2 style={{ ...P, fontSize: "20px", color: DARK, marginBottom: "8px" }}>Change Password</h2>
            <p style={{ ...C, fontSize: "15px", color: "rgba(26,10,0,0.5)", marginBottom: "22px" }}>
              Leave blank if you don't want to change your password.
            </p>

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    style={inputStyle}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    style={inputStyle}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPw}
                style={{
                  ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                  padding: "14px 36px", border: `1px solid ${MAROON}`, background: "transparent", color: MAROON,
                  cursor: "pointer", fontWeight: 700, opacity: changingPw ? 0.7 : 1,
                }}
              >
                {changingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </motion.div>
        )}

        <p style={{ ...S, fontSize: "11px", color: "rgba(26,10,0,0.35)", textAlign: "center", marginTop: "32px" }}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <Footer />
    </div>
  );

}



