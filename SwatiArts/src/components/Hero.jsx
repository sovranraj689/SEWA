import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom"; // ✅ FIX: import useLocation

function Hero() {
  const location = useLocation(); // ✅ FIX: detect navigation state
  const [stats, setStats] = useState({
    designsCount: "...",
    happyClients: "1200+",
    experience: "8+"
  });
  const [loading, setLoading] = useState(true);

  const fetchHeroStats = useCallback(async () => {
    const API_BASE = import.meta.env.VITE_API_URL || "";

    try {
      const res = await fetch(`${API_BASE}/api/designs`);
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      const designArray = Array.isArray(data) ? data : data.designs || [];
      const totalActiveDesigns = designArray.filter(d => d.isActive !== false).length;
      setStats(prev => ({
        ...prev,
        designsCount: totalActiveDesigns > 0 ? `${totalActiveDesigns}+` : "0+"
      }));
    } catch (error) {
      console.error("Error connecting Hero to database metrics:", error);
      setStats(prev => ({ ...prev, designsCount: "500+" }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Re-fetch whenever navigated back with refresh:true state
  useEffect(() => {
    fetchHeroStats();
  }, [fetchHeroStats, location.state?.refresh]);

  return (
    <section
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1A0A00 0%, #2D1200 40%, #5C0F0F 70%, #1A0A00 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* BLACK EMBROIDERY DESIGN BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.28,
        }}
      >
        <img
          src="/embroidery.png"
          alt=""
          style={{
            position: "absolute",
            left: "-90px",
            bottom: "20px",
            width: "500px",
            filter: "brightness(0) saturate(0) contrast(160%) drop-shadow(0 0 10px rgba(0,0,0,0.8))",
            transform: "rotate(-8deg)",
          }}
        />
        <img
          src="/embroidery.png"
          alt=""
          style={{
            position: "absolute",
            right: "-90px",
            top: "0px",
            width: "500px",
            filter: "brightness(0) saturate(0) contrast(160%) drop-shadow(0 0 10px rgba(0,0,0,0.8))",
            transform: "scaleX(-1) rotate(-8deg)",
          }}
        />
      </div>

      {/* Decorative pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3,
        }}
      />

      {/* Corner ornaments */}
      <div style={{ position: "absolute", top: "20px", left: "20px", color: "rgba(201,168,76,0.35)", fontSize: "60px" }}>❧</div>
      <div style={{ position: "absolute", top: "20px", right: "20px", color: "rgba(201,168,76,0.35)", fontSize: "60px", transform: "scaleX(-1)" }}>❧</div>

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "40px 24px",
          maxWidth: "800px",
        }}
      >
        {/* Top ornamental line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <div style={{ height: "1px", width: "80px", background: "linear-gradient(to right, transparent, #C9A84C)" }} />
          <span style={{ color: "#C9A84C", fontSize: "20px" }}>✦</span>
          <div style={{ height: "1px", width: "80px", background: "linear-gradient(to left, transparent, #C9A84C)" }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "11px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: "20px",
          }}
        >
          Handcrafted with Love
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(52px, 8vw, 90px)",
            fontWeight: 700,
            color: "#FAF3E0",
            lineHeight: 1.1,
            marginBottom: "12px",
            textShadow: "0 0 25px rgba(0,0,0,0.6)",
          }}
        >
          Swati <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Sutra</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "18px",
            color: "rgba(201,168,76,0.7)",
            marginBottom: "32px",
            letterSpacing: "1px",
          }}
        >
          Royal Embroidery • Timeless Artistry
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "20px",
            color: "rgba(250,243,224,0.75)",
            maxWidth: "560px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          Transform your vision into exquisite embroidery. From delicate necklines to intricate patterns — we craft your dream onto fabric directly from our studio gallery.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a href="#designs">
            <button className="btn-gold" style={{ fontSize: "12px", padding: "16px 40px" }}>
              Explore Designs
            </button>
          </a>
          <Link to="/custom-order">
            <button className="btn-outline" style={{ fontSize: "12px", padding: "15px 40px" }}>
              Custom Order
            </button>
          </Link>
        </motion.div>

        {/* Dynamic Database Driven Counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{
            display: "flex",
            gap: "48px",
            justifyContent: "center",
            marginTop: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            { num: stats.designsCount, label: "Live Catalog Items" },
            { num: stats.happyClients, label: "Happy Clients" },
            { num: stats.experience, label: "Years Experience" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "32px",
                  color: "#C9A84C",
                  fontWeight: 700,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "rgba(250,243,224,0.5)",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(201,168,76,0.5)",
          fontSize: "24px",
        }}
      >
        ↓
      </motion.div>
    </section>
  );
}

export default Hero;
