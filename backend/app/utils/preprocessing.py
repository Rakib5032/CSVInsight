import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from typing import List, Dict, Any

def drop_columns(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Drop specified columns from DataFrame"""
    return df.drop(columns=columns, errors='ignore')

def handle_missing_values(df: pd.DataFrame, strategy: str = 'mean') -> pd.DataFrame:
    """Handle missing values in DataFrame
    
    Args:
        df: Input DataFrame
        strategy: 'mean', 'median', 'mode', 'drop', or 'fill_zero'
    """
    df_copy = df.copy()
    
    if strategy == 'drop':
        return df_copy.dropna()
    elif strategy == 'fill_zero':
        return df_copy.fillna(0)
    elif strategy == 'mean':
        numeric_cols = df_copy.select_dtypes(include=[np.number]).columns
        df_copy[numeric_cols] = df_copy[numeric_cols].fillna(df_copy[numeric_cols].mean())
        return df_copy
    elif strategy == 'median':
        numeric_cols = df_copy.select_dtypes(include=[np.number]).columns
        df_copy[numeric_cols] = df_copy[numeric_cols].fillna(df_copy[numeric_cols].median())
        return df_copy
    elif strategy == 'mode':
        for col in df_copy.columns:
            df_copy[col].fillna(df_copy[col].mode()[0] if not df_copy[col].mode().empty else 0, inplace=True)
        return df_copy
    
    return df_copy

def one_hot_encode(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Apply one-hot encoding to specified columns - ML Ready with 0 and 1
    
    IMPORTANT: Validates that columns don't have too many unique values
    to prevent memory errors
    """
    df_copy = df.copy()
    
    # Validate each column before encoding
    for col in columns:
        if col in df_copy.columns:
            unique_count = df_copy[col].nunique()
            
            # Prevent encoding if too many unique values (would create too many columns)
            if unique_count > 100:
                raise ValueError(
                    f"Column '{col}' has {unique_count} unique values. "
                    f"One-hot encoding is not recommended for columns with more than 100 unique values. "
                    f"Consider using Label Encoding instead, or drop this column."
                )
            
            # Warn if many unique values but still processable
            if unique_count > 50:
                print(f"Warning: Column '{col}' has {unique_count} unique values. "
                      f"This will create {unique_count} new columns.")
    
    # Use get_dummies with dtype int to ensure 0 and 1 instead of True/False
    encoded_df = pd.get_dummies(df_copy, columns=columns, drop_first=False, dtype=int)
    
    return encoded_df

def label_encode(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Apply label encoding to specified columns - ML Ready with integer labels"""
    df_copy = df.copy()
    le = LabelEncoder()
    
    for col in columns:
        if col in df_copy.columns:
            # LabelEncoder already returns integers (0, 1, 2, ...)
            df_copy[col] = le.fit_transform(df_copy[col].astype(str))
    
    return df_copy

def normalize_data(df: pd.DataFrame, columns: List[str] = None) -> pd.DataFrame:
    """Normalize numeric columns using StandardScaler"""
    df_copy = df.copy()
    
    if columns is None:
        columns = df_copy.select_dtypes(include=[np.number]).columns.tolist()
    
    # Only normalize columns that exist and are numeric
    valid_columns = [col for col in columns if col in df_copy.columns 
                     and pd.api.types.is_numeric_dtype(df_copy[col])]
    
    if not valid_columns:
        raise ValueError("No valid numeric columns found for normalization")
    
    scaler = StandardScaler()
    df_copy[valid_columns] = scaler.fit_transform(df_copy[valid_columns])
    
    return df_copy

def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicate rows from DataFrame"""
    return df.drop_duplicates()

def get_column_info(df: pd.DataFrame) -> Dict[str, Any]:
    """Get detailed information about DataFrame columns"""
    info = {
        'columns': [],
        'total_rows': len(df),
        'total_columns': len(df.columns)
    }
    
    for col in df.columns:
        col_info = {
            'name': col,
            'dtype': str(df[col].dtype),
            'null_count': int(df[col].isnull().sum()),
            'null_percentage': float(df[col].isnull().sum() / len(df) * 100) if len(df) > 0 else 0.0,
            'unique_count': int(df[col].nunique())
        }
        
        if df[col].dtype in [np.float64, np.int64]:
            col_info['min'] = float(df[col].min()) if not pd.isna(df[col].min()) else None
            col_info['max'] = float(df[col].max()) if not pd.isna(df[col].max()) else None
            col_info['mean'] = float(df[col].mean()) if not pd.isna(df[col].mean()) else None
        
        info['columns'].append(col_info)
    
    return info