import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Designs", path: "/#designs" },
  { name: "Custom Order", path: "/custom-order" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function HeartIcon({ filled, className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.1 20.3c-.2.1-.5.1-.7 0C7.8 18.4 3 14.9 3 10.4 3 7.4 5.3 5 8.2 5c1.6 0 3.1.8 4 2.1C13.1 5.8 14.6 5 16.2 5 19.1 5 21.4 7.4 21.4 10.4c0 4.5-4.8 8-8.4 9.9z" />
    </svg>
  );
}

function LanguageToggle({ language, onSelect, className = "" }) {
  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-[#C9943A]/30 bg-[#2A0D00]/50 p-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSelect("en")}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer
          ${language === "en" ? "bg-[#C9943A] text-[#1A0500]" : "text-[#C9943A]/70 hover:text-[#C9943A]"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onSelect("hi")}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all cursor-pointer
          ${language === "hi" ? "bg-[#C9943A] text-[#1A0500]" : "text-[#C9943A]/70 hover:text-[#C9943A]"}`}
      >
        हिं
      </button>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = !!user?.isAdmin;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Sync wishlist badge (skipped entirely for admins — they don't use a wishlist)
  useEffect(() => {
    if (isAdmin) {
      setWishlistCount(0);
      return;
    }
    const readWishlist = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlistCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };

    readWishlist();
    window.addEventListener("storage", readWishlist);
    window.addEventListener("wishlistUpdated", readWishlist);

    return () => {
      window.removeEventListener("storage", readWishlist);
      window.removeEventListener("wishlistUpdated", readWishlist);
    };
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(localStorage.getItem("language") || "en");
    };
    window.addEventListener("storage", syncLanguage);
    window.addEventListener("languageChanged", syncLanguage);
    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("languageChanged", syncLanguage);
    };
  }, []);

  const switchLanguage = (lang) => {
    if (lang === language) return;
    localStorage.setItem("language", lang);
    setLanguage(lang);
    window.dispatchEvent(new Event("languageChanged"));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div ref={menuRef} className="sticky top-0 z-[200]">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full transition-all duration-300 backdrop-blur-md border-b text-white
          ${
            scrolled
              ? "bg-[#2C0F00]/98 border-[#C9943A]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              : "bg-[#2C0F00]/92 border-[#C9943A]/15"
          }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300
            ${scrolled ? "min-h-[64px]" : "min-h-[72px] sm:min-h-[80px]"}`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group select-none">
            <div className="w-13 h-13 rounded-full border-2 border-[#C9943A] overflow-hidden bg-[#F5E6C8] shrink-0 shadow-md">
              <img
                src="/logo.png"
                alt="SwatiArts"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg sm:text-xl font-bold text-[#C9943A] tracking-wide leading-tight">
                SwatiArts
              </div>
              <div className="xs:block font-sans text-[9px] sm:text-[10px] tracking-[6px] sm:tracking-[5px] uppercase text-[#C9943A]/60 font-semibold mt-0.5">
                Royal Hand Embroidery
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-10 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-sans tracking-[2px] uppercase text-xs xl:text-sm font-medium transition-colors duration-200 pb-1 relative group whitespace-nowrap
                  ${isActive(link.path) ? "text-[#C9943A]" : "text-[#FAF3E0]/70 hover:text-[#C9943A]"}`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 h-[1px] bg-[#C9943A] transition-all duration-300 
                  ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <LanguageToggle language={language} onSelect={switchLanguage} />

            {/* Wishlist — hidden entirely for admin accounts */}
            {!isAdmin && (
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all
                  ${isActive("/wishlist") ? "text-[#1A0500] bg-[#C9943A]" : "text-[#C9943A] hover:bg-[#C9943A]/10"}`}
              >
                <HeartIcon filled={wishlistCount > 0} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-[3px] rounded-full bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] text-[10px] font-bold leading-none shadow">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="font-sans text-xs tracking-widest uppercase text-[#C9943A] font-semibold hover:brightness-110 transition-all mr-2">
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/my-orders" className={`font-sans text-xs tracking-widest uppercase font-semibold transition-all mr-2 pb-1 border-b ${isActive("/my-orders") ? "text-[#C9943A] border-[#C9943A]" : "text-[#FAF3E0]/80 border-transparent hover:text-[#C9943A]"}`}>
                    My Orders
                  </Link>
                )}
                <Link
                  to="/profile"
                  aria-label="Profile"
                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all mr-1
                    ${isActive("/profile") ? "bg-[#C9943A] border-[#C9943A] text-[#1A0500]" : "border-[#C9943A]/30 text-[#C9943A] hover:bg-[#C9943A]/10"}`}
                  title="Profile"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 rounded border border-[#C9943A]/40 text-[#C9943A] hover:bg-[#C9943A]/10 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="px-5 py-2.5 rounded bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] text-xs font-bold uppercase tracking-wider transition-all hover:brightness-105 shadow-md whitespace-nowrap">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Hamburguer Toggle Button */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex flex-col items-center justify-center gap-[5px] w-11 h-11 border border-[#C9943A]/30 rounded-lg bg-[#2A0D00]/50 text-[#C9943A] cursor-pointer transition-all hover:bg-[#C9943A]/10 shrink-0"
            >
              <span className={`block w-5 h-[2px] bg-[#C9943A] rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-5 h-[2px] bg-[#C9943A] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : "opacity-100"}`} />
              <span className={`block w-5 h-[2px] bg-[#C9943A] rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 w-full sm:w-[340px] max-w-[88vw] z-[250] bg-[#220B00] border-l border-[#C9943A]/20 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#C9943A]/15 bg-[#1A0500]/40 shrink-0">
                <span className="font-serif text-lg font-bold text-[#C9943A] tracking-wide">Atelier Menu</span>
                <button onClick={() => setMenuOpen(false)} className="w-12 h-12 rounded-full border border-[#C9943A]/30 flex items-center justify-center text-[#C9943A] hover:bg-[#C9943A]/10 transition-all cursor-pointer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-0">
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + 1) * 0.045 }}>
                    <Link to={link.path} onClick={() => setMenuOpen(false)} className={`flex items-center font-serif text-lg py-3.5 border-b border-[#C9943A]/8 transition-all ${isActive(link.path) ? "text-[#C9943A] pl-2 font-bold" : "text-[#FAF3E0]/85 hover:text-[#C9943A]"}`}>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Wishlist Option — hidden entirely for admin accounts */}
                {!isAdmin && (
                  <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (NAV_LINKS.length + 1) * 0.045 }}>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className={`flex items-center justify-between font-serif text-lg py-3.5 border-b border-[#C9943A]/8 transition-all ${isActive("/wishlist") ? "text-[#C9943A] pl-2 font-bold" : "text-[#FAF3E0]/85 hover:text-[#C9943A]"}`}>
                      <span className="flex items-center gap-2.5">
                        <HeartIcon filled={wishlistCount > 0} className="w-4 h-4" />
                        Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#C9943A]/15 text-[#C9943A] text-xs font-bold">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )}
                
                {user && (
                  <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 }}>
                    {isAdmin ? (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className={`flex items-center font-serif text-lg py-3.5 border-b border-[#C9943A]/15 text-[#C9943A] font-bold bg-[#C9943A]/5 px-2 rounded`}>
                        ✨ Admin Dashboard
                      </Link>
                    ) : (
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)} className={`flex items-center font-serif text-lg py-3.5 border-b border-[#C9943A]/8 transition-all ${isActive("/my-orders") ? "text-[#C9943A] pl-2 font-bold" : "text-[#FAF3E0]/85"}`}>
                        📦 My Orders
                      </Link>
                    )}
                  </motion.div>
                )}
              </nav>

              <div className="shrink-0 px-6 py-5 border-t border-[#C9943A]/15 bg-[#1A0500]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#C9943A]/50 font-semibold">Language</span>
                  <LanguageToggle language={language} onSelect={switchLanguage} />
                </div>

                {user && (
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center py-3 rounded-lg border border-[#C9943A]/40 text-[#C9943A] font-semibold uppercase tracking-wider text-xs transition-all hover:bg-[#C9943A]/10 cursor-pointer"
                  >
                    👤 My Profile
                  </Link>
                )}

                {user ? (
                  <button onClick={handleLogout} className="w-full text-center py-3.5 rounded-lg bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] font-bold uppercase tracking-wider text-xs shadow-md cursor-pointer transition-all hover:brightness-105">
                    Logout Account
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-3.5 rounded-lg bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] font-bold uppercase tracking-wider text-xs shadow-md transition-all hover:brightness-105">
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}