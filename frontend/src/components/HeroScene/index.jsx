// src/components/HeroScene/index.jsx
import { useRef, useEffect } from "react";
import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import Figure from "./Figure";
import { FIGURES } from "./figures";

// Inject marquee keyframes into the document once
const KEYFRAMES_ID = "fairplay-marquee-keyframes";
function injectKeyframes() {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes marqueeL2R {
      0% { transform: translateX(-15vw); }
      100% { transform: translateX(110vw); }
    }
    @keyframes marqueeR2L {
      0% { transform: translateX(110vw); }
      100% { transform: translateX(-15vw); }
    }
    @keyframes figDrift {
      0% { transform: translateY(0); }
      100% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
}

export default function HeroScene() {
  const sectionRef = useRef(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Title: stays solid, then fades as scroll begins
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [1, 0.9, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-12%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  // Subtitle under title
  const subOpacity = useTransform(scrollYProgress, [0, 0.15, 0.4], [1, 0.8, 0]);

  // Vignette overlay: slight darkening at edges
  const vignetteOpacity = useTransform(scrollYProgress, [0, 0.4], [0.6, 0]);

  if (shouldReduce) {
    return (
      <section
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h1 style={titleStyle}>Fairplay</h1>
        <p style={subtitleStyle}>
          The World's First Open Source AI Bias Auditing Engine
        </p>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "200vh", // scroll room for vanish
      }}
    >
      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#080808",
        }}
      >
        {/* Subtle dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── TITLE BLOCK (centered) ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "30vh",
            zIndex: 20,
            pointerEvents: "none",
            opacity: titleOpacity,
            y: titleY,
            scale: titleScale,
          }}
        >
          <motion.h1
            style={titleStyle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Fairplay
          </motion.h1>

          {/* Curved underline swoosh */}
          <motion.svg
            viewBox="0 0 320 20"
            fill="none"
            style={{
              width: "clamp(200px, 35vw, 420px)",
              height: "auto",
              marginTop: -4,
              overflow: "visible",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.path
              d="M10 14 Q80 -4 160 10 Q240 24 310 6"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.svg>

          <motion.p
            style={subtitleStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Detect. Measure. Correct — AI Bias Ends Here.
          </motion.p>
        </motion.div>

        {/* ── CROWD OF FIGURES — all 14 in 4 speed-layers ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          {FIGURES.map((fig, i) => (
            <Figure
              key={fig.id}
              data={fig}
              scrollProgress={scrollYProgress}
              index={i}
            />
          ))}
        </div>

        {/* ── EDGE VIGNETTE (darkens left/right edges for smooth frame-out) ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.95) 0%, transparent 12%, transparent 88%, rgba(8,8,8,0.95) 100%)",
            pointerEvents: "none",
            zIndex: 16,
            opacity: vignetteOpacity,
          }}
        />

        {/* Bottom gradient fade — crowd melts into the background */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background:
              "linear-gradient(to top, #080808 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 17,
            opacity: 0.4,
          }}
        />

      </div>
    </section>
  );
}

// ── Shared styles ──
const titleStyle = {
  fontFamily: "'Bricolage Grotesque', 'Space Grotesk', sans-serif",
  fontSize: "clamp(56px, 11vw, 148px)",
  fontWeight: 300,
  letterSpacing: "-0.04em",
  color: "#f2f0eb",
  lineHeight: 1,
  margin: 0,
  textAlign: "center",
  textShadow: "0 4px 60px rgba(0,0,0,0.6)",
};

const subtitleStyle = {
  fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
  fontSize: "clamp(14px, 2vw, 20px)",
  fontWeight: 300,
  color: "rgba(255,255,255,0.38)",
  letterSpacing: "0.02em",
  margin: 0,
  marginTop: 16,
  textAlign: "center",
};
