"""Fairness metrics calculation module."""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

FOUR_FIFTHS_THRESHOLD = 0.8

@dataclass
class FairnessResult:
    """Container for fairness metric results."""
    metric_name: str
    value: float
    threshold: float
    status: str
    risk_level: str
    details: Dict
    
    def to_dict(self) -> dict:
        return {
            'metric': self.metric_name,
            'value': self.value,
            'threshold': self.threshold,
            'status': self.status,
            'risk': self.risk_level,
            **self.details
        }


def calculate_demographic_parity_ratio(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str
) -> FairnessResult:
    """Calculate Demographic Parity Ratio (Four-Fifths Rule)."""
    sensitive_values = df[sensitive_col].dropna().unique()
    if len(sensitive_values) < 2:
        return FairnessResult(
            metric_name="demographic_parity_ratio",
            value=np.nan,
            threshold=FOUR_FIFTHS_THRESHOLD,
            status="INSUFFICIENT_DATA",
            risk_level="Unknown",
            details={"message": "Need 2+ groups for comparison"}
        )
    
    value_counts = df[sensitive_col].value_counts()
    majority_group = value_counts.index[0]
    minority_group = value_counts.index[-1] if len(value_counts) > 1 else value_counts.index[0]
    
    majority_positive = df[df[sensitive_col] == majority_group][target_col].mean()
    minority_positive = df[df[sensitive_col] == minority_group][target_col].mean()
    
    if majority_positive == 0:
        ratio = np.nan
    else:
        ratio = minority_positive / majority_positive
    
    if np.isnan(ratio):
        status = "INSUFFICIENT_DATA"
        risk_level = "Unknown"
    elif ratio >= FOUR_FIFTHS_THRESHOLD:
        status = "PASS"
        risk_level = "Low"
    else:
        status = "FAIL"
        if ratio < 0.5:
            risk_level = "High"
        elif ratio < 0.65:
            risk_level = "Medium"
        else:
            risk_level = "Low-Medium"
    
    return FairnessResult(
        metric_name="demographic_parity_ratio",
        value=round(ratio, 4) if not np.isnan(ratio) else np.nan,
        threshold=FOUR_FIFTHS_THRESHOLD,
        status=status,
        risk_level=risk_level,
        details={
            "majority_group": str(majority_group),
            "minority_group": str(minority_group),
            "majority_positive_rate": round(majority_positive, 4),
            "minority_positive_rate": round(minority_positive, 4),
            "difference": round(minority_positive - majority_positive, 4)
        }
    )


def calculate_demographic_parity_difference(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str
) -> FairnessResult:
    """Calculate Demographic Parity Difference."""
    sensitive_values = df[sensitive_col].dropna().unique()
    if len(sensitive_values) < 2:
        return FairnessResult(
            metric_name="demographic_parity_difference",
            value=np.nan,
            threshold=0.1,
            status="INSUFFICIENT_DATA",
            risk_level="Unknown",
            details={"message": "Need 2+ groups for comparison"}
        )
    
    value_counts = df[sensitive_col].value_counts()
    majority_group = value_counts.index[0]
    minority_group = value_counts.index[-1] if len(value_counts) > 1 else value_counts.index[0]
    
    majority_positive = df[df[sensitive_col] == majority_group][target_col].mean()
    minority_positive = df[df[sensitive_col] == minority_group][target_col].mean()
    
    difference = minority_positive - majority_positive
    abs_diff = abs(difference)
    threshold = 0.1
    
    if abs_diff <= threshold:
        status = "PASS"
        risk_level = "Low"
    else:
        status = "FAIL"
        if abs_diff > 0.2:
            risk_level = "High"
        elif abs_diff > 0.15:
            risk_level = "Medium"
        else:
            risk_level = "Low-Medium"
    
    return FairnessResult(
        metric_name="demographic_parity_difference",
        value=round(difference, 4),
        threshold=threshold,
        status=status,
        risk_level=risk_level,
        details={
            "majority_group": str(majority_group),
            "minority_group": str(minority_group),
            "absolute_difference": round(abs_diff, 4)
        }
    )


