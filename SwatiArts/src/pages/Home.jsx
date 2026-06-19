import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import DesignGallery from "../components/DesignGallery";
import Testimonials from "../components/Testimonials";
import CustomOrderCTA from "../components/CustomOrderCTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <div style={{ background: "#FAF3E0" }}>
      <Navbar />
      <Hero />
      <DesignGallery />

      {/* How It Works */}
      <section style={{ padding: "100px 24px", background: "#1A0A00" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "70px" }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "#8B1A1A", marginBottom: "16px" }}>Simple Process</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 48px)", color: "#FAF3E0", fontWeight: 700 }}>
              How It <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Works</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px" }}>
            {[
              { step: "01", icon: "💡", title: "Share Your Vision", desc: "Tell us your design idea — a neckline, sleeve pattern, or full outfit embroidery concept." },
              { step: "02", icon: "✏️", title: "Design Preview", desc: "Our artisans sketch your design digitally. You approve before we begin any work." },
              { step: "03", icon: "🪡", title: "Masterful Crafting", desc: "Skilled embroiderers bring your design to life with premium threads and techniques." },
              { step: "04", icon: "📦", title: "Delivered to You", desc: "Your finished piece is carefully packed and delivered to your doorstep." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: "center", padding: "40px 24px", border: "1px solid rgba(201,168,76,0.1)", position: "relative" }}
              >
                <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "60px", color: "rgba(201,168,76,0.06)", fontWeight: 900, position: "absolute", top: "16px", right: "20px", lineHeight: 1 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#C9A84C", marginBottom: "12px" }}>{item.title}</h3>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", color: "rgba(250,243,224,0.6)", lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <Link to="/custom-order">
              <button className="btn-gold" style={{ fontSize: "12px", padding: "18px 48px" }}>
                Start Your Custom Order
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials*/}
      <Testimonials />

      {/* CTA Banner */}
      <CustomOrderCTA />

      <Footer />
    </div>
  );
}

export default Home;