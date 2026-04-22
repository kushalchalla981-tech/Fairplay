"""Data ingestion and validation utilities."""
import pandas as pd
import numpy as np
from typing import Tuple, List, Optional

SENSITIVE_ATTR_PATTERNS = [
    'gender', 'sex', 'male', 'female', 'woman', 'man',
    'race', 'ethnicity', 'ethnic', 'nationality',
    'age', 'dob', 'date_of_birth', 'birth_date',
    'religion', 'faith', 'disability', 'handicap',
    'caste', 'tribe', 'minority', 'marginalized'
]

TARGET_PATTERNS = [
    'outcome', 'result', 'decision', 'approved', 'rejected',
    'score', 'rating', 'risk', 'eligible', 'selected',
    'hired', 'promoted', 'admitted', 'accepted'
]

class DataLoadError(Exception):
    """Custom exception for data loading errors."""
    pass

class DataLoader:
    """Handles CSV ingestion with validation and auto-detection."""
    
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.filename: Optional[str] = None
        
    def load_csv(self, uploaded_file) -> pd.DataFrame:
        """Load CSV from Streamlit uploaded file object."""
        self.df = pd.read_csv(uploaded_file)
        self.filename = uploaded_file.name
        self._validate()
        return self.df
    
    def _validate(self) -> None:
        """Validate DataFrame structure."""
        if self.df is None or self.df.empty:
            raise DataLoadError("Uploaded file is empty")
        
        if len(self.df.columns) < 2:
            raise DataLoadError("Dataset must have at least 2 columns")
        
        non_useful_cols = 0
        for col in self.df.columns:
            if self.df[col].dtype == 'object':
                if self.df[col].nunique() > 50:
                    non_useful_cols += 1
        if non_useful_cols == len(self.df.columns):
            raise DataLoadError("No identifiable structured columns found")
    
    def detect_sensitive_attributes(self) -> List[str]:
        """Auto-detect potential sensitive attribute columns."""
        if self.df is None:
            return []
        
        sensitive_cols = []
        for col in self.df.columns:
            col_lower = col.lower().strip()
            matched = False
            for pattern in SENSITIVE_ATTR_PATTERNS:
                if pattern in col_lower:
                    sensitive_cols.append(col)
                    matched = True
                    break
            if not matched:
                if self.df[col].dtype == 'object' and self.df[col].nunique() <= 10:
                    sample_vals = self.df[col].dropna().head(10).astype(str).str.lower()
                    for pattern in SENSITIVE_ATTR_PATTERNS:
                        if any(pattern in str(v) for v in sample_vals):
                            sensitive_cols.append(col)
                            break
        
        return list(set(sensitive_cols))
    
    def detect_target_column(self) -> List[str]:
        """Auto-detect potential target/outcome columns."""
        if self.df is None:
            return []
        
        target_cols = []
        for col in self.df.columns:
            col_lower = col.lower().strip()
            for pattern in TARGET_PATTERNS:
                if pattern in col_lower:
                    target_cols.append(col)
                    break
        
        return list(set(target_cols))
    
    def get_column_info(self) -> dict:
        """Get detailed column information for UI."""
        if self.df is None:
            return {}
        
        info = {}
        for col in self.df.columns:
            info[col] = {
                'dtype': str(self.df[col].dtype),
                'unique_count': self.df[col].nunique(),
                'null_count': int(self.df[col].isnull().sum()),
                'sample_values': self.df[col].dropna().head(5).tolist()
            }
        return info