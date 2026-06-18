import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            fontSize: interactive ? "28px" : "18px",
            color:
              star <= (hovered || rating) ? "#C9943A" : "rgba(201,148,58,0.2)",
            cursor: interactive ? "pointer" : "default",
            transition: "color 0.15s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function DesignDetail() {
  const { id } = useParams();
  const [design, setDesign] = useState(null); // 💡 Set to null initially so we know when database has loaded
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/designs/${id}`);

        // 1. Check if the server responded with a 2xx status code
        if (!res.ok) {
          // If it's a 400 error, the backend might still send JSON explaining why
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Server responded with status: ${res.status}`,
          );
        }

        // 2. If OK, safely parse the successful data
        const data = await res.json();
        setDesign(data.design);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch design:", error.message);
        // Optional: setError(error.message) to show it on your UI
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDesign();
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error("Please select a rating");
    if (!reviewForm.comment.trim())
      return toast.error("Please write a comment");
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to submit a review");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/designs/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast.success("Review submitted!");
      setReviewForm({ rating: 0, comment: "" });
      setReviews((prev) => [data.review, ...prev]);

      // Dynamically update total average count calculations live on screen
      setDesign((prev) => ({
        ...prev,
        reviewCount: (prev.reviewCount || 0) + 1,
      }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const S = { fontFamily: "'Lato', sans-serif" };
  const P = { fontFamily: "'Playfair Display', serif" };
  const C = { fontFamily: "'Cormorant Garamond', serif" };

  if (loading)
    return (
      <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <p style={{ ...P, fontSize: "24px", color: "#C9943A" }}>
            Loading design master files...
          </p>
        </div>
      </div>
    );

  // Fallback design render safety boundary wrapper
  if (!design)
    return (
      <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 24px" }}>
          <h2 style={{ ...P, color: "#2C0F00" }}>Design Not Found</h2>
          <p style={{ ...S, color: "rgba(44,15,0,0.6)", marginBottom: "24px" }}>
            The unique design matching reference identifier ID context code does
            not exist.
          </p>
          <Link
            to="/"
            style={{ ...S, color: "#C9943A", textDecoration: "underline" }}
          >
            Return to Dashboard Collections
          </Link>
        </div>
        <Footer />
      </div>
    );

  const images = design.images?.length ? design.images : [null];

  return (
    <div style={{ background: "#FAF3E0", minHeight: "100vh" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ background: "#2C0F00", padding: "14px 24px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {[
            { label: "Home", path: "/" },
            { label: "Designs", path: "/#designs" },
            { label: design.title },
          ].map((b, i, arr) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {b.path ? (
                <Link
                  to={b.path}
                  style={{
                    ...S,
                    fontSize: "12px",
                    letterSpacing: "1px",
                    color: "rgba(201,148,58,0.6)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C9943A")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(201,148,58,0.6)")
                  }
                >
                  {b.label}
                </Link>
              ) : (
                <span
                  style={{
                    ...S,
                    fontSize: "12px",
                    letterSpacing: "1px",
                    color: "#C9943A",
                  }}
                >
                  {b.label}
                </span>
              )}
              {i < arr.length - 1 && (
                <span
                  style={{ color: "rgba(201,148,58,0.3)", fontSize: "10px" }}
                >
                  ›
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}
      >
        {/* Main Product Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "60px",
            marginBottom: "80px",
          }}
        >
          {/* Image Gallery */}
          <div>
            <div
              style={{
                aspectRatio: "4/3",
                background: "linear-gradient(135deg, #4A1C00, #7A3B1E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={design.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "64px", marginBottom: "12px" }}>
                    🪡
                  </div>
                  <p
                    style={{
                      ...C,
                      fontSize: "16px",
                      color: "rgba(245,230,200,0.5)",
                    }}
                  >
                    Design Preview Image Missing
                  </p>
                </div>
              )}
              {/* Category badge */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "rgba(44,15,0,0.85)",
                  color: "#C9943A",
                  ...S,
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                }}
              >
                {design.category}
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: "72px",
                      height: "72px",
                      border: `2px solid ${activeImg === i ? "#C9943A" : "rgba(201,148,58,0.2)"}`,
                      cursor: "pointer",
                      overflow: "hidden",
                      background: "#4A1C00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "24px" }}>🪡</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {design.tags?.map((tag) => (
                <span
                  key={tag}
                  style={{
                    ...S,
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#C9943A",
                    border: "1px solid rgba(201,148,58,0.3)",
                    padding: "4px 10px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              style={{
                ...P,
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "#2C0F00",
                fontWeight: 700,
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              {design.title}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <StarRating rating={design.rating || 0} />
              <span
                style={{ ...S, fontSize: "13px", color: "rgba(44,15,0,0.5)" }}
              >
                {design.rating ? design.rating.toFixed(1) : "0.0"} (
                {design.reviewCount || 0} reviews)
              </span>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <span
                style={{
                  ...S,
                  fontSize: "11px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(44,15,0,0.4)",
                }}
              >
                Starting from
              </span>
              <div
                style={{
                  ...P,
                  fontSize: "42px",
                  color: "#C9943A",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                ₹{design.price?.toLocaleString()}
              </div>
            </div>

            <p
              style={{
                ...C,
                fontSize: "19px",
                color: "rgba(44,15,0,0.7)",
                lineHeight: 1.75,
                marginBottom: "32px",
              }}
            >
              {design.description}
            </p>

            {/* Specs */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(201,148,58,0.15)",
                padding: "24px",
                marginBottom: "32px",
              }}
            >
              {[
                { label: "Embroidery Type", value: design.embroideryType },
                { label: "Suitable Fabric", value: design.fabric },
                { label: "Delivery Time", value: design.deliveryTime },
                { label: "Category", value: design.category },
              ].map((spec) => (
                <div
                  key={spec.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(201,148,58,0.08)",
                  }}
                >
                  <span
                    style={{
                      ...S,
                      fontSize: "12px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "rgba(44,15,0,0.4)",
                    }}
                  >
                    {spec.label}
                  </span>
                  <span style={{ ...C, fontSize: "17px", color: "#2C0F00" }}>
                    {spec.value || "Not Specified"}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link
                to={`/custom-order?designId=${design._id}`}
                className="btn-primary"
                style={{ flex: 1, textAlign: "center", minWidth: "160px" }}
              >
                Order This Design
              </Link>
              <Link
                to={`/custom-order?designId=${design._id}&customize=true`}
                className="btn-outline"
                style={{ flex: 1, textAlign: "center", minWidth: "160px" }}
              >
                Customize It
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                height: "1px",
                flex: 1,
                background: "rgba(201,148,58,0.2)",
              }}
            />
            <h2
              style={{
                ...P,
                fontSize: "32px",
                color: "#2C0F00",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Customer{" "}
              <span style={{ color: "#C9943A", fontStyle: "italic" }}>
                Reviews
              </span>
            </h2>
            <div
              style={{
                height: "1px",
                flex: 1,
                background: "rgba(201,148,58,0.2)",
              }}
            />
          </div>

          {/* Rating summary */}
          <div
            style={{
              background: "#2C0F00",
              padding: "40px",
              marginBottom: "48px",
              display: "flex",
              gap: "48px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center", minWidth: "120px" }}>
              <div
                style={{
                  ...P,
                  fontSize: "64px",
                  color: "#C9943A",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {design.rating ? design.rating.toFixed(1) : "0.0"}
              </div>
              <StarRating rating={design.rating || 0} />
              <div
                style={{
                  ...S,
                  fontSize: "11px",
                  letterSpacing: "1px",
                  color: "rgba(245,230,200,0.4)",
                  marginTop: "8px",
                }}
              >
                {design.reviewCount || 0} reviews
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div
                    key={star}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        ...S,
                        fontSize: "12px",
                        color: "#C9943A",
                        width: "12px",
                      }}
                    >
                      {star}
                    </span>
                    <span style={{ color: "#C9943A", fontSize: "14px" }}>
                      ★
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "6px",
                        background: "rgba(201,148,58,0.1)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: "#C9943A",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        ...S,
                        fontSize: "11px",
                        color: "rgba(245,230,200,0.4)",
                        width: "20px",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review */}
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(201,148,58,0.15)",
              padding: "36px",
              marginBottom: "40px",
            }}
          >
            <h3
              style={{
                ...P,
                fontSize: "24px",
                color: "#2C0F00",
                marginBottom: "24px",
              }}
            >
              Share Your Experience
            </h3>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    ...S,
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#7A3B1E",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  Your Rating *
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  interactive
                  onRate={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    ...S,
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#7A3B1E",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  Your Review *
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Share your experience with this design..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, comment: e.target.value }))
                  }
                  style={{ resize: "vertical" }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(201,148,58,0.12)",
                  padding: "28px 32px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "3px",
                    background: "#C9943A",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #C9943A, #7A3B1E)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ...P,
                        fontSize: "16px",
                        color: "#FAF3E0",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {review.userName?.[0] || "U"}
                    </div>
                    <div>
                      <div
                        style={{
                          ...S,
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#2C0F00",
                        }}
                      >
                        {review.userName}
                      </div>
                      <div
                        style={{
                          ...S,
                          fontSize: "11px",
                          color: "rgba(44,15,0,0.4)",
                          letterSpacing: "1px",
                        }}
                      >
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p
                  style={{
                    ...C,
                    fontSize: "18px",
                    color: "rgba(44,15,0,0.75)",
                    lineHeight: 1.7,
                  }}
                >
                  {review.comment}
                </p>
                {review.helpful > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      ...S,
                      fontSize: "11px",
                      color: "rgba(44,15,0,0.35)",
                      letterSpacing: "1px",
                    }}
                  >
                    👍 {review.helpful} people found this helpful
                  </div>
                )}
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  ...C,
                  fontSize: "20px",
                  color: "rgba(44,15,0,0.4)",
                }}
              >
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
