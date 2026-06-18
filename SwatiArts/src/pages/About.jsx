import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 60, damping: 20 } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function About() {
  // Store only variables fetched from database
  const [liveData, setLiveData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchLiveVariables = async () => {
      try {
        const API_BASE = import.meta.env?.VITE_API_URL || "";
        const res = await fetch(`${API_BASE}/api/about`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
          const json = await res.json();
          setLiveData(json);
        }
      } catch (err) {
        console.error("Could not sync live variables:", err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchLiveVariables();
  }, []);

  // Safe fallback arrays if server hasn't responded yet
  const dynamicMetrics = liveData?.metrics || [];
  const dynamicValues = liveData?.values || [];

  return (
    <div className="min-h-screen text-stone-800 antialiased flex flex-col justify-between" style={{ background: "#FFFDF9" }}>
      <div>
        <Navbar />

        {/* HERO SECTION - FIXED BRANDING DESIGN */}
        <section className="relative overflow-hidden flex items-center justify-center py-32 px-6" style={{ background: "linear-gradient(135deg, #1A0A00, #4A0808, #1A0A00)" }}>
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #C9A84C 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center relative z-10 max-w-2xl"
          >
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#C9A84C]/80 bg-[#C9A84C]/10 px-4 py-1.5 rounded-full border border-[#C9A84C]/20 inline-block mb-6">
              Our Story & Heritage
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#FAF3E0] tracking-tight leading-tight">
              About <span className="text-[#C9A84C] italic font-normal font-sans block sm:inline">SwatiArts</span>
            </h1>
            <div className="w-12 h-[1px] bg-[#C9A84C]/40 mx-auto mt-8" />
          </motion.div>
        </section>

        {/* CORE CONTENT LAYER */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
          
          {/* STORY PARAGRAPHS (FIXED TEXT) & METRICS (DYNAMIC VARIABLES) */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
          >
            {/* Left Column: Handcoded Fixed Brand Story text for performance */}
            <motion.div variants={fadeInUp} className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C] block">Est. Meerut</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 leading-tight">
                A Legacy of Pure <br />
                <span className="text-[#C9A84C] italic font-normal font-sans">Artisan Craftsmanship</span>
              </h2>
              <div className="w-16 h-1 bg-[#C9A84C] rounded-full" />
              
              <p className="font-serif text-lg sm:text-xl text-stone-600/90 leading-relaxed pt-2">
                SwatiArts was born from a deep passion for preserving India's rich embroidery traditions. Founded in Meerut, we bring together skilled artisans who have mastered techniques passed down through generations.
              </p>
              <p className="font-serif text-lg sm:text-xl text-stone-600/90 leading-relaxed">
                Every stitch we create tells a unique story — of patience, ultimate artistry, and love for the craft. From delicate necklines to elaborate bridal ensembles, we transform raw fabric into timeless custom heirlooms.
              </p>
            </motion.div>

            {/* Right Column: Dynamic Numerical Variable Counter Box */}
            <motion.div 
              variants={fadeInUp}
              className="lg:col-span-5 rounded-3xl p-8 relative overflow-hidden shadow-xl border border-stone-200/40"
              style={{ background: "linear-gradient(135deg, #1A0A00, #360606)" }}
            >
              <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-[#C9A84C]/10 blur-xl" />
              
              <div className="text-center relative z-10 space-y-6">
                <div className="pb-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="font-serif text-7xl font-bold text-[#C9A84C] tracking-tight animate-pulse"
                  >
                    {loadingMetrics ? "--" : `${liveData?.yearsOfExcellence || 8}+`}
                  </motion.div>
                  <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#C9A84C]/60 mt-1">Years of Creative Excellence</div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#C9A84C]/15">
                  {loadingMetrics ? (
                    // Ghost skeleton loaders while waiting for metrics data variables
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                    ))
                  ) : (
                    dynamicMetrics.map((metric, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                      >
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-300/80 text-left">{metric.label}</span>
                        <span className="font-serif text-2xl font-bold text-[#C9A84C]">{metric.value}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* DYNAMIC CORE VALUES LAYOUT SECTION */}
          <div className="space-y-16">
            <div className="text-center space-y-3">
              <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#C9A84C] block">Our Core Pillars</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900">Values We Stitch By</h2>
              <div className="w-8 h-[2px] bg-[#C9A84C] mx-auto mt-4" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {loadingMetrics ? (
                // Skeleton grid array mapping
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-64 border border-stone-200/40 animate-pulse shadow-sm" />
                ))
              ) : (
                dynamicValues.map((v, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ 
                      y: -10, 
                      boxShadow: "0 20px 40px rgba(26,10,0,0.05)",
                      borderColor: "rgba(201,168,76,0.3)"
                    }}
                    className="bg-white rounded-2xl p-8 border border-stone-200/60 shadow-sm text-center transition-colors duration-300 relative group flex flex-col items-center justify-start"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                    <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:bg-[#FAF3E0] transition-colors duration-300">
                      {v.icon}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-3 group-hover:text-[#C9A84C] transition-colors duration-300">
                      {v.title}
                    </h3>
                    <p className="font-serif text-base text-stone-500 leading-relaxed">
                      {v.desc}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}