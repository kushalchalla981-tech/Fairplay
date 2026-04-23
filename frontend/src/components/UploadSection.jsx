import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

export default function UploadSection({ onUploaded }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/upload", form);
      setStatus("done");
      onUploaded(data);
    } catch (e) {
      setStatus("error");
      setError(e.response?.data?.detail || "Upload failed");
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return (
    <section id="upload" style={sectionStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <motion.div
          style={headerStyle}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={labelStyle}>Step 01</p>
          <h2 style={headingStyle}>Upload your dataset</h2>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          {...getRootProps()}
          style={{
            ...dropZoneStyle,
            ...(isDragActive ? dropZoneActiveStyle : {}),
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {status === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={stateStyle}
              >
                <div style={spinnerStyle} />
                <p style={mainTextStyle}>Processing...</p>
                <p style={subTextStyle}>{fileName}</p>
              </motion.div>
            )}

            {status === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={stateStyle}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-6" />
                </svg>
                <p style={mainTextStyle}>Dataset ready</p>
                <p style={subTextStyle}>{fileName} · drop another to replace</p>
              </motion.div>
            )}

            {(status === "idle" || status === "error") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={stateStyle}
              >
                <motion.svg
                  width="36" height="36" viewBox="0 0 24 24"
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </motion.svg>

                <p style={mainTextStyle}>
                  {isDragActive ? "Drop to upload" : "Drag & drop CSV file"}
                </p>
                <p style={subTextStyle}>
                  or click to browse · 10 MB max
                </p>

                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={errorTextStyle}
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint */}
        <motion.p
          style={hintStyle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Columns should include demographics (gender, race, age) and an outcome column (hired, approved, score).
        </motion.p>
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

const headerStyle = {
  marginBottom: 32,
};

const labelStyle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 10,
};

const headingStyle = {
  fontFamily: "'Sora', sans-serif",
  fontSize: "clamp(28px, 4vw, 38px)",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  color: "#f2f0eb",
  lineHeight: 1.15,
  margin: 0,
};

const dropZoneStyle = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderTop: "1px solid rgba(255,255,255,0.2)",
  borderLeft: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 24,
  padding: "56px 32px",
  cursor: "pointer",
  transition: "all 0.35s ease",
  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(12px) saturate(120%)",
  WebkitBackdropFilter: "blur(12px) saturate(120%)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const dropZoneActiveStyle = {
  borderColor: "rgba(255,255,255,0.4)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
};

const stateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const mainTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 16,
  fontWeight: 500,
  color: "rgba(255,255,255,0.9)",
  margin: 0,
};

const subTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 400,
  color: "rgba(255,255,255,0.5)",
  margin: 0,
};

const hintStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 400,
  color: "rgba(255,255,255,0.35)",
  lineHeight: 1.6,
  marginTop: 20,
};

const spinnerStyle = {
  width: 32,
  height: 32,
  border: "2px solid rgba(255,255,255,0.1)",
  borderTop: "2px solid rgba(255,255,255,0.8)",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const errorTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "#f87171",
  margin: 0,
  marginTop: 8,
};
