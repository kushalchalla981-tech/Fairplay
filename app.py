"""AI Fairness Auditing Dashboard - Main Application."""
import streamlit as st
import pandas as pd
from utils.data_loader import DataLoader, DataLoadError
from utils.metrics import calculate_all_metrics, FOUR_FIFTHS_THRESHOLD
from utils.visualization import (
    create_fairness_bar_chart,
    create_summary_metrics_chart,
    create_comparison_chart
)
from utils.mitigation import BiasMitigator
from utils.report_generator import ComplianceReportGenerator


st.set_page_config(
    page_title="AI Fairness Dashboard",
    page_icon="⚖️",
    layout="wide"
)

st.markdown("""
<style>
    .main-header {
        font-size: 2rem;
        font-weight: 700;
        color: #1E3A5F;
    }
    .upload-box {
        border: 2px dashed #4A90D9;
        border-radius: 10px;
        padding: 2rem;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)


def show_column_selection(df: pd.DataFrame):
    """Allow user to select sensitive and target columns."""
    st.markdown("#### 🎯 Select Analysis Columns")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Sensitive Attribute (e.g., gender, race)")
        sensitive_col = st.selectbox(
            "Sensitive Column",
            options=df.columns,
            key="sensitive_select"
        )
    
    with col2:
        st.markdown("**Target/Outcome (e.g., approved, score)")
        target_col = st.selectbox(
            "Target Column", 
            options=df.columns,
            key="target_select"
        )
    
    return sensitive_col, target_col


def show_metrics_results(metrics: dict, df: pd.DataFrame, sensitive_col: str, target_col: str):
    """Display fairness metrics results with PASS/FAIL cards."""
    st.markdown("#### 📊 Fairness Analysis Results")
    
    dpr_result = metrics.get('demographic_parity_ratio')
    if dpr_result:
        card_color = "#22C55E" if dpr_result.status == "PASS" else "#EF4444"
        
        st.markdown(f"""
        <div style="
            background: {card_color}15;
            border-left: 4px solid {card_color};
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
        ">
            <h3 style="margin:0; color: {card_color};">
                {'✅ PASS' if dpr_result.status == 'PASS' else '❌ FAIL'}
                - Demographic Parity Ratio
            </h3>
            <p style="font-size: 1.5rem; margin: 0.5rem 0;">
                Ratio: <strong>{dpr_result.value:.2%}</strong> 
                (Threshold: {FOUR_FIFTHS_THRESHOLD:.0%})
            </p>
            <p>Risk Level: <strong>{dpr_result.risk_level}</strong></p>
        </div>
        """, unsafe_allow_html=True)
        
        with st.expander("📋 View Details"):
            st.write("**Group Comparison:**")
            st.write(f"  - Majority group: {dpr_result.details.get('majority_group')}")
            st.write(f"  - Minority group: {dpr_result.details.get('minority_group')}")
            st.write(f"  - Majority positive rate: {dpr_result.details.get('majority_positive_rate'):.2%}")
            st.write(f"  - Minority positive rate: {dpr_result.details.get('minority_positive_rate'):.2%}")
    
    dpd_result = metrics.get('demographic_parity_difference')
    if dpd_result:
        st.markdown(f"**Difference:** {dpd_result.value:+.2%} (threshold: ±{dpd_result.threshold:.0%})")
        st.write(f"Status: {dpd_result.status}")
    
    st.markdown("#### 📈 Visual Analysis")
    try:
        chart = create_fairness_bar_chart(df, sensitive_col, target_col, metrics)
        st.plotly_chart(chart, use_container_width=True)
        st.session_state.chart = chart
    except Exception as e:
        st.warning(f"Chart temporarily unavailable: {str(e)}")
    
    with st.expander("📊 View Summary Charts"):
        try:
            summary_chart = create_summary_metrics_chart(metrics)
            st.plotly_chart(summary_chart, use_container_width=True)
        except Exception as e:
            st.warning(f"Summary chart unavailable: {str(e)}")


def show_mitigation_section(df, sensitive_col, target_col, metrics):
    """Show bias mitigation section."""
    st.markdown("---")
    st.markdown("#### 🛠️ Bias Mitigation")
    
    dpr_result = metrics.get('demographic_parity_ratio')
    
    if dpr_result and dpr_result.status == "FAIL":
        st.warning(f"⚠️ Bias detected! DPR = {dpr_result.value:.2%} (threshold: 80%)")
        
        apply_mitigation = st.checkbox(
            "Apply automatic bias mitigation",
            help="Reweigh data to reduce demographic disparity"
        )
        
        if apply_mitigation:
            if st.button("🔧 Apply Reweighing"):
                with st.spinner("Applying reweighing algorithm..."):
                    mitigator = BiasMitigator()
                    df_mitigated, method = mitigator.apply_mitigation(
                        df, sensitive_col, target_col, method="fallback"
                    )
                    
                    new_metrics = calculate_all_metrics(
                        df_mitigated, sensitive_col, target_col
                    )
                    
                    st.session_state.mitigated_df = df_mitigated
                    st.session_state.mitigator = mitigator
                    st.session_state.new_metrics = new_metrics
                    st.session_state.mitigation_method = method
                
                st.success(f"✅ Mitigation complete! Method: {method}")
                
                show_comparison_results(
                    df,
                    st.session_state.mitigated_df,
                    sensitive_col,
                    target_col,
                    metrics,
                    st.session_state.new_metrics,
                    st.session_state.mitigation_method
                )
    elif dpr_result and dpr_result.status == "PASS":
        st.success("✅ No bias detected! Your dataset passes the Four-Fifths Rule.")


def show_comparison_results(
    df_original,
    df_mitigated,
    sensitive_col,
    target_col,
    original_metrics,
    new_metrics,
    method
):
    """Display before vs after comparison."""
    st.markdown("#### 📊 Before vs After Comparison")
    
    col1, col2, col3 = st.columns(3)
    
    old_dpr = original_metrics['demographic_parity_ratio'].value
    new_dpr = new_metrics['demographic_parity_ratio'].value
    
    with col1:
        st.metric("DPR (Before)", f"{old_dpr:.1%}")
    with col2:
        st.metric("DPR (After)", f"{new_dpr:.1%}", delta=f"{(new_dpr - old_dpr):.1%}")
    with col3:
        new_status = new_metrics['demographic_parity_ratio'].status
        st.markdown(f"**Status:** {'✅ PASS' if new_status == 'PASS' else '❌ FAIL'}")
    
    try:
        chart = create_comparison_chart(
            df_original, df_mitigated, sensitive_col, target_col
        )
        st.plotly_chart(chart, use_container_width=True)
    except Exception as e:
        st.warning(f"Comparison chart unavailable: {str(e)}")
    
    show_export_section(df_mitigated, original_metrics, new_metrics, method)


def show_export_section(df_mitigated, original_metrics=None, new_metrics=None, method=None):
    """Show export options."""
    st.markdown("#### 💾 Export Results")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.download_button(
            label="📥 Download Reweighted CSV",
            data=df_mitigated.to_csv(index=False),
            file_name="reweighted_data.csv",
            mime="text/csv"
        )
    
    with col2:
        if original_metrics and new_metrics and method:
            report_gen = ComplianceReportGenerator()
            comparison = {
                'original': {'dpr': original_metrics.get('demographic_parity_ratio')},
                'mitigated': {'dpr': new_metrics.get('demographic_parity_ratio')},
                'method': method,
                'improvement': new_metrics.get('demographic_parity_ratio').value - original_metrics.get('demographic_parity_ratio').value
            }
            html_report = report_gen.generate_html_report(original_metrics, comparison)
            st.download_button(
                label="📄 Download HTML Report",
                data=html_report,
                file_name="fairness_report.html",
                mime="text/html"
            )


def show_sidebar():
    """Show sidebar with app information."""
    with st.sidebar:
        st.markdown("### ℹ️ About")
        st.markdown("""
        **Purpose:** Detect and mitigate bias in AI/ML models.
        
        **Regulatory Frameworks:**
        - EU AI Act (High-Risk Systems)
        - India DPDPA (Non-Discrimination)
        - US EEOC Four-Fifths Rule
        """)
        
        st.markdown("### 📋 How to Use")
        st.markdown("""
        1. Upload your CSV dataset
        2. Select sensitive attribute (e.g., gender)
        3. Select target/outcome column
        4. Run fairness analysis
        5. Review PASS/FAIL status
        6. Optionally apply mitigation
        7. Export results
        """)
        
        st.markdown("---")
        if st.button("🔄 Reset All"):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()


def show_footer():
    """Show app footer."""
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666; font-size: 0.8rem;'>
        <p>⚖️ AI Fairness Auditing Dashboard</p>
        <p>Compliant with EU AI Act • India DPDPA • Four-Fifths Rule</p>
    </div>
    """, unsafe_allow_html=True)


