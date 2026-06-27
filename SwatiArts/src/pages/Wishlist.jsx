// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// export default function WishlistPage() {
//   const [wishlist, setWishlist] = useState([]);

//   // Load items from local storage and create event sync
//   useEffect(() => {
//     const loadWishlist = () => {
//       try {
//         const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
//         setWishlist(Array.isArray(stored) ? stored : []);
//       } catch {
//         setWishlist([]);
//       }
//     };

//     loadWishlist();
//     window.addEventListener("storage", loadWishlist);
//     window.addEventListener("wishlistUpdated", loadWishlist);

//     return () => {
//       window.removeEventListener("storage", loadWishlist);
//       window.removeEventListener("wishlistUpdated", loadWishlist);
//     };
//   }, []);

//   // Remove individual items from list and sync updates to navbar
//   const removeFromWishlist = (productId) => {
//     const updated = wishlist.filter((item) => item.id !== productId);
//     localStorage.setItem("wishlist", JSON.stringify(updated));
//     setWishlist(updated);
    
//     // Crucial: Let Navbar know it needs to subtract 1 item immediately
//     window.dispatchEvent(new Event("wishlistUpdated"));
//   };

//   return (
//     <div className="min-h-screen bg-[#1A0500] text-[#FAF3E0] py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="font-serif text-3xl sm:text-4xl text-[#C9943A] font-bold tracking-wide text-center mb-2">
//           Your Royal Wishlist
//         </h1>
//         <p className="text-center text-[#C9943A]/60 font-sans text-xs tracking-widest uppercase mb-12">
//           Curated Exquisite Hand Embroidery Designs
//         </p>

