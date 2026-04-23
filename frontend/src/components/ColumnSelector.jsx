import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Tag({ label, onRemove }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={tagStyle}
    >
      {label}
      <button onClick={() => onRemove(label)} style={tagRemoveStyle}>×</button>
    </motion.span>
  );
}

function AccordionSelect({ label, options, value, onChange, multi = false, selected = [] }) {
  const [open, setOpen] = useState(false);

  const toggle = (opt) => {
    if (multi) {
      onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
    } else {
      onChange(opt);
      setOpen(false);
    }
  };

  const displayText = multi
    ? selected.length ? `${selected.length} selected` : "Select attributes..."
    : value || "Select...";

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={selectLabelStyle}>{label}</label>
      <button 
        onClick={() => setOpen(o => !o)} 
        style={{
          ...selectBtnStyle, 
          borderColor: open ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
          background: open ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"
        }}
      >
        <span>{displayText}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={dropdownListStyle}>
              {options.length === 0 ? (
                <div style={emptyTextStyle}>No options available</div>
              ) : (
                options.map(opt => {
                  const active = multi ? selected.includes(opt) : value === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => toggle(opt)}
                      style={{
                        ...dropdownItemStyle,
                        ...(active ? dropdownItemActiveStyle : {}),
                      }}
                      onMouseEnter={(e) => { 
                        if (!active) {
                          e.target.style.background = "rgba(255,255,255,0.04)"; 
                          e.target.style.color = "rgba(255,255,255,0.9)"; 
                        } 
                      }}
                      onMouseLeave={(e) => { 
                        if (!active) {
                          e.target.style.background = "transparent"; 
                          e.target.style.color = "rgba(255,255,255,0.65)"; 
                        } 
                      }}
                    >
                      <span style={{ pointerEvents: "none" }}>{opt}</span>
                      {active && <span style={{ fontSize: 12, color: "#ffffff", pointerEvents: "none" }}>✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ColumnSelector({ uploadData, onAnalyze, loading }) {
  const [sensitiveCols, setSensitiveCols] = useState([]);
  const [targetCol, setTargetCol] = useState("");
  const [refGroups, setRefGroups] = useState({});

  useEffect(() => {
    if (uploadData) {
      setSensitiveCols(uploadData.detected_sensitive || []);
      setTargetCol(uploadData.detected_target?.[0] || "");
    }
  }, [uploadData]);

  const groupOptions = (col) => {
    if (!uploadData) return [];
    const preview = uploadData.preview || [];
    const vals = [...new Set(preview.map(r => String(r[col])).filter(Boolean))];
    return ["AUTO", ...vals];
  };

  const canRun = sensitiveCols.length > 0 && targetCol;

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <motion.div
          style={{ marginBottom: 32 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={stepLabelStyle}>Step 02</p>
          <h2 style={headingStyle}>Configure analysis</h2>
        </motion.div>

        {/* Form card */}
        <motion.div
          style={cardStyle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* File info */}
          <div style={fileInfoStyle}>
            <span style={fileInfoTextStyle}>{uploadData?.rows?.toLocaleString() || 0} rows · {uploadData?.columns?.length || 0} columns</span>
            <span style={fileNameStyle}>{uploadData?.filename}</span>
          </div>

          {/* Sensitive cols */}
          <motion.div layout style={{ marginBottom: 24 }}>
            <AccordionSelect
              label="Sensitive attributes (Multi-select)"
              options={uploadData?.columns || []}
              multi
              selected={sensitiveCols}
              onChange={setSensitiveCols}
            />
            <div style={tagContainerStyle}>
              <AnimatePresence>
                {sensitiveCols.map(col => (
                  <Tag key={col} label={col} onRemove={c => setSensitiveCols(s => s.filter(x => x !== c))} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Target */}
          <motion.div layout style={{ marginBottom: 24 }}>
            <AccordionSelect
              label="Target variable"
              options={uploadData?.columns || []}
              value={targetCol}
              onChange={setTargetCol}
            />
          </motion.div>

          {/* Reference groups */}
          {sensitiveCols.length > 0 && (
            <motion.div layout style={{ marginTop: 32 }}>
              <p style={{ ...selectLabelStyle, color: "rgba(255,255,255,0.4)" }}>Reference groups (optional)</p>
              {sensitiveCols.map(col => (
                <motion.div layout key={col} style={{ marginBottom: 16 }}>
                  <AccordionSelect
                    label={col}
                    options={groupOptions(col)}
                    value={refGroups[col] || "AUTO"}
                    onChange={v => setRefGroups({ ...refGroups, [col]: v })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div style={dividerStyle} />

          {/* Action */}
          <motion.div layout style={{ marginTop: 32 }}>
            <button
              style={{
                ...runBtnStyle,
                opacity: canRun && !loading ? 1 : 0.5,
                cursor: canRun && !loading ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (canRun && !loading) onAnalyze({ sensitiveCols, targetCol, refGroups });
              }}
              onMouseEnter={(e) => { if (canRun && !loading) e.target.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; }}
            >
              {loading ? "Analyzing..." : "Run fairness analysis →"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Styles ──

const sectionStyle = {
  padding: "32px 0 0",
  background: "transparent",
};

const containerStyle = {
  width: "100%",
};

const stepLabelStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
  margin: 0,
};

const headingStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: "clamp(28px, 4vw, 38px)",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  color: "#f2f0eb",
  lineHeight: 1.15,
  margin: "8px 0 0",
};

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderTop: "1px solid rgba(255,255,255,0.2)",
  borderLeft: "1px solid rgba(255,255,255,0.15)",
  padding: "32px",
  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(12px) saturate(120%)",
  WebkitBackdropFilter: "blur(12px) saturate(120%)",
  borderRadius: 24,
  boxShadow: "0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const fileInfoStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 28,
  paddingBottom: 20,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const fileInfoTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(255,255,255,0.8)",
};

const fileNameStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  color: "rgba(255,255,255,0.5)",
};

const selectLabelStyle = {
  display: "block",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255,255,255,0.6)",
  letterSpacing: "0.02em",
  marginBottom: 8,
};

const selectBtnStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.85)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  padding: "14px 18px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "border-color 0.2s",
  borderRadius: 12,
};

const dropdownStyle = {
  position: "absolute",
  zIndex: 100,
  marginTop: 6,
  width: "100%",
  background: "#121215",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  maxHeight: 240,
  overflowY: "auto",
  padding: 8,
  boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
};

const dropdownItemStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.65)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  padding: "12px 16px",
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.15s ease",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dropdownItemActiveStyle = {
  background: "rgba(255,255,255,0.06)",
  color: "#ffffff",
  fontWeight: 600,
};

const tagContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
  minHeight: 32,
};

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255,255,255,0.9)",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "6px 14px",
  borderRadius: 20,
};

const tagRemoveStyle = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.5)",
  cursor: "pointer",
  fontSize: 16,
  padding: 0,
  lineHeight: 1,
};

const dividerStyle = {
  height: 1,
  background: "rgba(255,255,255,0.1)",
  marginBottom: 20,
};

const runBtnStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#f2f0eb",
  fontFamily: "'Inter', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  padding: "16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  letterSpacing: "0.01em",
  borderRadius: 16,
};

const dropdownListStyle = {
  marginTop: 8,
  background: "#121215",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: 8,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const emptyTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.4)",
  padding: "16px",
  textAlign: "center",
};
