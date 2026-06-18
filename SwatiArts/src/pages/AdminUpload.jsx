import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Neck", "Sleeve", "Border", "Full Body", "Dupatta", "Other"];
const TAGS_LIST = ["Bridal", "Zari", "Traditional", "Modern", "Colorful", "Gold", "Kashmiri", "Mirror", "Festive", "Premium"];

function AdminUpload() {
  const navigate = useNavigate(); // ✅ FIX 1: Import useNavigate
  const [form, setForm] = useState({ title: "", category: "", price: "", tags: [], description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleTag = (tag) => setForm(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please select an image");
    if (!form.category) return toast.error("Please select a category");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("images", image);
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v)
      );

      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json(); // ✅ FIX 2: Read the response
      toast.success("Design uploaded successfully!");

      // ✅ FIX 3: Navigate to home with a state flag so gallery knows to re-fetch
      // Using replace:false so user can go back if needed
      navigate("/", { state: { refresh: true } });

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "12px" }}>Admin</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", color: "#1A0A00", fontWeight: 700 }}>
            Upload <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Design</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Design Image *</label>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: "2px dashed rgba(201,168,76,0.4)", padding: "40px", cursor: "pointer",
              background: preview ? "transparent" : "rgba(201,168,76,0.03)",
              transition: "all 0.2s", minHeight: "200px",
            }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: "200px", objectFit: "contain" }} />
              ) : (
                <>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🖼️</div>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "rgba(26,10,0,0.4)" }}>Click to upload design image</span>
                  <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", color: "rgba(26,10,0,0.3)", marginTop: "4px", letterSpacing: "1px" }}>JPG, PNG, WEBP</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </label>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>Design Title *</label>
            <input className="input-royal" type="text" placeholder="e.g. Royal Zari Neckline" value={form.title} onChange={e => update("title", e.target.value)} required />
          </div>

          {/* Category */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Category *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => update("category", cat)}
                  style={{
                    fontFamily: "'Lato', sans-serif", fontSize: "12px", letterSpacing: "1px", padding: "10px 20px",
                    border: "1px solid", borderColor: form.category === cat ? "#C9A84C" : "rgba(201,168,76,0.25)",
                    background: form.category === cat ? "#C9A84C" : "transparent",
                    color: form.category === cat ? "#1A0A00" : "#C9A84C", cursor: "pointer", transition: "all 0.2s",
                  }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>Starting Price (₹) *</label>
            <input className="input-royal" type="number" placeholder="1200" value={form.price} onChange={e => update("price", e.target.value)} required />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "12px" }}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {TAGS_LIST.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  style={{
                    fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "1px", padding: "7px 16px",
                    border: "1px solid", borderColor: form.tags.includes(tag) ? "#8B1A1A" : "rgba(139,26,26,0.25)",
                    background: form.tags.includes(tag) ? "#8B1A1A" : "transparent",
                    color: form.tags.includes(tag) ? "#FAF3E0" : "#8B1A1A", cursor: "pointer", transition: "all 0.2s",
                  }}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "36px" }}>
            <label style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B1A1A", display: "block", marginBottom: "8px" }}>Description</label>
            <textarea className="input-royal" rows={4} placeholder="Describe this design..." value={form.description} onChange={e => update("description", e.target.value)} style={{ resize: "vertical" }} />
          </div>

          <button type="submit" className="btn-gold" disabled={loading} style={{ fontSize: "12px", padding: "16px 48px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Uploading..." : "Upload Design ✦"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminUpload;