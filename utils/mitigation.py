"""Bias mitigation utilities."""
import pandas as pd
import numpy as np
from typing import Tuple, Optional, Dict
from dataclasses import dataclass

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
        target_col: str
    ) -> pd.DataFrame:
        """Fallback reweighting using pandas/numpy."""
        df_weighted = df.copy()
        
        groups = df[sensitive_col].unique()
        
        if len(groups) < 2:
            return df_weighted
        
        group_stats = {}
        for group in groups:
            group_df = df[df[sensitive_col] == group]
            group_stats[group] = {
                'count': len(group_df),
                'positive': group_df[target_col].sum(),
                'rate': group_df[target_col].mean()
            }
        
        counts = [(g, s['count']) for g, s in group_stats.items()]
        counts.sort(key=lambda x: x[1], reverse=True)
        majority_group = counts[0][0]
        minority_group = counts[-1][0]
        
        majority_rate = group_stats[majority_group]['rate']
        minority_rate = group_stats[minority_group]['rate']
        
        if minority_rate > 0:
            adjustment_factor = (majority_rate * 0.8) / minority_rate
        else:
            adjustment_factor = 2.0
        
        adjustment_factor = max(1.0, min(adjustment_factor, 3.0))
        
        weights = np.ones(len(df))
        
        minority_mask = (df[sensitive_col] == minority_group) & (df[target_col] == 1)
        weights[minority_mask] = adjustment_factor
        
        df_weighted['_weight'] = weights
        df_weighted['_weight'] = df_weighted['_weight'].round()
        df_weighted['_weight'] = df_weighted['_weight'].clip(lower=1, upper=3)
        
        df_mitigated = df_weighted.loc[df_weighted.index.repeat(df_weighted['_weight'].astype(int))]
        df_mitigated = df_mitigated.drop(columns=['_weight']).reset_index(drop=True)
        
        self.method_used = "fallback_reweighing"
        self.mitigated_df = df_mitigated
        
        return df_mitigated
    
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