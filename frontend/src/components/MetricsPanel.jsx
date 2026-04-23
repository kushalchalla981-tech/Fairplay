import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from "recharts";

const THRESHOLD = 0.8;

function StatusCard({ result, delay }) {
  const pass = result.status === "PASS";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={cardStyle}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={metricLabelStyle}>{result.metric.replace(/_/g, " ")}</p>
          <p style={{ ...valueStyle, color: pass ? "#f2f0eb" : "#e05555" }}>
            {(result.value * 100).toFixed(1)}%
          </p>
        </div>
        <span style={{
          ...statusBadgeStyle,
          color: pass ? "#4ade80" : "#e05555",
          borderColor: pass ? "rgba(74,222,128,0.25)" : "rgba(224,85,85,0.25)",
        }}>
          {result.status}
        </span>
      </div>
      <div style={detailsStyle}>
        <span>Threshold: {(result.threshold * 100).toFixed(0)}%</span>
        <span>Risk: {result.risk}</span>
        {result.majority_group && <span>Ref: {result.majority_group}</span>}
        {result.minority_group && <span>Min: {result.minority_group}</span>}
      </div>
    </motion.div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ color: "#f2f0eb", marginBottom: 4 }}>{label}</div>
      <div>{(payload[0].value * 100).toFixed(1)}%</div>
    </div>
  );
};

function GroupChart({ groupRates, sensitiveCol }) {
  return (
    <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={chartLabelStyle}>Positive rate by group</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={groupRates} layout="vertical" margin={{ left: 16, right: 32, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            type="category" dataKey={sensitiveCol}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <ReferenceLine x={THRESHOLD} stroke="rgba(224,85,85,0.4)" strokeWidth={1} strokeDasharray="4 4" />
          <Bar dataKey="positive_rate" radius={[0, 2, 2, 0]} maxBarSize={28}>
            {groupRates.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.positive_rate >= THRESHOLD ? "rgba(255,255,255,0.35)" : "rgba(224,85,85,0.5)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={thresholdHintStyle}>— 80% threshold (four-fifths rule)</p>
    </div>
  );
}

export default function MetricsPanel({ results }) {
  if (!results) return null;

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
          <p style={stepLabelStyle}>Step 03</p>
          <h2 style={headingStyle}>Fairness results</h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {Object.entries(results).map(([col, data], colIdx) => (
            <motion.div
              key={col}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: colIdx * 0.08, duration: 0.6 }}
              style={resultBlockStyle}
            >
              <h3 style={colHeadingStyle}>{col}</h3>

              <div style={cardsGridStyle}>
                <StatusCard result={data.demographic_parity_ratio} delay={colIdx * 0.08} />
                <StatusCard result={data.demographic_parity_difference} delay={colIdx * 0.08 + 0.08} />
              </div>

              {data.group_rates && (
                <GroupChart groupRates={data.group_rates} sensitiveCol={col} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Styles ──

const sectionStyle = {
  padding: "0",
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

const resultBlockStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderTop: "1px solid rgba(255,255,255,0.15)",
  borderLeft: "1px solid rgba(255,255,255,0.12)",
  padding: 32,
  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(12px) saturate(120%)",
  WebkitBackdropFilter: "blur(12px) saturate(120%)",
  borderRadius: 24,
  boxShadow: "0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const colHeadingStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 400,
  color: "#f2f0eb",
  letterSpacing: "-0.02em",
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  textTransform: "capitalize",
};

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderTop: "1px solid rgba(255,255,255,0.15)",
  padding: 24,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(8px) saturate(130%)",
  WebkitBackdropFilter: "blur(8px) saturate(130%)",
  borderRadius: 16,
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const metricLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 8,
  textTransform: "capitalize",
};

const valueStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 36,
  fontWeight: 400,
  margin: 0,
  lineHeight: 1,
};

const statusBadgeStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  border: "1px solid",
  padding: "4px 12px",
  borderRadius: 8,
};

const detailsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px 16px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(255,255,255,0.45)",
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

const chartLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.7)",
  marginBottom: 20,
};

const thresholdHintStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(224,85,85,0.7)",
  marginTop: 12,
};
