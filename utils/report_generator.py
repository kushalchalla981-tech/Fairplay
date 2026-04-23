"""PDF compliance report generator."""
import io
from datetime import datetime
from typing import Dict, List, Optional

REPORTLAB_AVAILABLE = False
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor, green, red, black
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    pass

FPDF_AVAILABLE = False
try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    pass


class ComplianceReportGenerator:
    """Generate PDF compliance reports for regulatory audits."""
    
    def __init__(self):
        self.pages = []
        
    def generate_pdf_report(
        self,
        filename: str,
        metrics: Dict,
        comparison: Optional[Dict] = None,
        sensitive_col: str = "",
        target_col: str = "",
        metadata: Optional[Dict] = None
    ) -> bytes:
        """Generate PDF compliance report."""
        if not (REPORTLAB_AVAILABLE or FPDF_AVAILABLE):
            return self._generate_text_report(metrics, comparison, metadata)
        
        if FPDF_AVAILABLE:
            return self._generate_fpdf(filename, metrics, comparison, sensitive_col, target_col, metadata)
        else:
            return self._generate_reportlab(filename, metrics, comparison, sensitive_col, target_col, metadata)
    
    def _generate_fpdf(
        self,
        filename: str,
        metrics: Dict,
        comparison: Optional[Dict],
        sensitive_col: str,
        target_col: str,
        metadata: Optional[Dict]
    ) -> bytes:
        """Generate PDF using FPDF."""
        pdf = FPDF()
        pdf.add_page()
        
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "AI Fairness Compliance Report", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("Arial", "I", 10)
        pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Executive Summary", ln=True)
        pdf.set_font("Arial", "", 10)
        
        dpr = metrics.get('demographic_parity_ratio')
        if dpr:
            status = "PASS" if dpr.status == "PASS" else "FAIL"
            pdf.cell(0, 8, f"Fairness Status: {status}", ln=True)
            pdf.cell(0, 8, f"Demographic Parity Ratio: {dpr.value:.2%}", ln=True)
            pdf.cell(0, 8, f"Risk Level: {dpr.risk_level}", ln=True)
        
        pdf.ln(10)
        
        if comparison:
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, "Bias Mitigation Results", ln=True)
            pdf.set_font("Arial", "", 10)
            
            orig = comparison.get('original', {})
            mitig = comparison.get('mitigated', {})
            
            pdf.cell(0, 8, f"Method Used: {comparison.get('method', 'N/A')}", ln=True)
            dpr_val = orig.get('dpr')
            if dpr_val:
                pdf.cell(0, 8, f"Original DPR: {dpr_val.value:.2%}", ln=True)
            mitig_dpr = mitig.get('dpr')
            if mitig_dpr:
                pdf.cell(0, 8, f"Mitigated DPR: {mitig_dpr.value:.2%}", ln=True)
            
            improvement = comparison.get('improvement', 0)
            if improvement:
                pdf.cell(0, 8, f"Improvement: +{improvement:.2%}", ln=True)
        
        pdf.ln(10)
        
        if metadata:
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, "Dataset Information", ln=True)
            pdf.set_font("Arial", "", 10)
            
            for key, value in metadata.items():
                pdf.cell(0, 8, f"{key}: {value}", ln=True)
        
        pdf.set_y(-20)
        pdf.set_font("Arial", "I", 8)
        pdf.cell(0, 10, "This report is for compliance documentation purposes.", ln=True, align="C")
        
        return pdf.output(dest='S').encode('latin-1')
    
    def _generate_text_report(
        self,
        metrics: Dict,
        comparison: Optional[Dict],
        metadata: Optional[Dict]
    ) -> bytes:
        """Generate text report as fallback."""
        lines = [
            "=" * 60,
            "AI FAIRNESS COMPLIANCE REPORT",
            "=" * 60,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
            "EXECUTIVE SUMMARY",
            "-" * 40,
        ]
        
        dpr = metrics.get('demographic_parity_ratio')
        if dpr:
            lines.append(f"Fairness Status: {dpr.status}")
            lines.append(f"Demographic Parity Ratio: {dpr.value:.2%}")
            lines.append(f"Risk Level: {dpr.risk_level}")
        
        if comparison:
            lines.extend([
                "",
                "BIAS MITIGATION RESULTS",
                "-" * 40,
                f"Method: {comparison.get('method', 'N/A')}",
            ])
        
        if metadata:
            lines.extend([
                "",
                "DATASET INFORMATION",
                "-" * 40,
            ])
            for key, value in metadata.items():
                lines.append(f"{key}: {value}")
        
        lines.extend([
            "",
            "=" * 60,
            "END OF REPORT",
            "=" * 60,
        ])
        
        return "\n".join(lines).encode('utf-8')
    
    def generate_html_report(
        self,
        metrics: Dict,
        comparison: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> str:
        """Generate HTML report as additional fallback."""
        dpr = metrics.get('demographic_parity_ratio')
        status_class = "status-pass" if dpr and dpr.status == "PASS" else "status-fail" if dpr else ""
        
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>AI Fairness Compliance Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #1E3A5F; }}
        .status-pass {{ color: green; font-weight: bold; }}
        .status-fail {{ color: red; font-weight: bold; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #1E3A5F; color: white; }}
    </style>
</head>
<body>
    <h1>AI Fairness Compliance Report</h1>
    <p><em>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}</em></p>
    
    <h2>Executive Summary</h2>
    <table>
        <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
"""
        
        if dpr:
            html += f"""
        <tr>
            <td>Demographic Parity Ratio</td>
            <td>{dpr.value:.2%}</td>
            <td class="{status_class}">{dpr.status}</td>
        </tr>
        <tr>
            <td>Risk Level</td>
            <td colspan="2">{dpr.risk_level}</td>
        </tr>
"""
        
        if comparison:
            html += """
    </table>
    
    <h2>Bias Mitigation Results</h2>
    <table>
        <tr><th>Before/After</th><th>DPR</th></tr>
"""
            orig = comparison.get('original', {})
            mitig = comparison.get('mitigated', {})
            orig_dpr = orig.get('dpr')
            mitig_dpr = mitig.get('dpr')
            html += f"""
        <tr><td>Before</td><td>{orig_dpr.value if orig_dpr else 'N/A'}</td></tr>
        <tr><td>After</td><td>{mitig_dpr.value if mitig_dpr else 'N/A'}</td></tr>
"""
        
        html += """
    </table>
</body>
</html>
"""
        return html