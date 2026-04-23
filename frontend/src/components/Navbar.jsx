import { motion, useScroll, useTransform } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(5,5,8,0.85)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-border"
        style={{ opacity: borderOpacity }}
      />
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan opacity-10 rounded-sm" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-text">
            fair<span className="text-cyan">play</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6"
        >
          <span className="label hidden md:block">EU AI ACT · EEOC · DPDPA</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="label text-green">SYSTEM ONLINE</span>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
