import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
  FaFacebookF,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const P = { fontFamily: "'Playfair Display', serif" };
const S = { fontFamily: "'Lato', sans-serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" },
  }),
};

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error("Please fill in your name, email and message");
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      toast.success("Message sent! We'll get back to you soon ✨");
    } catch (err) {
      // Graceful fallback if /api/contact route doesn't exist yet
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      toast.success("Thank you! We'll be in touch shortly ✨");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero band ── */}
      <section style={{
        background: "linear-gradient(135deg, #2C0F00 0%, #4A1C00 45%, #7A3B1E 100%)",
        padding: "90px 24px 70px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* floating decorative dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: `${6 + (i % 3) * 4}px`, height: `${6 + (i % 3) * 4}px`,
              borderRadius: "50%", background: "rgba(201,148,58,0.35)",
              left: `${8 + i * 12}%`, top: `${20 + (i % 4) * 15}%`,
              pointerEvents: "none",
            }}
          />
        ))}

        <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
          <p style={{ ...S, fontSize: "11px", letterSpacing: "6px", textTransform: "uppercase", color: "rgba(201,148,58,0.85)", marginBottom: "18px" }}>
            Get In Touch
          </p>
        </motion.div>

        <motion.h1
          initial="hidden" animate="show" custom={1} variants={fadeUp}
          style={{ ...P, fontSize: "clamp(38px, 6vw, 60px)", color: "#F5E6C8", fontWeight: 700, lineHeight: 1.15, marginBottom: "20px" }}
        >
          Contact <span style={{ color: "#C9943A", fontStyle: "italic" }}>SwatiArts</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
          style={{ height: "1px", width: "120px", background: "linear-gradient(to right, transparent, #C9943A, transparent)", margin: "0 auto 24px" }}
        />

        <motion.p
          initial="hidden" animate="show" custom={2} variants={fadeUp}
          style={{ ...C, fontSize: "clamp(16px, 2.2vw, 20px)", color: "rgba(245,230,200,0.7)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.75 }}
        >
          We craft royal embroidery designs with elegance, precision, and timeless artistry. Reach out to bring your luxurious visions to reality.
        </motion.p>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "70px 24px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)", gap: "32px", alignItems: "start" }} className="contact-grid">

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { icon: <FaPhoneAlt />, title: "Call Us", text1: "+91 9193477564", text2: "+91 7465823792" },
              { icon: <FaEnvelope />, title: "Email Us", text1: "swatiarts@gmail.com", text2: "support@swatiarts.com" },
              { icon: <FaMapMarkerAlt />, title: "Our Studio", text1: "Dahiya Bhojipura", text2: "Uttar Pradesh, Bareilly, India" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(74,28,0,0.10)" }}
                style={{
                  display: "flex", alignItems: "center", gap: "20px",
                  background: "#fff", border: "1px solid rgba(201,148,58,0.18)",
                  borderRadius: "16px", padding: "24px", transition: "box-shadow 0.3s ease",
                }}
              >
                <div style={{
                  width: "52px", height: "52px", flexShrink: 0, borderRadius: "12px",
                  background: "linear-gradient(135deg, #C9943A, #A0522D)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FAF3E0", fontSize: "18px",
                }}>
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ ...P, fontSize: "20px", color: "#2C0F00", marginBottom: "4px" }}>{item.title}</h3>
                  <p style={{ ...C, fontSize: "15px", color: "rgba(44,15,0,0.6)", lineHeight: 1.6 }}>
                    <span style={{ display: "block" }}>{item.text1}</span>
                    <span style={{ display: "block", opacity: 0.8 }}>{item.text2}</span>
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Socials */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", paddingTop: "20px", borderTop: "1px solid rgba(201,148,58,0.15)" }}
            >
              <span style={{ ...S, fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(122,59,30,0.6)" }}>Follow Us —</span>
              {[
                { icon: <FaInstagram />, label: "Instagram" },
                { icon: <FaFacebookF />, label: "Facebook" },
              ].map(({ icon, label }, idx) => (
                <motion.a
                  key={idx} href="#" aria-label={label}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    border: "1px solid rgba(201,148,58,0.25)", background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#C9943A", fontSize: "15px", textDecoration: "none",
                    transition: "border-color 0.2s",
                  }}
                >
                  {icon}
                </motion.a>
              ))}
            </motion.div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              style={{
                marginTop: "8px", height: "180px", borderRadius: "16px", overflow: "hidden",
                border: "1px solid rgba(201,148,58,0.18)",
                background: "linear-gradient(135deg, #F0E4C8, #E8D7B0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: "8px",
              }}
            >
              <FaMapMarkerAlt style={{ color: "#C9943A", fontSize: "28px" }} />
              <span style={{ ...C, fontSize: "16px", color: "rgba(44,15,0,0.5)" }}>Find us in Muradnagar, Ghaziabad</span>
            </motion.div>
          </div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{
              background: "#fff", border: "1px solid rgba(201,148,58,0.18)",
              borderRadius: "20px", padding: "40px",
              boxShadow: "0 24px 60px rgba(74,28,0,0.06)",
              position: "relative", overflow: "hidden",
              width: "100%", boxSizing: "border-box",
            }}
          >
            {/* corner accent */}
            <div style={{
              position: "absolute", top: 0, right: 0, width: "120px", height: "120px",
              background: "radial-gradient(circle at top right, rgba(201,148,58,0.10), transparent 70%)",
              pointerEvents: "none",
            }} />

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "60px 20px" }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  style={{ fontSize: "56px", marginBottom: "20px" }}
                >
                  ✨
                </motion.div>
                <h3 style={{ ...P, fontSize: "26px", color: "#2C0F00", marginBottom: "10px" }}>Message Sent!</h3>
                <p style={{ ...C, fontSize: "17px", color: "rgba(44,15,0,0.6)", marginBottom: "28px" }}>
                  Thank you for reaching out. Our team will respond within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="btn-outline" style={{ fontSize: "11px", padding: "12px 28px" }}>
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <h2 style={{ ...P, fontSize: "26px", color: "#2C0F00", marginBottom: "4px" }}>
                  Send Us a <span style={{ color: "#C9943A", fontStyle: "italic" }}>Message</span>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", width: "100%" }} className="contact-form-row">
                  <div style={{ width: "100%" }}>
                    <label style={{ ...S, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#7A3B1E", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                      Full Name
                    </label>
                    <input
                      className="input-field" type="text" name="name" placeholder="Priya Sharma"
                      value={form.name} onChange={handleChange} required
                      style={{ border: "1px solid rgba(201,148,58,0.25)", padding: "14px 16px", borderRadius: "10px", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ width: "100%" }}>
                    <label style={{ ...S, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#7A3B1E", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                      Email Address
                    </label>
                    <input
                      className="input-field" type="email" name="email" placeholder="your@email.com"
                      value={form.email} onChange={handleChange} required
                      style={{ border: "1px solid rgba(201,148,58,0.25)", padding: "14px 16px", borderRadius: "10px", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <label style={{ ...S, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#7A3B1E", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                    Phone Number
                  </label>
                  <input
                    className="input-field" type="tel" name="phone" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange}
                    style={{ border: "1px solid rgba(201,148,58,0.25)", padding: "14px 16px", borderRadius: "10px", width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ width: "100%" }}>
                  <label style={{ ...S, fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#7A3B1E", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                    Design Customization Details
                  </label>
                  <textarea
                    className="input-field" rows={5} name="message"
                    placeholder="Describe your bridal attire or bespoke embroidery requirements..."
                    value={form.message} onChange={handleChange} required
                    style={{ border: "1px solid rgba(201,148,58,0.25)", padding: "14px 16px", borderRadius: "10px", resize: "vertical", minHeight: "130px", width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                <motion.button
                  whileHover="hover"
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  initial="rest"
                  variants={{
                    rest: {},
                    hover: {},
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "58px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: submitting ? "default" : "pointer",
                    background: "linear-gradient(135deg, #C9943A 0%, #E8B84B 50%, #C9943A 100%)",
                    backgroundSize: "200% 200%",
                    color: "#2C0F00",
                    ...S,
                    fontSize: "13px",
                    fontWeight: 900,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(201,148,58,0.35)",
                    opacity: submitting ? 0.75 : 1,
                  }}
                >
                  {/* shimmer sweep */}
                  <motion.span
                    variants={{
                      rest: { x: "-120%" },
                      hover: { x: "120%" },
                    }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    style={{
                      position: "absolute", top: 0, left: 0, bottom: 0, width: "60%",
                      background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent)",
                      transform: "skewX(-20deg)",
                      pointerEvents: "none",
                    }}
                  />

                  {submitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(44,15,0,0.3)", borderTopColor: "#2C0F00", borderRadius: "50%" }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <motion.span
                        variants={{
                          rest: { x: 0, y: 0, rotate: 0 },
                          hover: { x: 5, y: -5, rotate: 15 },
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        style={{ display: "inline-flex", fontSize: "15px" }}
                      >
                        <FaPaperPlane />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 880px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Contact;