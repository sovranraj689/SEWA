import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CLOTH_TYPES = ["Suit", "Saree", "Lehenga", "Kurta", "Dupatta", "Blouse", "Other"];
const WORK_AREAS = ["Neckline", "Sleeves", "Border", "Full Body", "Back", "Dupatta", "Custom Area"];
const EMBROIDERY_TYPES = ["Zari/Zardozi", "Aari Work", "Mirror Work", "Thread Work", "Kashmiri", "Kutch Work", "Phulkari", "Chikankari"];
const BUDGETS = ["Under ₹1,000", "₹1,000 - ₹3,000", "₹3,000 - ₹8,000", "₹8,000 - ₹15,000", "₹15,000+"];

function CustomOrder() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    clothType: "", workArea: [], embroideryType: [],
    description: "", budget: "", timeline: "",
    referenceImages: [],
  });
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleArray = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/orders/custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit order");
      toast.success("Order submitted! We'll contact you within 24 hours.");
      setStep(4);
    } catch (err) {
      toast.error("Please login to place an order");
    } finally {
      setLoading(false);
    }
  };

  const SelectChip = ({ options, field, multi = true }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {options.map((opt) => {
        const selected = multi ? form[field].includes(opt) : form[field] === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => multi ? toggleArray(field, opt) : update(field, opt)}
            style={{
              fontFamily: "'Lato', sans-serif", fontSize: "12px", letterSpacing: "1px",
              padding: "10px 20px", border: "1px solid",
              borderColor: selected ? "#C9A84C" : "rgba(201,168,76,0.25)",
              background: selected ? "#C9A84C" : "transparent",
              color: selected ? "#1A0A00" : "#C9A84C",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "12px" }}>Bespoke Service</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", color: "#1A0A00", fontWeight: 700 }}>
            Custom <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Order</span>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "rgba(26,10,0,0.6)", marginTop: "12px" }}>
            Share your vision and we'll craft something extraordinary
          </p>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: "50px" }}>
            {[1, 2, 3].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", border: "2px solid",
                  borderColor: step >= s ? "#C9A84C" : "rgba(201,168,76,0.25)",
                  background: step >= s ? "#C9A84C" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Lato', sans-serif", fontSize: "13px", fontWeight: 700,
                  color: step >= s ? "#1A0A00" : "rgba(201,168,76,0.4)",
                  flexShrink: 0,
                }}>
                  {s}
                </div>
                {i < 2 && <div style={{ flex: 1, height: "1px", background: step > s ? "#C9A84C" : "rgba(201,168,76,0.2)", margin: "0 8px" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#1A0A00", marginBottom: "32px" }}>Your Details</h2>
            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "SwatiSutra" },
              { name: "email", label: "Email", type: "email", placeholder: "your@email.com" },
              { name: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
            ].map((f) => (
              <div key={f.name} style={{ marginBottom: "24px" }}>
                <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>{f.label}</label>
                <input className="input-royal" type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={(e) => update(f.name, e.target.value)} />
              </div>
            ))}
            <button className="btn-gold" onClick={() => setStep(2)} style={{ marginTop: "16px", fontSize: "12px", padding: "16px 40px", rounded:'2px' }}>
              Next Step →
            </button>
          </motion.div>
        )}

        {/* Step 2: Design Details */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#1A0A00", marginBottom: "32px" }}>Design Details</h2>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Cloth Type</label>
              <SelectChip options={CLOTH_TYPES} field="clothType" multi={false} />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Work Area (select all that apply)</label>
              <SelectChip options={WORK_AREAS} field="workArea" />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Embroidery Type</label>
              <SelectChip options={EMBROIDERY_TYPES} field="embroideryType" />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ fontSize: "12px", padding: "14px 32px" }}>← Back</button>
              <button className="btn-gold" onClick={() => setStep(3)} style={{ fontSize: "12px", padding: "14px 32px" }}>Next Step →</button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Description & Submit */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", color: "#1A0A00", marginBottom: "32px" }}>Describe Your Vision</h2>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>Design Description</label>
              <textarea
                className="input-royal"
                rows={5}
                placeholder="Describe your design idea in detail — colors, patterns, inspiration, any specific requirements..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Budget Range</label>
              <SelectChip options={BUDGETS} field="budget" multi={false} />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>Required Timeline</label>
              <input className="input-royal" type="text" placeholder="e.g. 3 weeks, before Diwali, urgent..." value={form.timeline} onChange={(e) => update("timeline", e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-outline" onClick={() => setStep(2)} style={{ fontSize: "12px", padding: "14px 32px" }}>← Back</button>
              <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={{ fontSize: "12px", padding: "14px 32px", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Submit Order ✦"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", color: "#C9A84C", marginBottom: "16px" }}>Order Received!</h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "rgba(26,10,0,0.7)", maxWidth: "460px", margin: "0 auto 40px", lineHeight: 1.7 }}>
              Thank you for trusting SwatiArts with your vision. We'll review your requirements and contact you within 24 hours.
            </p>
            <button className="btn-gold" onClick={() => window.location.href = "/"} style={{ fontSize: "12px", padding: "16px 40px" }}>
              Back to Home
            </button>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CustomOrder;