def calculate_equalized_odds(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str,
    favorable_outcome: any = 1
) -> Dict[str, FairnessResult]:
    """Calculate Equalized Odds (TPR and FPR)."""
    sensitive_values = df[sensitive_col].dropna().unique()
    if len(sensitive_values) < 2:
        return {
            "tpr_diff": FairnessResult("equalized_odds_tpr", np.nan, 0.1, "INSUFFICIENT_DATA", "Unknown", {}),
            "fpr_diff": FairnessResult("equalized_odds_fpr", np.nan, 0.1, "INSUFFICIENT_DATA", "Unknown", {})
        }
    
    results = {}
    
    for group in sensitive_values:
        group_df = df[df[sensitive_col] == group]
        
        if (group_df[target_col] == favorable_outcome).sum() > 0:
            tpr = group_df[group_df[target_col] == favorable_outcome][target_col].mean()
        else:
            tpr = 0
        
        if (group_df[target_col] != favorable_outcome).sum() > 0:
            fpr = group_df[group_df[target_col] != favorable_outcome][target_col].mean()
        else:
            fpr = 0
        
        results[group] = {'tpr': tpr, 'fpr': fpr}
    
    groups = list(results.keys())
    tpr_diff = abs(results[groups[0]]['tpr'] - results[groups[1]]['tpr'])
    fpr_diff = abs(results[groups[0]]['fpr'] - results[groups[1]]['fpr'])
    
    return {
        "tpr_diff": FairnessResult("equalized_odds_tpr", round(tpr_diff, 4), 0.1,
            "PASS" if tpr_diff <= 0.1 else "FAIL",
            "Low" if tpr_diff <= 0.1 else "Medium", {"groups": groups}),
        "fpr_diff": FairnessResult("equalized_odds_fpr", round(fpr_diff, 4), 0.1,
            "PASS" if fpr_diff <= 0.1 else "FAIL",
            "Low" if fpr_diff <= 0.1 else "Medium", {"groups": groups})
    }


def calculate_predictive_parity(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str
) -> Dict[str, FairnessResult]:
    """Calculate Predictive Parity (PPV)."""
    sensitive_values = df[sensitive_col].dropna().unique()
    if len(sensitive_values) < 2:
        return {
            "ppv_diff": FairnessResult("predictive_parity_ppv", np.nan, 0.1, "INSUFFICIENT_DATA", "Unknown", {})
        }
    
    results = {}
    for group in sensitive_values:
        group_df = df[df[sensitive_col] == group]
        
        positive_outcomes = group_df[group_df[target_col] == 1]
        if len(positive_outcomes) > 0:
            ppv = positive_outcomes[target_col].mean()
        else:
            ppv = 0
        results[group] = ppv
    
    groups = list(results.keys())
    ppv_diff = abs(results[groups[0]] - results[groups[1]])
    
    return {
        "ppv_diff": FairnessResult("predictive_parity_ppv", round(ppv_diff, 4), 0.1,
            "PASS" if ppv_diff <= 0.1 else "FAIL",
            "Low" if ppv_diff <= 0.1 else "Medium", {"groups": groups})
    }


def calculate_all_metrics(
    df: pd.DataFrame,
    sensitive_col: str,
    target_col: str,
    include_advanced: bool = False
) -> Dict[str, any]:
    """Calculate all fairness metrics."""
    metrics = {}
    
    metrics['demographic_parity_ratio'] = calculate_demographic_parity_ratio(df, sensitive_col, target_col)
    metrics['demographic_parity_difference'] = calculate_demographic_parity_difference(df, sensitive_col, target_col)
    
    if include_advanced:
        equalized_odds = calculate_equalized_odds(df, sensitive_col, target_col)
        metrics.update(equalized_odds)
        
        predictive_parity = calculate_predictive_parity(df, sensitive_col, target_col)
        metrics.update(predictive_parity)
    
    return metrics