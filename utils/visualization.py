"""Visualization utilities for fairness dashboard."""
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from typing import Dict, List, Optional, Tuple

COLOR_COMPLIANT = "#22C55E"
COLOR_NON_COMPLIANT = "#EF4444"
COLOR_THRESHOLD = "#FF6B00"
COLOR_BG = "#F8FAFC"

FOUR_FIFTHS_THRESHOLD = 0.8


def create_fairness_bar_chart(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str,
    metrics: Dict
) -> go.Figure:
    """Create horizontal bar chart showing positive rates by group with 0.8 threshold."""
    group_rates = df.groupby(sensitive_col)[target_col].mean().reset_index()
    group_rates.columns = [sensitive_col, 'positive_rate']
    group_rates = group_rates.sort_values('positive_rate', ascending=True)
    
    group_rates['color'] = group_rates['positive_rate'].apply(
        lambda x: COLOR_COMPLIANT if x >= FOUR_FIFTHS_THRESHOLD else COLOR_NON_COMPLIANT
    )
    
    dpr_result = metrics.get('demographic_parity_ratio')
    if dpr_result and dpr_result.value >= FOUR_FIFTHS_THRESHOLD:
        overall_status = "COMPLIANT"
        status_color = COLOR_COMPLIANT
    else:
        overall_status = "NON-COMPLIANT"
        status_color = COLOR_NON_COMPLIANT
    
    fig = go.Figure()
    
    fig.add_trace(go.Bar(
        x=group_rates['positive_rate'],
        y=group_rates[sensitive_col],
        orientation='h',
        marker_color=group_rates['color'],
        text=[f"{r:.1%}" for r in group_rates['positive_rate']],
        textposition='outside',
        hovertemplate="<b>%{y}</b><br>Positive Rate: %{x:.1%}<extra></extra>",
        showlegend=False
    ))
    
    fig.add_vline(
        x=FOUR_FIFTHS_THRESHOLD,
        line_dash="dash",
        line_color=COLOR_THRESHOLD,
        line_width=2,
        annotation_text=f"Four-Fifths Rule ({FOUR_FIFTHS_THRESHOLD:.0%})",
        annotation_position="top",
        annotation_font_size=12,
        annotation_font_color=COLOR_THRESHOLD
    )
    
    fig.update_layout(
        title={
            'text': f"Fairness Analysis by {sensitive_col}",
            'font': {'size': 18, 'color': '#1E3A5F'}
        },
        xaxis_title="Positive Outcome Rate",
        yaxis_title=sensitive_col,
        xaxis_tickformat=".0%",
        xaxis_range=[0, 1.1],
        plot_bgcolor=COLOR_BG,
        paper_bgcolor='white',
        showlegend=False,
        height=300 + (len(group_rates) * 40),
        margin=dict(l=100, r=50, t=60, b=50)
    )
    
    return fig


def create_comparison_chart(
    before_df: pd.DataFrame,
    after_df: pd.DataFrame,
    sensitive_col: str,
    target_col: str
) -> go.Figure:
    """Create side-by-side comparison chart (before vs after mitigation)."""
    before_rates = before_df.groupby(sensitive_col)[target_col].mean()
    after_rates = after_df.groupby(sensitive_col)[target_col].mean()
    
    comparison_df = pd.DataFrame({
        'Before': before_rates,
        'After': after_rates
    }).reset_index()
    
    comparison_melted = comparison_df.melt(
        id_vars=[sensitive_col],
        var_name='Scenario',
        value_name='positive_rate'
    )
    
    color_map = {
        'Before': COLOR_NON_COMPLIANT,
        'After': COLOR_COMPLIANT
    }
    
    fig = px.bar(
        comparison_melted,
        x=sensitive_col,
        y='positive_rate',
        color='Scenario',
        barmode='group',
        color_discrete_map=color_map,
        text=comparison_melted['positive_rate'].apply(lambda x: f"{x:.1%}")
    )
    
    fig.update_traces(textposition='outside')
    
    fig.add_hline(
        y=FOUR_FIFTHS_THRESHOLD,
        line_dash="dash",
        line_color=COLOR_THRESHOLD,
        line_width=2,
        annotation_text=f"Threshold ({FOUR_FIFTHS_THRESHOLD:.0%})",
        annotation_position="top right",
        annotation_font_size=11,
        annotation_font_color=COLOR_THRESHOLD
    )
    
    fig.update_layout(
        title={
            'text': "Before vs After Bias Mitigation",
            'font': {'size': 18, 'color': '#1E3A5F'}
        },
        yaxis_tickformat=".0%",
        yaxis_range=[0, 1.15],
        plot_bgcolor=COLOR_BG,
        paper_bgcolor='white',
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        ),
        height=400,
        margin=dict(l=50, r=50, t=60, b=50)
    )
    
    return fig


def create_summary_metrics_chart(metrics: Dict) -> go.Figure:
    """Create summary chart showing all metrics at a glance."""
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=["Demographic Parity Ratio", "Demographic Parity Difference"],
        specs=[[{"type": "indicator"}, {"type": "indicator"}]]
    )
    
    dpr = metrics.get('demographic_parity_ratio')
    if dpr:
        dpr_value = dpr.value if dpr.value else 0
        dpr_color = COLOR_COMPLIANT if dpr.status == "PASS" else COLOR_NON_COMPLIANT
        
        fig.add_trace(go.Indicator(
            mode="gauge+number",
            value=dpr_value,
            number={'suffix': "%", 'font': {'size': 20}},
            gauge={
                'axis': {'range': [0, 1], 'tickformat': ".0%"},
                'bar': {'color': dpr_color},
                'steps': [
                    {'range': [0, FOUR_FIFTHS_THRESHOLD], 'color': f"{COLOR_NON_COMPLIANT}30"},
                    {'range': [FOUR_FIFTHS_THRESHOLD, 1], 'color': f"{COLOR_COMPLIANT}30"}
                ],
                'threshold': {
                    'line': {'color': COLOR_THRESHOLD, 'width': 2},
                    'thickness': 0.8,
                    'value': FOUR_FIFTHS_THRESHOLD
                }
            },
            title={'text': "Four-Fifths Rule Ratio", 'font': {'size': 14}}
        ), row=1, col=1)
    
    dpd = metrics.get('demographic_parity_difference')
    if dpd:
        dpd_value = abs(dpd.value) if dpd.value else 0
        dpd_color = COLOR_COMPLIANT if dpd.status == "PASS" else COLOR_NON_COMPLIANT
        
        fig.add_trace(go.Indicator(
            mode="gauge+number",
            value=dpd_value,
            number={'suffix': "%", 'font': {'size': 20}},
            gauge={
                'axis': {'range': [0, 0.5], 'tickformat': ".0%"},
                'bar': {'color': dpd_color},
                'steps': [
                    {'range': [0, 0.1], 'color': f"{COLOR_COMPLIANT}30"},
                    {'range': [0.1, 0.3], 'color': "#FFC10730"},
                    {'range': [0.3, 0.5], 'color': f"{COLOR_NON_COMPLIANT}30"}
                ]
            },
            title={'text': "Absolute Difference", 'font': {'size': 14}}
        ), row=1, col=2)
    
    fig.update_layout(
        title={'text': "Fairness Metrics Summary", 'font': {'size': 18}},
        height=350,
        showlegend=False
    )
    
    return fig