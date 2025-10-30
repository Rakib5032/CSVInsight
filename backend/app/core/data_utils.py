import pandas as pd
import numpy as np

def csv_summary(df: pd.DataFrame):
    """
    Return summary of DataFrame
    """
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": df.columns.tolist(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
        "categorical_columns": df.select_dtypes(include=['object', 'category']).columns.tolist(),
        "head": df.head(5).to_dict(orient="records")
    }
    return summary

def analyze_column(df: pd.DataFrame, column_name: str):
    """
    Return analysis metrics for a single column
    """
    col_data = df[column_name]
    if col_data.dtype in [np.float64, np.int64]:
        # Numeric column
        analysis = {
            "type": "numeric",
            "count": int(col_data.count()),
            "mean": float(col_data.mean()),
            "median": float(col_data.median()),
            "std": float(col_data.std()),
            "min": float(col_data.min()),
            "max": float(col_data.max()),
            "missing": int(col_data.isnull().sum()),
            "unique": int(col_data.nunique()),
        }
    else:
        # Categorical column
        value_counts = col_data.value_counts().to_dict()
        analysis = {
            "type": "categorical",
            "count": int(col_data.count()),
            "missing": int(col_data.isnull().sum()),
            "unique": int(col_data.nunique()),
            "value_counts": value_counts
        }
    return analysis
