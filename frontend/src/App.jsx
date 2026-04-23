import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroScene from "./components/HeroScene";
import UploadSection from "./components/UploadSection";
import ColumnSelector from "./components/ColumnSelector";
import MetricsPanel from "./components/MetricsPanel";
import MitigationSection from "./components/MitigationSection";
import DocsModal from "./components/DocsModal";
import api from "./api";

export default function App() {
  const [uploadData, setUploadData] = useState(null);
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);

  const handleUploaded = (data) => {
    setUploadData(data);
    setResults(null);
  };

  const handleAnalyze = async ({ sensitiveCols, targetCol, refGroups }) => {
    setAnalyzing(true);
    setResults(null);
    try {
      const referenceGroups = {};
      for (const col of sensitiveCols) {
        const v = refGroups[col];
        if (v && v !== "AUTO") referenceGroups[col] = v;
      }
      const { data } = await api.post("/analyze", {
        session_id: uploadData.session_id,
        sensitive_cols: sensitiveCols,
        target_col: targetCol,
        reference_groups: referenceGroups,
      });

      const enriched = {};
      for (const col of sensitiveCols) {
        enriched[col] = { ...data[col], _targetCol: targetCol };
      }
      setResults(enriched);

      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ position: "relative" }}>
      <AnimatePresence>
        {isDocOpen && <DocsModal onClose={() => setIsDocOpen(false)} />}
      </AnimatePresence>

      {/* Top Navigation */}
      <header style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 100,
        pointerEvents: "none", // so empty space doesn't block hero scene
      }}>
        <div style={{ display: "flex", gap: 16, pointerEvents: "auto" }}>
          <motion.a 
            href="https://github.com/kushalchalla981-tech/Fairplay" 
            target="_blank"
            whileHover={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.3)" }}
            style={{ ...docBtnStyle, display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Github
          </motion.a>
          <motion.button 
            onClick={() => document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" })}
            whileHover={{ background: "rgba(255,255,255,0.9)", scale: 1.02, color: "#111114" }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#111114",
              background: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 12,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "box-shadow 0.2s"
            }}
          >
            Get Started
          </motion.button>
        </div>
        <motion.button 
          onClick={() => setIsDocOpen(true)}
          style={{ ...docBtnStyle, pointerEvents: "auto", background: "rgba(255,255,255,0.02)", cursor: "pointer" }}
          whileHover={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.4)" }}
        >
          DOC
        </motion.button>
      </header>

      <HeroScene />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", width: "100%", paddingBottom: 80 }}>
        <motion.div
          layout
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 64,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 80,
          }}
        >
          {/* Dynamic Control Group (Side-by-side initially -> Stacked left on results) */}
          <motion.div
            layout
            style={{
              display: "flex",
              flexDirection: results ? "column" : "row",
              flexWrap: "wrap",
              gap: results ? 40 : 64,
              flex: results ? "0 0 420px" : "1 1 100%",
              maxWidth: results ? 420 : 1080,
              justifyContent: "center",
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Upload */}
            <motion.div
              layout
              id="upload-section"
              style={{
                flex: results ? "none" : "1 1 400px",
                width: "100%",
                maxWidth: 500,
                scrollMarginTop: 120, // ensures it sits nicely below top edge when scrolled to
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <UploadSection onUploaded={handleUploaded} />
            </motion.div>

            {/* Config */}
            <AnimatePresence mode="popLayout">
              {uploadData && (
                <motion.div
                  key="selector"
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    flex: results ? "none" : "1 1 400px",
                    width: "100%",
                    maxWidth: 500,
                  }}
                >
                  <ColumnSelector
                    uploadData={uploadData}
                    onAnalyze={handleAnalyze}
                    loading={analyzing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Column (Appears on the right) */}
          <AnimatePresence mode="popLayout">
            {results && (
              <motion.div
                key="results"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ flex: "1 1 500px", minWidth: 0 }}
              >
                <div id="results">
                  <MetricsPanel results={results} />
                  <MitigationSection
                    results={results}
                    sessionId={uploadData?.session_id}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "60px 0", marginTop: 80, background: "#111114" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 40 }}>
            <div>
              <p style={footerLabelStyle}>Compliance</p>
              <div style={footerListStyle}>
                <span>EU AI Act</span>
                <span>EEOC Four-Fifths Rule</span>
                <span>India DPDPA</span>
              </div>
            </div>
            <div>
              <p style={footerLabelStyle}>Metrics</p>
              <div style={footerListStyle}>
                <span>Demographic Parity Ratio</span>
                <span>Demographic Parity Diff</span>
                <span>Group Positive Rate</span>
              </div>
            </div>
            <div>
              <p style={footerLabelStyle}>Mitigation</p>
              <div style={footerListStyle}>
                <span>Reweighting Algorithm</span>
                <span>Automatic Correction</span>
                <span>Audit-Ready Reports</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, textAlign: "center" }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 400, color: "#f2f0eb", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Fairplay</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>AI Bias Auditing Dashboard</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const footerLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 10,
};

const footerListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255,255,255,0.45)",
};

const navLinkStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(255,255,255,0.65)",
  textDecoration: "none",
  transition: "color 0.2s",
};

const docBtnStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  color: "#f2f0eb",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "10px 20px",
  borderRadius: 12,
  textTransform: "uppercase",
  transition: "all 0.2s",
};
