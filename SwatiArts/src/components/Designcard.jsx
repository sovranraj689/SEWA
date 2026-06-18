import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

function StarRating({ rating, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= Math.round(rating) ? "#C9A84C" : "rgba(201,168,76,0.25)", fontSize: "13px" }}>★</span>
        ))}
      </div>
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "rgba(26,10,0,0.5)" }}>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

function DesignCard({ design }) {
  const [hovered, setHovered] = useState(false);

  const {
    _id,
    title = "Untitled Design",
    category = "Embroidery",
    price = 0,
    image,
    rating = 4.5,
    reviewCount = 0,
    tags = [],
  } = design || {};

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FAF3E0",
        border: "1px solid rgba(201,168,76,0.2)",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.15)" : "0 4px 20px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#F0E4C8" }}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(201,168,76,0.3)", fontSize: "48px" }}>
            🪡
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          background: "rgba(26,10,0,0.8)", color: "#C9A84C",
          fontFamily: "'Lato', sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
          padding: "4px 10px",
        }}>
          {category}
        </div>

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(26,10,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}>
          <Link to={`/design/${_id}`}>
            <button className="btn-gold" style={{ fontSize: "11px", padding: "10px 24px" }}>
              View Details
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#1A0A00", marginBottom: "6px", fontWeight: 600 }}>
          {title}
        </h3>

        <StarRating rating={rating} count={reviewCount} />

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{
                fontFamily: "'Lato', sans-serif", fontSize: "10px", letterSpacing: "1px",
                color: "#8B1A1A", border: "1px solid rgba(139,26,26,0.3)",
                padding: "3px 8px",
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
          <div>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", color: "rgba(26,10,0,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Starting from</span>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#C9A84C", fontWeight: 700 }}>
              ₹{price.toLocaleString()}
            </div>
          </div>
          <Link to="/custom-order">
            <button className="btn-gold" style={{ fontSize: "10px", padding: "10px 16px" }}>
              Order Now
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default DesignCard;