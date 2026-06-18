import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success("Welcome Back ✨");
    navigate(data.user.isAdmin ? "/admin" : "/");
  } catch (err) {
    toast.error(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1A0A00] via-[#2D1200] to-[#5C0F0F] flex items-center justify-center px-4 py-10">
      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[450px] h-[450px] rounded-full bg-[#C9A84C]/20 blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full bg-[#8B1A1A]/20 blur-[120px]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
            }}
            className="absolute rounded-full bg-[#C9A84C]/20"
            style={{
              width: `${6 + i}px`,
              height: `${6 + i}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.85,
          y: 60,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
        }}
        className="relative w-full max-w-lg overflow-hidden bg-[#FAF3E0]/95 border border-[#C9A84C]/20 shadow-2xl"
      >
        {/* Top Border */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#8B1A1A] via-[#C9A84C] to-[#8B1A1A]" />

        <div className="px-8 py-12 sm:px-10">
          {/* Logo */}
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mb-10 text-center"
          >
            <div className="relative mx-auto mb-5 flex items-center justify-center">
              {/* Outer Rotating Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-25 h-25 rounded-full bg-gradient-to-br from-[#C9A84C] via-[#F5E6C8] to-[#A36D00] shadow-[0_10px_40px_rgba(201,168,76,0.45)]"
              />

              {/* Logo Circle */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 w-18 h-18 rounded-full overflow-hidden border-3 border-[#C9943A] bg-[#F5E6C8] shadow-xl"
              >
                <img
                  src="/logo.png"
                  alt="SwatiArts"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </motion.div>
            </div>

            {/* Custom Brand Header with 30% Opacity */}
            <h1 className="font-logo-script text-5xl font-semibold tracking-wider  bg-gradient-to-b from-[#4A2600]/70 via-[#a1671b] to-[#f7bd49] bg-clip-text text-transparent select-none antialiased py-2">
              SwatiArts
            </h1>

            <p className="mt-2 text-[12px] uppercase tracking-[8px] text-[#2D1200]/70">
              Welcome Back
            </p>
          </motion.div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <label className="mb-2 block font-serif text-[11px] uppercase tracking-[2px] text-[#8B1A1A]">
                Email Address
              </label>
              {/* Refactored Input Container: Square, Cream BG, Gold Bottom Border */}
              <div
                className="border-b-3 border-[#c5ab65] border-t-1 border-[#C9A84C] 
              border-l-1 border-[#C9A84C] border-r-1 border-[#C9A84C] rounded-xl bg-[#FAF3E0]/30 transition-all duration-300 focus-within:bg-[#FAF3E0]/60"
              >
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="your@email.com"
                  required
                  className="w-full bg-transparent px-2 py-4 font-serif text-[#2D1200] placeholder:text-[#C9A84C]/40 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block font-serif text-[11px] uppercase tracking-[2px] text-[#8B1A1A]">
                Password
              </label>
              {/* Refactored Input Container: Square, Cream BG, Gold Bottom Border */}
              <div
                className="flex items-center border-b-3 border-[#c5ab65] border-t-1 border-[#C9A84C] 
              border-l-1 border-[#C9A84C] border-r-1 border-[#C9A84C] rounded-xl bg-[#FAF3E0]/30 transition-all duration-300 focus-within:bg-[#FAF3E0]/60 pr-3"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Enter password"
                  required
                  className="w-full bg-transparent px-2 py-4 font-serif text-[#2D1200] placeholder:text-[#C9A84C]/40 outline-none"
                />
                {/* Icons kept on the right for password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#C9A84C] hover:text-[#8B1A1A] transition cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs tracking-wide font-serif uppercase text-[#8B1A1A]/70 hover:text-[#8B1A1A] transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#8B1A1A] via-[#C9A84C] to-[#8B1A1A] py-4 text-sm font-bold uppercase tracking-[4px] text-[#FAF3E0] shadow-lg transition-all duration-300 cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-lg text-[#1A0A00]/80">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#C9A84C] transition hover:text-[#8B1A1A]"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
