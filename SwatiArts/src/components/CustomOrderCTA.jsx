import { useState } from "react";
import {
  AnimatePresence,
  correctBorderRadius,
  motion,
  px,
} from "framer-motion";
import CustomOrderModal from "./CustomOrderModal";

const S = { fontFamily: "'Lato', sans-serif" };
const P = { fontFamily: "'Playfair Display', serif" };
const C = { fontFamily: "'Cormorant Garamond', serif" };

const GOLD = "#C9A84C";
const DARK = "#1A0A00";
const CREAM = "#FAF3E0";

export default function CustomOrderCTA() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      style={{
        padding: "100px 24px",
        background: `linear-gradient(135deg, ${DARK} 0%, #8B1A1A 100%)`,
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2
          style={{
            ...P,
            fontSize: "clamp(28px, 4.5vw, 44px)",
            color: CREAM,
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Ready to Create Something{" "}
          <span style={{ color: GOLD }}>Beautiful?</span>
        </h2>
        <p
          style={{
            ...C,
            fontSize: "18px",
            color: "rgba(245,230,200,0.75)",
            marginBottom: "36px",
          }}
        >
          Share your design idea and let our artisans weave magic
        </p>
        <motion.button
          onClick={() => setModalOpen(true)}
          whileHover={{
            scale: 1.03,
            borderRadius: "30px",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          style={{
            ...S,
            fontSize: "13px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "18px 44px",
            background: GOLD,
            color: DARK,
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            borderRadius: "0px",
          }}
        >
          Share Your Idea
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {modalOpen && <CustomOrderModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
