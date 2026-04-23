import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from "recharts";
import api from "../api";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ color: "#f2f0eb", marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill }}>{p.name}: {(p.value * 100).toFixed(1)}%</div>
      ))}
    </div>
  );
};

function ComparisonChart({ data, sensitiveCol }) {
  const groups = [...new Set([
    ...data.group_rates_before.map(r => r[sensitiveCol]),
    ...data.group_rates_after.map(r => r[sensitiveCol]),
  ])];

  const chartData = groups.map(g => {
    const before = data.group_rates_before.find(r => r[sensitiveCol] === g);
    const after = data.group_rates_after.find(r => r[sensitiveCol] === g);
    return { group: g, Before: before?.positive_rate ?? 0, After: after?.positive_rate ?? 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ left: 8, right: 24, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="group"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
        <Legend
          wrapperStyle={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}
        />
        <ReferenceLine y={0.8} stroke="rgba(224,85,85,0.35)" strokeWidth={1} strokeDasharray="4 4" />
        <Bar dataKey="Before" fill="rgba(224,85,85,0.45)" radius={[2, 2, 0, 0]} maxBarSize={36} />
        <Bar dataKey="After" fill="rgba(255,255,255,0.35)" radius={[2, 2, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function MitigationSection({ results, sessionId }) {
  const [mitigationData, setMitigationData] = useState({});
  const [loading, setLoading] = useState({});

  if (!results) return null;

  const failingCols = Object.entries(results).filter(
    ([, data]) => data.demographic_parity_ratio.status === "FAIL"
  );

  if (failingCols.length === 0) return null;

  const runMitigation = async (col, tCol) => {
    setLoading(l => ({ ...l, [col]: true }));
    try {
      const { data } = await api.post("/mitigate", {
        session_id: sessionId,
        sensitive_col: col,
        target_col: tCol,
      });
      setMitigationData(m => ({ ...m, [col]: data }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(l => ({ ...l, [col]: false }));
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <motion.div
          style={{ marginBottom: 36 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={stepLabelStyle}>Step 04</p>
          <h2 style={headingStyle}>Bias mitigation</h2>
          <p style={descStyle}>
            Reweigh training data to reduce disparity for failing attributes.
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {failingCols.map(([col, data]) => (
            <motion.div
              key={col}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={failCardStyle}
            >
              {/* Header */}
              <div style={failHeaderStyle}>
                <div>
                  <h3 style={failColStyle}>{col}</h3>
                  <p style={failStatStyle}>
                    DPR {(data.demographic_parity_ratio.value * 100).toFixed(1)}% — below 80% threshold
                  </p>
                </div>
                {!mitigationData[col] && (
                  <button
                    onClick={() => runMitigation(col, data._targetCol)}
                    disabled={loading[col]}
                    style={{
                      ...mitigateBtnStyle,
                      opacity: loading[col] ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => { if (!loading[col]) e.target.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
                  >
                    {loading[col] ? "Applying..." : "Apply reweighing →"}
                  </button>
                )}
              </div>

              {/* Mitigation results */}
              <AnimatePresence>
                {mitigationData[col] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ overflow: "hidden" }}
                  >
                    {/* Stats row */}
                    <div style={statsGridStyle}>
                      {[
                        { label: "DPR before", value: `${(mitigationData[col].dpr_before.value * 100).toFixed(1)}%`, color: "#e05555" },
                        { label: "DPR after", value: `${(mitigationData[col].dpr_after.value * 100).toFixed(1)}%`, color: "#f2f0eb" },
                        { label: "Status", value: mitigationData[col].dpr_after.status, color: mitigationData[col].dpr_after.status === "PASS" ? "#4ade80" : "#e05555" },
                      ].map(s => (
                        <div key={s.label} style={statBoxStyle}>
                          <p style={statLabelStyle}>{s.label}</p>
                          <p style={{ ...statValueStyle, color: s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={chartLabelStyle}>Before vs after comparison</p>
                      <ComparisonChart data={mitigationData[col]} sensitiveCol={col} />
                    </div>

                    {/* Actions */}
                    <div style={actionsStyle}>
                      <a
                        href={`http://localhost:8000/download/mitigated/${sessionId}`}
                        style={actionLinkStyle}
                        onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                      >
                        ↓ Download reweighted CSV
                      </a>
                      <a
                        href={`http://localhost:8000/report/${sessionId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={actionLinkStyle}
                        onMouseEnter={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                      >
                        → View compliance report
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Styles ──

const sectionStyle = {
  padding: "64px 0 0",
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

const descStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.5)",
  marginTop: 12,
};

const failCardStyle = {
  border: "1px solid rgba(224,85,85,0.25)",
  borderTop: "1px solid rgba(224,85,85,0.4)",
  padding: 32,
  background: "linear-gradient(135deg, rgba(224,85,85,0.06) 0%, rgba(224,85,85,0.02) 100%)",
  backdropFilter: "blur(12px) saturate(120%)",
  WebkitBackdropFilter: "blur(12px) saturate(120%)",
  borderRadius: 24,
  boxShadow: "0 16px 40px rgba(224,85,85,0.05), inset 0 1px 0 rgba(224,85,85,0.1)",
};

const failHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 32,
  gap: 16,
  flexWrap: "wrap",
};

const failColStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 400,
  color: "#f2f0eb",
  textTransform: "capitalize",
  margin: "0 0 8px",
};

const failStatStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(224,85,85,0.9)",
  margin: 0,
};

const mitigateBtnStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#f2f0eb",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  padding: "12px 24px",
  cursor: "pointer",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  borderRadius: 12,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
};

const statBoxStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderTop: "1px solid rgba(255,255,255,0.15)",
  padding: 20,
  textAlign: "center",
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(8px) saturate(130%)",
  WebkitBackdropFilter: "blur(8px) saturate(130%)",
  borderRadius: 16,
};

const statLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255,255,255,0.5)",
  marginBottom: 10,
};

const statValueStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 28,
  fontWeight: 400,
  margin: 0,
};

const chartLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 20,
};

const tooltipStyle = {
  background: "linear-gradient(135deg, rgba(30,30,35,0.8) 0%, rgba(15,15,20,0.8) 100%)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "10px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255,255,255,0.8)",
  boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
  borderRadius: 8,
};

const actionsStyle = {
  display: "flex",
  gap: 16,
  marginTop: 32,
  paddingTop: 24,
  borderTop: "1px solid rgba(255,255,255,0.1)",
  flexWrap: "wrap",
};

const actionLinkStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.15)",
  padding: "10px 20px",
  textDecoration: "none",
  transition: "all 0.2s",
  borderRadius: 12,
  background: "rgba(255,255,255,0.02)",
};
