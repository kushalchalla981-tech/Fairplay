"""Bias mitigation utilities."""
import pandas as pd
import numpy as np
from typing import Tuple, Optional, Dict
from dataclasses import dataclass

FOUR_FIFTHS_THRESHOLD = 0.8

AIF360_AVAILABLE = False
try:
    from aif360.algorithms.preprocessing import Reweighing
    from aif360.datasets import BinaryLabelDataset
    AIF360_AVAILABLE = True
except ImportError:
    pass

FAIRLEARN_AVAILABLE = False
try:
    from fairlearn.reductions import ExponentiatedGradient, GridSearch
    from fairlearn.fairness import DemographicParity
    FAIRLEARN_AVAILABLE = True
except ImportError:
    pass


@dataclass
class MitigationResult:
    """Container for mitigation results."""
    method: str
    original_metrics: Dict
    mitigated_metrics: Dict
    improvement: float
    details: Dict


class BiasMitigator:
    """Handles bias mitigation using reweighting."""
    
    def __init__(self):
        self.method_used = None
        self.original_df = None
        self.mitigated_df = None
        
    def reweighing_aif360(
        self,
        df: pd.DataFrame,
        sensitive_col: str,
        target_col: str
    ) -> pd.DataFrame:
        """Apply AIF360 Reweighing algorithm."""
        if not AIF360_AVAILABLE:
            return self.reweighing_fallback(df, sensitive_col, target_col)
        
        df_encoded = df.copy()
        df_encoded[sensitive_col] = pd.Categorical(df_encoded[sensitive_col]).codes
        
        dataset = BinaryLabelDataset(
            df=df_encoded,
            label_names=[target_col],
            protected_attribute_names=[sensitive_col]
        )
        
        reweighing = Reweighing(unprivileged_groups=[{sensitive_col: 0}],
                             privileged_groups=[{sensitive_col: 1}])
        reweighed_dataset = reweighing.fit_transform(dataset)
        
        df_mitigated = reweighed_dataset.convert_to_dataframe()[0]
        
        original_categories = df[sensitive_col].unique()
        if len(original_categories) == 2:
            mapped_vals = [original_categories[code] for code in df_encoded[sensitive_col]]
            df_mitigated[sensitive_col] = mapped_vals
        
        self.method_used = "aif360"
        self.mitigated_df = df_mitigated
        
        return df_mitigated
    
    def reweighing_fallback(
        self,
        df: pd.DataFrame,
        sensitive_col: str,
        target_col: str,
        max_iterations: int = 5
    ) -> pd.DataFrame:
        """Fallback reweighting using pandas/numpy with iterative fixing."""
        df_current = df.copy()
        
        groups = df[sensitive_col].unique()
        if len(groups) < 2:
            return df_current
        
        for iteration in range(max_iterations):
            positive_rates = df_current.groupby(sensitive_col)[target_col].mean()
            best_group = positive_rates.idxmax()
            worst_group = positive_rates.idxmin()
            
            best_rate = positive_rates[best_group]
            worst_rate = positive_rates[worst_group]
            target_rate = best_rate * FOUR_FIFTHS_THRESHOLD
            
            # Check if all groups pass
            all_pass = all(rate >= target_rate for rate in positive_rates)
            if all_pass or worst_rate >= target_rate:
                break
            
            # Skip if worst group has no positive examples (can't fix with reweighting)
            worst_positive_count = ((df_current[sensitive_col] == worst_group) & (df_current[target_col] == 1)).sum()
            if worst_positive_count == 0:
                break
            
            # Calculate upweight factor for worst group
            upweight_factor = min(target_rate / worst_rate, 3.0)
            
            # Apply weights
            weights = np.ones(len(df_current))
            worst_positive_mask = (df_current[sensitive_col] == worst_group) & (df_current[target_col] == 1)
            weights[worst_positive_mask] = upweight_factor
            
            df_current['_weight'] = np.ceil(weights).astype(int).clip(1, 3)
            df_current = df_current.loc[df_current.index.repeat(df_current['_weight'])].drop(columns=['_weight']).reset_index(drop=True)
        
        self.method_used = "fallback_reweighing_iterative"
        self.mitigated_df = df_current
        return df_current
    
    def apply_mitigation(
        self,
        df: pd.DataFrame,
        sensitive_col: str,
        target_col: str,
        method: str = "auto"
    ) -> Tuple[pd.DataFrame, str]:
        """Apply bias mitigation with method selection."""
        self.original_df = df
        
        if method == "aif360" and AIF360_AVAILABLE:
            return self.reweighing_aif360(df, sensitive_col, target_col), "aif360"
        elif method == "fallback":
            return self.reweighing_fallback(df, sensitive_col, target_col), "fallback_reweighing"
        else:
            if AIF360_AVAILABLE:
                return self.reweighing_aif360(df, sensitive_col, target_col), "aif360"
            else:
                return self.reweighing_fallback(df, sensitive_col, target_col), "fallback_reweighing"
    
    def compare_before_after(
        self,
        df_original: pd.DataFrame,
        df_mitigated: pd.DataFrame,
        sensitive_col: str,
        target_col: str,
        original_metrics: Dict,
        mitigated_metrics: Dict
    ) -> Dict:
        """Compare before and after mitigation results."""
        return {
            'original': {
                'dpr': original_metrics.get('demographic_parity_ratio'),
                'dpd': original_metrics.get('demographic_parity_difference'),
                'total_rows': len(df_original)
            },
            'mitigated': {
                'dpr': mitigated_metrics.get('demographic_parity_ratio'),
                'dpd': mitigated_metrics.get('demographic_parity_difference'),
                'total_rows': len(df_mitigated)
            },
            'method': self.method_used,
            'improvement': (
                (mitigated_metrics.get('demographic_parity_ratio').value or 0) -
                (original_metrics.get('demographic_parity_ratio').value or 0)
            )
        }