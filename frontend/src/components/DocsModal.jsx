import { motion } from "framer-motion";

export default function DocsModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          width: "100%",
          maxWidth: 800,
          maxHeight: "100%",
          overflowY: "auto",
          background: "#111114",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: 48,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()} // exact click only
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 24, right: 24,
            background: "rgba(255,255,255,0.05)",
            border: "none",
            color: "#fff",
            width: 36, height: 36,
            borderRadius: 18,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20
          }}
        >
          ×
        </button>

        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 400, color: "#f2f0eb", marginBottom: 24, letterSpacing: "-0.02em" }}>
          Fairplay Documentation
        </h2>

        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 32 }}>
          
          <section>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              How It Works
            </h3>
            <p>
              Fairplay is an AI Bias Auditing and Mitigation dashboard designed to detect demographic disparities in datasets before models are trained. The platform automatically calculates industry-standard fairness metrics such as the <strong>Demographic Parity Ratio (Four-Fifths Rule)</strong> and <strong>Demographic Parity Difference</strong>.
            </p>
            <p style={{ marginTop: 12 }}>
              If a dataset fails fairness thresholds for protected demographic groups (e.g., gender, ethnicity), Fairplay implements algorithmic corrections. It relies on <strong>Reweighing algorithms</strong> to strategically assign higher weights to unprivileged groups and lower weights to privileged ones, balancing the dataset mathematically without dropping critical rows.
            </p>
          </section>

          <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

          <section>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#f2f0eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              How To Run Analysis
            </h3>
            <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><strong>Upload Data:</strong> Click 'Get Started' or scroll down to the drag-and-drop zone to upload your dataset (CSV format).</li>
              <li><strong>Select Sensitive Attributes:</strong> Pick the demographic columns (e.g., age_group, ethnicity) you want to audit for fairness. Do not select non-sensitive ID columns.</li>
              <li><strong>Select Target Variable:</strong> Pick the column that represents the positive prediction outcome (e.g., probability of getting hired, loan approval).</li>
              <li><strong>Run Fairness Analysis:</strong> Click the analysis button to visualize the Demographic Parity Ratio per group compared against the EEOC Four-Fifths rule standard (80% threshold).</li>
              <li><strong>Mitigate Bias:</strong> If attributes report a "FAIL" status, press "Apply reweighing". The engine will balance the data. You can then download your debiased dataset ready for training.</li>
            </ol>
          </section>

        </div>
      </motion.div>
    </motion.div>
  );
}
