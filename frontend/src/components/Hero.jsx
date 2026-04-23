import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import peep18 from "../assets/figures/svg/peep-18.svg";
import peep64 from "../assets/figures/svg/peep-64.svg";
import peep11 from "../assets/figures/svg/peep-11.svg";
import peep56 from "../assets/figures/svg/peep-56.svg";
import peep89 from "../assets/figures/svg/peep-89.svg";
import peep58 from "../assets/figures/svg/peep-58.svg";
import peep82 from "../assets/figures/svg/peep-82.svg";
import peep59 from "../assets/figures/svg/peep-59.svg";
import peep21 from "../assets/figures/svg/peep-21.svg";
import peep12 from "../assets/figures/svg/peep-12.svg";
import peep19 from "../assets/figures/svg/peep-19.svg";
import peep37 from "../assets/figures/svg/peep-37.svg";
import peep38 from "../assets/figures/svg/peep-38.svg";
import peep46 from "../assets/figures/svg/peep-46.svg";

// 3 rows like the reference image - static, no scrolling
// Row 1 (back): 4 figures, smaller, blurred
// Row 2 (middle): 5 figures, medium, slight blur
// Row 3 (front): 5 figures, largest, sharp
const ROWS = [
  {
    figures: [peep64, peep11, peep56, peep89],
    size: 200,
    blur: 4,
    opacity: 0.5,
    bottom: 320,
  },
  {
    figures: [peep82, peep59, peep21, peep12, peep19],
    size: 260,
    blur: 1.5,
    opacity: 0.75,
    bottom: 180,
  },
  {
    figures: [peep37, peep38, peep46, peep18, peep58],
    size: 320,
    blur: 0,
    opacity: 1,
    bottom: 0,
  },
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,229,255,0.05) 0%, transparent 70%)",
      }} />

      {/* Title */}
      <motion.div
        style={{ opacity, y: titleY, position: "relative", zIndex: 10, textAlign: "center" }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            fontFamily: "var(--sans)", 
            fontSize: 14, 
            letterSpacing: "0.15em", 
            color: "var(--text-dim)", 
            marginBottom: 12, 
            textTransform: "uppercase",
            fontWeight: 400,
          }}
        >
          The World's First Open Source
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            fontFamily: "var(--sans)",
            fontWeight: 400,
            fontSize: "clamp(80px, 13vw, 140px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: "var(--text)",
          }}
        >
          Fairplay
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontFamily: "var(--sans)", 
            fontSize: 16, 
            color: "var(--text-dim)", 
            marginTop: 16, 
            fontWeight: 300,
            letterSpacing: "0.02em",
          }}
        >
          AI Bias Auditing Engine
        </motion.p>

        <motion.a
          href="#upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,229,255,0.35)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-block", marginTop: 36,
            padding: "14px 44px",
            background: "var(--cyan)", color: "var(--bg)",
            fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12,
            letterSpacing: "0.1em", textDecoration: "none",
          }}
        >
          BEGIN AUDIT →
        </motion.a>
      </motion.div>

      {/* Static crowd - 3 rows */}
      <motion.div
        style={{
          opacity,
          position: "absolute", bottom: 0, left: 0, right: 0,
          pointerEvents: "none",
        }}
      >
        {ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{
              position: "absolute",
              bottom: row.bottom,
              left: 0, right: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: ri === 0 ? 60 : ri === 1 ? 40 : 20,
              zIndex: ri + 1,
            }}
          >
            {row.figures.map((src, fi) => (
              <motion.div
                key={fi}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: row.opacity, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + ri * 0.15 + fi * 0.08 }}
                style={{
                  filter: row.blur > 0 ? `blur(${row.blur}px)` : "none",
                  flexShrink: 0,
                }}
              >
                <img
                  src={src}
                  width={row.size}
                  height={row.size * 1.35}
                  alt=""
                  draggable={false}
                  style={{ display: "block", userSelect: "none" }}
                />
              </motion.div>
            ))}
          </div>
        ))}

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 180, zIndex: 10,
          background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
        }} />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity, position: "absolute", bottom: 28, left: "50%", x: "-50%", zIndex: 20 }}
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{
            width: 22, height: 34, border: "1.5px solid var(--border-bright)",
            borderRadius: 11, display: "flex", alignItems: "flex-start",
            justifyContent: "center", paddingTop: 6,
          }}
        >
          <div style={{ width: 3, height: 7, background: "var(--cyan)", borderRadius: 2 }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
