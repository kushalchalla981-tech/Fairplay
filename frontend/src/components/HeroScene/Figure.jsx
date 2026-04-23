// src/components/HeroScene/Figure.jsx
import { useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { LAYER_CONFIG } from "./figures";

export default function Figure({ data, scrollProgress, index }) {
  const cfg = LAYER_CONFIG[data.layer];

  // Height derived from viewBox ratio (240:324)
  const height = Math.round(cfg.width * (324 / 240));

  // Every figure has a unique speed — no two are the same
  const duration = data.speed;

  // Vertical drift via CSS — random per figure for organic feel
  const driftDuration = useMemo(() => (3 + Math.random() * 4).toFixed(2), []);
  const driftDelay = useMemo(() => (Math.random() * -5).toFixed(2), []);

  // Scroll-to-vanish: deeper layers vanish first
  const vanishStart = [0.08, 0.12, 0.16, 0.22][data.layer];
  const vanishEnd = [0.3, 0.4, 0.5, 0.6][data.layer];

  const figOpacity = useTransform(
    scrollProgress,
    [0, vanishStart, vanishEnd],
    [1, 1, 0]
  );

  const figY = useTransform(
    scrollProgress,
    [0, vanishStart, vanishEnd],
    [0, 0, 100]
  );

  // Direction: 1 = left→right, -1 = right→left
  const animationName = data.direction === 1 ? "marqueeL2R" : "marqueeR2L";

  // Stagger entry: crowd appears in ~1s
  const entryDelay = data.layer * 0.06 + (index % 18) * 0.02;

  // Negative delay distributes figures evenly across the animation cycle
  const animDelay = -(data.startPct / 100) * duration;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        bottom: cfg.bottomOffset,
        width: cfg.width,
        height,
        zIndex: cfg.zIndex,
        opacity: figOpacity,
        y: figY,
        filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : "none",
        pointerEvents: "none",
        willChange: "opacity, transform",
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: cfg.opacity, y: 0 }}
      transition={{
        duration: 0.7,
        delay: entryDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Outer: horizontal marquee (translateX) */}
      <div
        style={{
          position: "absolute",
          width: cfg.width,
          height,
          animation: `${animationName} ${duration}s linear ${animDelay}s infinite`,
        }}
      >
        {/* Inner: vertical drift (translateY) — separate element so transforms don't conflict */}
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: `figDrift ${driftDuration}s ease-in-out ${driftDelay}s infinite alternate`,
          }}
        >
          <img
            src={data.src}
            alt=""
            draggable={false}
            width={cfg.width}
            height={height}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              userSelect: "none",
              transform: data.flipX ? "scaleX(-1)" : "none",
              filter: "invert(1) brightness(0.85) contrast(1.1)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
