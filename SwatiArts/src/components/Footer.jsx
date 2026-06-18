import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ background: "#1A0A00", color: "#FAF3E0", padding: "80px 24px 32px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "48px", marginBottom: "60px" }}>

          {/* Brand */}
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#C9A84C", marginBottom: "12px" }}>SwatiArts</h3>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "20px" }}>Royal Embroidery</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "rgba(250,243,224,0.6)", lineHeight: 1.7 }}>
              Crafting timeless embroidery with love, tradition, and exceptional artistry since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#C9A84C", marginBottom: "24px" }}>Quick Links</h4>
            {[
              { name: "Home", path: "/" },
              { name: "Custom Order", path: "/custom-order" },
              { name: "About Us", path: "/about" },
              { name: "Contact", path: "/contact" },
            ].map((link) => (
              <Link key={link.name} to={link.path} style={{
                display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px",
                color: "rgba(250,243,224,0.6)", textDecoration: "none", marginBottom: "10px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"}
              onMouseLeave={e => e.target.style.color = "rgba(250,243,224,0.6)"}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#C9A84C", marginBottom: "24px" }}>Services</h4>
            {["Bridal Embroidery", "Custom Designs", "Bulk Orders", "Restoration Work", "Design Consultation"].map((s) => (
              <p key={s} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "rgba(250,243,224,0.6)", marginBottom: "10px" }}>{s}</p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Lato', sans-serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#C9A84C", marginBottom: "24px" }}>Contact</h4>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", color: "rgba(250,243,224,0.6)", lineHeight: 2 }}>
              <p>📍 Bareilly, Uttar Pradesh</p>
              <p>📞 +91 9193477564</p>
              <p>✉️ info@swatiarts.com</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.15)", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "rgba(250,243,224,0.3)", letterSpacing: "1px" }}>
            © 2026 SwatiArts. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ height: "1px", width: "40px", background: "rgba(201,168,76,0.3)" }} />
            <span style={{ color: "#C9A84C", fontSize: "16px" }}>✦</span>
            <div style={{ height: "1px", width: "40px", background: "rgba(201,168,76,0.3)" }} />
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", color: "rgba(250,243,224,0.3)", letterSpacing: "1px" }}>
            Crafted with ❤️ by sovran
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;