//         <AnimatePresence mode="popLayout">
//           {wishlist.length === 0 ? (
//             <motion.div 
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-20 border border-[#C9943A]/10 rounded-xl bg-[#2C0F00]/30 backdrop-blur"
//             >
//               <svg className="w-16 h-16 text-[#C9943A]/30 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
//               </svg>
//               <p className="text-lg text-[#FAF3E0]/70 font-medium mb-6">Your wishlist is currently empty.</p>
//               <Link to="/" className="inline-block px-6 py-3 rounded bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-105 transition-all">
//                 Explore Collection
//               </Link>
//             </motion.div>
//           ) : (
//             <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {wishlist.map((product) => (
//                 <motion.div
//                   layout
//                   key={product.id}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.25 }}
//                   className="bg-[#2C0F00]/60 border border-[#C9943A]/20 rounded-xl overflow-hidden group flex flex-col justify-between shadow-xl"
//                 >
//                   {/* Image wrapper */}
//                   <div className="relative aspect-square w-full overflow-hidden bg-[#1A0500] border-b border-[#C9943A]/10">
//                     <img
//                       src={product.image || "/placeholder.png"}
//                       alt={product.name}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                     {/* Delete item button */}
//                     <button
//                       onClick={() => removeFromWishlist(product.id)}
//                       className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1A0500]/80 border border-[#C9943A]/40 text-[#C9943A] hover:bg-[#C9943A] hover:text-[#1A0500] flex items-center justify-center transition-all cursor-pointer shadow-md"
//                       aria-label="Remove item"
//                     >
//                       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
//                       </svg>
//                     </button>
//                   </div>

//                   {/* Details box */}
//                   <div className="p-5 flex-1 flex flex-col justify-between gap-4">
//                     <div>
//                       <h3 className="font-serif text-lg font-bold text-[#C9943A] tracking-wide mb-1">
//                         {product.name}
//                       </h3>
//                       <p className="text-[#FAF3E0]/60 text-xs font-sans line-clamp-2 leading-relaxed">
//                         {product.description || "Authentic luxury royal embroidery art work."}
//                       </p>
//                     </div>

//                     <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C9943A]/10">
//                       <span className="font-sans font-bold text-[#C9943A]">
//                         {product.price ? `₹${product.price}` : "Custom Pricing"}
//                       </span>
//                       <Link
//                         to={`/designs/${product.id}`}
//                         className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded border border-[#C9943A]/40 text-[#C9943A] bg-transparent hover:bg-[#C9943A]/10 transition-all text-center"
//                       >
//                         View Details
//                       </Link>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../api/auth"; // adjust path if your auth.js lives elsewhere

const PRODUCT_BY_ID_ENDPOINT = (id) => `${API_BASE}/api/designs/${id}`;

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load items from local storage, heal legacy string-only entries, sync events
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const safeStored = Array.isArray(stored) ? stored : [];

        // Detect old/broken entries: plain strings, or objects missing id/name
        const needsHealing = safeStored.some(
          (item) => typeof item === "string" || !item?.id || !item?.name
        );

        if (!needsHealing) {
          setWishlist(safeStored);
          setLoading(false);
          return;
        }

        // Heal: fetch full product data for any broken entry
        const healed = await Promise.all(
          safeStored.map(async (item) => {
            const id = typeof item === "string" ? item : item?.id || item?._id;
            if (!id) return null;

            // Already a proper object, keep as-is
            if (typeof item === "object" && item.id && item.name) {
              return item;
            }

            try {
              const res = await fetch(PRODUCT_BY_ID_ENDPOINT(id));
              if (!res.ok) throw new Error("Failed to fetch product");
              const data = await res.json();
              const product = data.product || data; // handle either { product } or raw product

              return {
                id: product._id || id,
                name: product.name,
                image: product.images?.[0] || product.image || "",
                price: product.price,
                description: product.description,
              };
            } catch {
              return null; // drop items whose product no longer exists
            }
          })
        );

        const cleaned = healed.filter(Boolean);
        localStorage.setItem("wishlist", JSON.stringify(cleaned));
        setWishlist(cleaned);
      } catch {
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
    window.addEventListener("storage", loadWishlist);
    window.addEventListener("wishlistUpdated", loadWishlist);

    return () => {
      window.removeEventListener("storage", loadWishlist);
      window.removeEventListener("wishlistUpdated", loadWishlist);
    };
  }, []);

  // Remove individual items from list and sync updates to navbar
  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);

    // Crucial: Let Navbar know it needs to subtract 1 item immediately
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <div className="min-h-screen bg-[#1A0500] text-[#FAF3E0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#C9943A] font-bold tracking-wide text-center mb-2">
          Your Royal Wishlist
        </h1>
        <p className="text-center text-[#C9943A]/60 font-sans text-xs tracking-widest uppercase mb-12">
          Curated Exquisite Hand Embroidery Designs
        </p>

        {loading ? (
          <div className="text-center py-20 text-[#C9943A]/60 text-sm tracking-widest uppercase">
            Loading your wishlist...
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {wishlist.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 border border-[#C9943A]/10 rounded-xl bg-[#2C0F00]/30 backdrop-blur"
              >
                <svg className="w-16 h-16 text-[#C9943A]/30 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <p className="text-lg text-[#FAF3E0]/70 font-medium mb-6">Your wishlist is currently empty.</p>
                <Link to="/" className="inline-block px-6 py-3 rounded bg-gradient-to-r from-[#E0B84B] to-[#C9A84C] text-[#1A0500] text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-105 transition-all">
                  Explore Collection
                </Link>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#2C0F00]/60 border border-[#C9943A]/20 rounded-xl overflow-hidden group flex flex-col justify-between shadow-xl"
                  >
                    {/* Image wrapper */}
                    <div className="relative aspect-square w-full overflow-hidden bg-[#1A0500] border-b border-[#C9943A]/10">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Delete item button */}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1A0500]/80 border border-[#C9943A]/40 text-[#C9943A] hover:bg-[#C9943A] hover:text-[#1A0500] flex items-center justify-center transition-all cursor-pointer shadow-md"
                        aria-label="Remove item"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>

                    {/* Details box */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#C9943A] tracking-wide mb-1">
                          {product.name}
                        </h3>
                        <p className="text-[#FAF3E0]/60 text-xs font-sans line-clamp-2 leading-relaxed">
                          {product.description || "Authentic luxury royal embroidery art work."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C9943A]/10">
                        <span className="font-sans font-bold text-[#C9943A]">
                          {product.price ? `₹${product.price}` : "Custom Pricing"}
                        </span>
                        <Link
                          to={`/designs/${product.id}`}
                          className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded border border-[#C9943A]/40 text-[#C9943A] bg-transparent hover:bg-[#C9943A]/10 transition-all text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}