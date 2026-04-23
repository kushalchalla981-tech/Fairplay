// src/components/HeroScene/figures.js
// Dense crowd — every figure has a unique speed, random direction

import peep11 from "../../assets/figures/svg/peep-11.svg";
import peep12 from "../../assets/figures/svg/peep-12.svg";
import peep18 from "../../assets/figures/svg/peep-18.svg";
import peep19 from "../../assets/figures/svg/peep-19.svg";
import peep21 from "../../assets/figures/svg/peep-21.svg";
import peep37 from "../../assets/figures/svg/peep-37.svg";
import peep38 from "../../assets/figures/svg/peep-38.svg";
import peep46 from "../../assets/figures/svg/peep-46.svg";
import peep56 from "../../assets/figures/svg/peep-56.svg";
import peep58 from "../../assets/figures/svg/peep-58.svg";
import peep59 from "../../assets/figures/svg/peep-59.svg";
import peep64 from "../../assets/figures/svg/peep-64.svg";
import peep82 from "../../assets/figures/svg/peep-82.svg";
import peep89 from "../../assets/figures/svg/peep-89.svg";

const ALL_PEEPS = [
  peep11, peep12, peep18, peep19, peep21, peep37, peep38,
  peep46, peep56, peep58, peep59, peep64, peep82, peep89,
];

// Seeded PRNG for deterministic randomness
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

const COPIES_PER_LAYER = 18;
const TOTAL_FIGURES = COPIES_PER_LAYER * 4; // 72

// Generate 72 unique speeds across a huge range:
// Layer 0 (back):  55s – 90s   (very slow crawl)
// Layer 1:         35s – 55s   (slow walk)
// Layer 2:         18s – 35s   (medium pace)
// Layer 3 (front): 10s – 18s   (brisk walk)
const SPEED_RANGES = [
  [55, 90],   // layer 0 — glacial
  [35, 55],   // layer 1 — slow
  [18, 35],   // layer 2 — medium
  [10, 18],   // layer 3 — fast
];

let figId = 1;
export const FIGURES = [];

for (let layer = 0; layer < 4; layer++) {
  const rng = seededRandom(layer * 7919 + 31);
  const [minSpeed, maxSpeed] = SPEED_RANGES[layer];

  for (let i = 0; i < COPIES_PER_LAYER; i++) {
    // Unique speed: evenly space across the range, then add a small jitter
    const baseSpeed = minSpeed + ((maxSpeed - minSpeed) * i) / (COPIES_PER_LAYER - 1);
    const jitter = (rng() - 0.5) * 1.5; // ±0.75s jitter
    const speed = Math.max(minSpeed, Math.min(maxSpeed, baseSpeed + jitter));

    const srcIndex = Math.floor(rng() * ALL_PEEPS.length);
    const direction = rng() > 0.5 ? 1 : -1;
    const flipX = rng() > 0.5;
    const startPct = (i / COPIES_PER_LAYER) * 100;

    FIGURES.push({
      id: figId++,
      src: ALL_PEEPS[srcIndex],
      layer,
      startPct,
      flipX,
      direction,
      speed, // unique per figure — no two are the same
    });
  }
}

// Layer config — sizing, blur, z-index, bottom offset (speed is per-figure now)
export const LAYER_CONFIG = {
  0: {
    width: 100,
    zIndex: 1,
    blur: 2.5,
    opacity: 0.3,
    bottomOffset: 120,
  },
  1: {
    width: 135,
    zIndex: 4,
    blur: 1.2,
    opacity: 0.5,
    bottomOffset: 80,
  },
  2: {
    width: 175,
    zIndex: 7,
    blur: 0,
    opacity: 0.75,
    bottomOffset: 30,
  },
  3: {
    width: 220,
    zIndex: 10,
    blur: 0,
    opacity: 1,
    bottomOffset: -20,
  },
};
