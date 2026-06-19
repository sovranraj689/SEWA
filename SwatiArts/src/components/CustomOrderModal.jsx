import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const GOLD = "#C9A84C";
const MAROON = "#8B1A1A";
const DARK = "#1A0A00";
const CREAM = "#FAF3E0";

const CLOTH_TYPES = ["Suit", "Saree", "Lehenga", "Kurta", "Dupatta", "Blouse", "Other"];
const WORK_AREAS = ["Neckline", "Sleeve", "Border", "Full Body", "Dupatta", "Yoke", "Back"];
const EMBROIDERY_TYPES = ["Zari/Zardozi", "Thread Work", "Mirror Work", "Sequins", "Aari Work", "Resham", "Cutdana"];
const BUDGET_RANGES = ["Under ₹1,000", "₹1,000 - ₹3,000", "₹3,000 - ₹8,000", "₹8,000 - ₹15,000", "₹15,000+"];
const TIMELINES = ["Within 1 week", "1-2 weeks", "2-4 weeks", "1-2 months", "Flexible"];

const labelStyle = { ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: MAROON, display: "block", marginBottom: "8px" };
const inputStyle = {
  width: "100%", boxSizing: "border-box", border: "1px solid rgba(201,168,76,0.3)",
  padding: "12px 14px", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
  background: "#fff", color: DARK, outline: "none",
};

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...S, fontSize: "11px", letterSpacing: "1px",
        padding: "9px 16px", border: "1px solid", cursor: "pointer",
        borderColor: active ? GOLD : "rgba(201,168,76,0.3)",
        background: active ? GOLD : "transparent",
        color: active ? DARK : "rgba(26,10,0,0.6)",
        transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  );
}

export default function CustomOrderModal({ onClose, designId = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    clothType: "Suit",
    workArea: [],
    embroideryType: [],
    description: "",
    budget: BUDGET_RANGES[1],
    timeline: TIMELINES[2],
  });
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // object URLs
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleMulti = (field, value) => {
    setForm((f) => {
      const current = f[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...f, [field]: next };
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const combined = [...images, ...files].slice(0, 5); // backend limit: 5
    setImages(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
    setPreviews(nextImages.map((f) => URL.createObjectURL(f)));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name";
    if (!form.email.trim()) return "Please enter your email";
    if (!form.phone.trim()) return "Please enter your phone number";
    if (!form.description.trim()) return "Please describe your design idea";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return toast.error(validationError);

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("clothType", form.clothType);
      fd.append("workArea", JSON.stringify(form.workArea));
      fd.append("embroideryType", JSON.stringify(form.embroideryType));
      fd.append("description", form.description);
      fd.append("budget", form.budget);
      fd.append("timeline", form.timeline);
      if (designId) fd.append("designId", designId);
      images.forEach((file) => fd.append("referenceImages", file));

      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/custom`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit your order");
      }

      setSubmitted(true);
      toast.success("Your custom order has been submitted!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(26,10,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CREAM, maxWidth: "640px", width: "100%",
          maxHeight: "90vh", overflowY: "auto",
          border: `1px solid rgba(201,168,76,0.3)`,
        }}
      >
        {submitted ? (
          <div style={{ padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🪡</div>
            <h3 style={{ ...P, fontSize: "26px", color: DARK, marginBottom: "12px" }}>Thank You!</h3>
            <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.65)", lineHeight: 1.6, marginBottom: "28px" }}>
              Your custom design request has been submitted. Our artisans will review it and reach out to you shortly. You can track its progress anytime under <strong>My Orders</strong>.
            </p>
            <button
              onClick={onClose}
              style={{
                ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                padding: "14px 36px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
                cursor: "pointer", fontWeight: 700,
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${DARK} 0%, ${MAROON} 100%)`,
              padding: "32px 36px", position: "relative",
            }}>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: CREAM, fontSize: "26px", cursor: "pointer", lineHeight: 1, opacity: 0.8 }}
              >
                ×
              </button>
              <p style={{ ...S, fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: GOLD, marginBottom: "10px" }}>
                Bespoke Embroidery
              </p>
              <h2 style={{ ...P, fontSize: "28px", color: CREAM, fontWeight: 700 }}>
                Tell Us About Your <span style={{ color: GOLD, fontStyle: "italic" }}>Design</span>
              </h2>
              <p style={{ ...C, fontSize: "15px", color: "rgba(245,230,200,0.7)", marginTop: "8px" }}>
                Upload reference images and describe your vision — our artisans will bring it to life.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "32px 36px 36px" }}>

              {/* Contact info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input style={inputStyle} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="10-digit number" />
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Email *</label>
                <input type="email" style={inputStyle} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </div>

              {/* Cloth type */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Cloth Type *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {CLOTH_TYPES.map((c) => (
                    <Chip key={c} label={c} active={form.clothType === c} onClick={() => update("clothType", c)} />
                  ))}
                </div>
              </div>

              {/* Work area - multi select */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Where should the embroidery go? <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(select all that apply)</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {WORK_AREAS.map((a) => (
                    <Chip key={a} label={a} active={form.workArea.includes(a)} onClick={() => toggleMulti("workArea", a)} />
                  ))}
                </div>
              </div>

              {/* Embroidery type - multi select */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Embroidery Style <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(select all that apply)</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {EMBROIDERY_TYPES.map((t) => (
                    <Chip key={t} label={t} active={form.embroideryType.includes(t)} onClick={() => toggleMulti("embroideryType", t)} />
                  ))}
                </div>
              </div>

              {/* Budget + Timeline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                <div>
                  <label style={labelStyle}>Budget Range</label>
                  <select value={form.budget} onChange={(e) => update("budget", e.target.value)} style={inputStyle}>
                    {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Timeline</label>
                  <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)} style={inputStyle}>
                    {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Describe Your Design Idea *</label>
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Tell us about the pattern, colors, occasion, or any inspiration you have in mind..."
                />
              </div>

              {/* Image upload */}
              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Upload Reference Images <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(up to 5, optional)</span></label>

                <label
                  htmlFor="custom-order-upload"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: `1.5px dashed rgba(201,168,76,0.4)`, padding: "28px", cursor: "pointer",
                    background: "rgba(201,168,76,0.04)", textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "26px", marginBottom: "8px" }}>📎</span>
                  <span style={{ ...S, fontSize: "12px", color: MAROON, fontWeight: 700 }}>
                    Click to upload images
                  </span>
                  <span style={{ ...S, fontSize: "10.5px", color: "rgba(26,10,0,0.4)", marginTop: "4px" }}>
                    PNG, JPG up to 5 files
                  </span>
                  <input
                    id="custom-order-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                </label>

                {previews.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: "relative", width: "64px", height: "64px" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", border: "1px solid rgba(201,168,76,0.3)" }} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                          style={{
                            position: "absolute", top: "-8px", right: "-8px",
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: MAROON, color: "#fff", border: "none",
                            fontSize: "12px", cursor: "pointer", lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", ...S, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
                  padding: "16px", border: `1px solid ${GOLD}`, background: GOLD, color: DARK,
                  cursor: "pointer", fontWeight: 700, opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Custom Order"}
              </button>

              {!localStorage.getItem("token") && (
                <p style={{ ...S, fontSize: "11px", color: "rgba(26,10,0,0.4)", textAlign: "center", marginTop: "14px" }}>
                  You can submit as a guest, but logging in lets you track this order under "My Orders."
                </p>
              )}
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}