"""FastAPI backend for Fairplay dashboard."""
import io
import json
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Optional

import sys
sys.path.insert(0, '/home/kuro/Fairplay')

from utils.data_loader import DataLoader, DataLoadError
from utils.metrics import calculate_all_metrics
from utils.mitigation import BiasMitigator
from utils.report_generator import ComplianceReportGenerator

app = FastAPI(title="Fairplay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (keyed by upload session)
_sessions: dict = {}


class AnalyzeRequest(BaseModel):
    session_id: str
    sensitive_cols: List[str]
    target_col: str
    reference_groups: Optional[dict] = {}


class MitigateRequest(BaseModel):
    session_id: str
    sensitive_col: str
    target_col: str


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    try:
        loader = DataLoader()
        df = loader.load_csv(io.BytesIO(content))
        session_id = file.filename + "_" + str(len(df))
        _sessions[session_id] = {"df": df, "filename": file.filename}
        return {
            "session_id": session_id,
            "rows": len(df),
            "columns": list(df.columns),
            "detected_sensitive": loader.detect_sensitive_attributes(),
            "detected_target": loader.detect_target_column(),
            "preview": df.head(5).to_dict(orient="records"),
        }
    except DataLoadError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Re-upload the file.")

    df = session["df"]
    results = {}

    for col in req.sensitive_cols:
        ref = req.reference_groups.get(col) if req.reference_groups else None
        m = calculate_all_metrics(df, col, req.target_col, reference_group=ref)
        results[col] = {
            "demographic_parity_ratio": m["demographic_parity_ratio"].to_dict(),
            "demographic_parity_difference": m["demographic_parity_difference"].to_dict(),
        }
        # Group positive rates for chart
        group_rates = (
            df.groupby(col)[req.target_col]
            .apply(lambda s: pd.to_numeric(s, errors="coerce").mean())
            .reset_index()
        )
        group_rates.columns = [col, "positive_rate"]
        results[col]["group_rates"] = group_rates.to_dict(orient="records")

    session["last_analyze"] = {"sensitive_cols": req.sensitive_cols, "target_col": req.target_col}
    return results


@app.post("/mitigate")
async def mitigate(req: MitigateRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    df = session["df"]
    mitigator = BiasMitigator()
    df_m, method = mitigator.apply_mitigation(df, req.sensitive_col, req.target_col, method="fallback")
    m_before = calculate_all_metrics(df, req.sensitive_col, req.target_col)
    m_after = calculate_all_metrics(df_m, req.sensitive_col, req.target_col)

    session["mitigated_df"] = df_m
    session["mitigation_method"] = method

    group_before = (
        df.groupby(req.sensitive_col)[req.target_col]
        .apply(lambda s: pd.to_numeric(s, errors="coerce").mean())
        .reset_index()
    )
    group_after = (
        df_m.groupby(req.sensitive_col)[req.target_col]
        .apply(lambda s: pd.to_numeric(s, errors="coerce").mean())
        .reset_index()
    )

    return {
        "method": method,
        "rows_before": len(df),
        "rows_after": len(df_m),
        "dpr_before": m_before["demographic_parity_ratio"].to_dict(),
        "dpr_after": m_after["demographic_parity_ratio"].to_dict(),
        "group_rates_before": group_before.to_dict(orient="records"),
        "group_rates_after": group_after.to_dict(orient="records"),
    }


@app.get("/download/mitigated/{session_id}")
async def download_mitigated(session_id: str):
    session = _sessions.get(session_id)
    if not session or "mitigated_df" not in session:
        raise HTTPException(status_code=404, detail="No mitigated data found.")
    csv = session["mitigated_df"].to_csv(index=False)
    return StreamingResponse(
        io.StringIO(csv),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reweighted_data.csv"},
    )


@app.get("/report/{session_id}", response_class=HTMLResponse)
async def report(session_id: str):
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    last = session.get("last_analyze", {})
    if not last:
        raise HTTPException(status_code=400, detail="Run analysis first.")
    df = session["df"]
    col = last["sensitive_cols"][0]
    target = last["target_col"]
    metrics = calculate_all_metrics(df, col, target)
    gen = ComplianceReportGenerator()
    return gen.generate_html_report(metrics)