def main():
    st.title("⚖️ AI Fairness Auditing Dashboard")
    st.markdown("### Compliance-Powered Bias Detection")
    
    show_sidebar()
    
    if 'data_loader' not in st.session_state:
        st.session_state.data_loader = None
    if 'df' not in st.session_state:
        st.session_state.df = None
    if 'metrics' not in st.session_state:
        st.session_state.metrics = None
    if 'chart' not in st.session_state:
        st.session_state.chart = None
    if 'mitigated_df' not in st.session_state:
        st.session_state.mitigated_df = None
    if 'mitigator' not in st.session_state:
        st.session_state.mitigator = None
    
    with st.container():
        st.markdown("#### 📁 Upload Your Dataset")
        uploaded_file = st.file_uploader(
            "Choose a CSV file",
            type=['csv'],
            help="Upload your model's prediction data as CSV"
        )
    
    if uploaded_file is not None:
        try:
            loader = DataLoader()
            df = loader.load_csv(uploaded_file)
            st.session_state.data_loader = loader
            st.session_state.df = df
            
            st.success(f"✅ File loaded: {uploaded_file.name} ({len(df)} rows, {len(df.columns)} columns)")
            
            st.markdown("#### 🔍 Detected Columns")
            
            sensitive_cols = loader.detect_sensitive_attributes()
            target_cols = loader.detect_target_column()
            
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("** Sensitive Attributes:**")
                if sensitive_cols:
                    for col in sensitive_cols:
                        st.write(f"  • {col}")
                else:
                    st.write("_None detected_")
            
            with col2:
                st.markdown("** Target/Outcome:**")
                if target_cols:
                    for col in target_cols:
                        st.write(f"  • {col}")
                else:
                    st.write("_None detected_")
            
            if sensitive_cols and target_cols:
                sensitive_col, target_col = show_column_selection(df)
                
                if st.button("🔍 Run Fairness Analysis"):
                    with st.spinner("Calculating fairness metrics..."):
                        metrics = calculate_all_metrics(df, sensitive_col, target_col)
                        st.session_state.metrics = metrics
                        st.session_state.mitigated_df = None
                    
                    show_metrics_results(st.session_state.metrics, df, sensitive_col, target_col)
                    show_mitigation_section(df, sensitive_col, target_col, st.session_state.metrics)
            
        except DataLoadError as e:
            st.error(f"❌ Error: {str(e)}")
            st.session_state.data_loader = None
            st.session_state.df = None
    
    show_footer()


if __name__ == "__main__":
    main()