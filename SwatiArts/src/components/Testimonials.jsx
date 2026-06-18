import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const GOLD = "#C9A84C";
const MAROON = "#8B1A1A";
const DARK = "#1A0A00";
const CREAM = "#FAF3E0";

function StarRow({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? GOLD : "rgba(201,168,76,0.2)", fontSize: "15px" }}>★</span>
      ))}
    </span>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", padding: "32px", border: "1px solid rgba(201,168,76,0.12)" }}>
      <div className="testimonial-shimmer" style={{ height: "14px", width: "60%", marginBottom: "16px", background: "rgba(201,168,76,0.1)" }} />
      <div className="testimonial-shimmer" style={{ height: "11px", width: "100%", marginBottom: "8px", background: "rgba(201,168,76,0.08)" }} />
      <div className="testimonial-shimmer" style={{ height: "11px", width: "90%", marginBottom: "8px", background: "rgba(201,168,76,0.08)" }} />
      <div className="testimonial-shimmer" style={{ height: "11px", width: "70%", marginBottom: "24px", background: "rgba(201,168,76,0.08)" }} />
      <div className="testimonial-shimmer" style={{ height: "44px", width: "44px", borderRadius: "50%", background: "rgba(201,168,76,0.1)" }} />
    </div>
  );
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/designs/reviews/top?limit=6&minRating=4");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Testimonials fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopReviews();
  }, [fetchTopReviews]);

  // Don't render the section at all if there's genuinely nothing to show —
  // a testimonials section with zero real reviews would look broken/empty.
  if (!loading && !error && reviews.length === 0) return null;

  return (
    <section style={{ padding: "110px 24px", background: CREAM, position: "relative", overflow: "hidden" }}>
      {/* Decorative oversized quote mark, theme-colored, subtle */}
      <div style={{
        position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
        fontSize: "320px", fontFamily: "serif", color: "rgba(201,168,76,0.06)",
        lineHeight: 1, pointerEvents: "none", userSelect: "none",
      }}>
        "
      </div>

      <div style={{ maxWidth: "1140px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <p style={{ ...S, fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: MAROON, marginBottom: "16px" }}>
            Client Stories
          </p>
          <h2 style={{ ...P, fontSize: "clamp(32px, 5vw, 48px)", color: DARK, fontWeight: 700, marginBottom: "20px" }}>
            What Our <span style={{ color: GOLD, fontStyle: "italic" }}>Clients Say</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            <div style={{ height: "1px", width: "60px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.5))" }} />
            <span style={{ color: GOLD, fontSize: "16px" }}>✦</span>
            <div style={{ height: "1px", width: "60px", background: "linear-gradient(to left, transparent, rgba(201,168,76,0.5))" }} />
          </div>
          <p style={{ ...C, fontSize: "17px", color: "rgba(26,10,0,0.5)", marginTop: "18px" }}>
            Real reviews from customers who ordered custom embroidery designs.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ ...S, fontSize: "13px", color: "rgba(26,10,0,0.5)", marginBottom: "16px" }}>
              Couldn't load client reviews right now.
            </p>
            <button
              onClick={fetchTopReviews}
              style={{ ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", padding: "10px 26px", border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, cursor: "pointer" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Reviews grid */}
        {!loading && !error && reviews.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            {reviews.map((r, i) => (
              <TestimonialCard key={`${r.designId}-${r.userName}-${i}`} review={r} index={i} />
            ))}
          </div>
        )}

        {/* CTA to see more reviews on actual design pages */}
        {!loading && !error && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginTop: "56px" }}
          >
            <Link
              to="/#designs"
              style={{
                ...S, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
                color: MAROON, textDecoration: "none", borderBottom: `1px solid ${MAROON}`, paddingBottom: "4px",
              }}
            >
              Browse Designs &amp; Read More Reviews →
            </Link>
          </motion.div>
        )}
      </div>

      <style>{`
        .testimonial-shimmer {
          position: relative;
          overflow: hidden;
        }
        .testimonial-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: testimonial-sweep 1.4s infinite;
        }
        @keyframes testimonial-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}

function TestimonialCard({ review, index }) {
  const [hovered, setHovered] = useState(false);
  const initial = review.userName?.[0]?.toUpperCase() || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        padding: "36px",
        border: "1px solid",
        borderColor: hovered ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.15)",
        boxShadow: hovered ? "0 20px 50px rgba(139,26,26,0.1), 0 8px 20px rgba(201,168,76,0.08)" : "0 2px 10px rgba(26,10,0,0.04)",
        position: "relative",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Gold accent bar, grows on hover */}
      <motion.div
        animate={{ width: hovered ? "48px" : "28px" }}
        transition={{ duration: 0.25 }}
        style={{ height: "3px", background: `linear-gradient(to right, ${GOLD}, ${MAROON})`, marginBottom: "20px" }}
      />

      <div style={{ fontSize: "44px", color: "rgba(201,168,76,0.18)", fontFamily: "serif", lineHeight: 1, marginBottom: "8px" }}>
        "
      </div>

      <p style={{ ...C, fontSize: "18px", color: "rgba(26,10,0,0.78)", lineHeight: 1.7, marginBottom: "24px", flex: 1 }}>
        {review.comment}
      </p>

      {/* Which design this review was for — links back, reinforces it's real */}
      {review.designTitle && (
        <Link
          to={`/design/${review.designId}`}
          style={{
            ...S, fontSize: "10.5px", letterSpacing: "1px", color: MAROON, textDecoration: "none",
            marginBottom: "18px", display: "inline-flex", alignItems: "center", gap: "6px",
          }}
        >
          <span style={{ opacity: 0.6 }}>On:</span>
          <span style={{ borderBottom: "1px solid rgba(139,26,26,0.3)" }}>{review.designTitle}</span>
        </Link>
      )}

      <div style={{ height: "1px", background: "rgba(201,168,76,0.15)", marginBottom: "18px" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "46px", height: "46px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${GOLD}, ${MAROON})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: CREAM, ...P, fontSize: "17px", fontWeight: 700, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...S, fontSize: "13px", fontWeight: 700, color: DARK }}>
            {review.userName}
          </div>
          <div style={{ ...S, fontSize: "11px", color: "rgba(26,10,0,0.4)" }}>
            Verified Buyer · {timeAgo(review.createdAt)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", flexShrink: 0 }}>
          <StarRow rating={review.rating} />
        </div>
      </div>
    </motion.div>
  );
}