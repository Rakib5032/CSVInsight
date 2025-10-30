from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from app.utils.data_store import get_dataframe

router = APIRouter()

class AnalyzeRequest(BaseModel):
    session_id: str
    column_name: str

@router.post("/analyze")
async def analyze_column(request: AnalyzeRequest):
    """Analyze a specific column and return statistics and chart data"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if request.column_name not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
    
    column_data = df[request.column_name]
    column_type = str(column_data.dtype)
    
    # Remove null values for analysis
    clean_data = column_data.dropna()
    
    if len(clean_data) == 0:
        return {
            "column_name": request.column_name,
            "type": "empty",
            "message": "Column contains only null values"
        }
    
    # Numeric column analysis
    if pd.api.types.is_numeric_dtype(column_data):
        # Calculate statistics
        stats = {
            "min": float(clean_data.min()),
            "max": float(clean_data.max()),
            "mean": float(clean_data.mean()),
            "median": float(clean_data.median()),
            "std": float(clean_data.std()),
            "q25": float(clean_data.quantile(0.25)),
            "q75": float(clean_data.quantile(0.75)),
            "null_count": int(column_data.isnull().sum()),
            "total_count": len(column_data)
        }
        
        # Create histogram data
        hist, bin_edges = np.histogram(clean_data, bins=15)
        histogram_data = [
            {
                "range": f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
                "count": int(hist[i]),
                "bin_start": float(bin_edges[i]),
                "bin_end": float(bin_edges[i+1])
            }
            for i in range(len(hist))
        ]
        
        return {
            "column_name": request.column_name,
            "type": "numeric",
            "stats": stats,
            "chart_data": histogram_data
        }
    
    # Categorical column analysis
    else:
        value_counts = clean_data.value_counts()
        
        # Get top 15 values
        top_values = value_counts.head(15)
        
        chart_data = [
            {"name": str(name), "value": int(count)}
            for name, count in top_values.items()
        ]
        
        stats = {
            "unique_count": int(clean_data.nunique()),
            "total_count": len(column_data),
            "null_count": int(column_data.isnull().sum()),
            "mode": str(clean_data.mode()[0]) if len(clean_data.mode()) > 0 else None,
            "top_values": chart_data[:10]
        }
        
        return {
            "column_name": request.column_name,
            "type": "categorical",
            "stats": stats,
            "chart_data": chart_data
        }

@router.post("/correlations")
async def get_correlations(request: dict):
    """Get correlation matrix for numeric columns"""
    
    session_id = request.get("session_id")
    df = get_dataframe(session_id)
    
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get numeric columns only
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        raise HTTPException(status_code=400, detail="No numeric columns found")
    
    # Calculate correlation matrix
    corr_matrix = numeric_df.corr()
    
    # Convert to list of dicts for frontend
    correlations = []
    for i, col1 in enumerate(corr_matrix.columns):
        for j, col2 in enumerate(corr_matrix.columns):
            if i < j:  # Only upper triangle
                correlations.append({
                    "column1": col1,
                    "column2": col2,
                    "correlation": float(corr_matrix.iloc[i, j])
                })
    
    return {
        "correlations": correlations,
        "columns": corr_matrix.columns.tolist(),
        "matrix": corr_matrix.to_dict()
    }

@router.get("/preview/{session_id}")
async def preview_data(session_id: str, rows: int = 10):
    """Get a preview of the data"""
    
    df = get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    preview = df.head(rows).to_dict(orient='records')
    
    return {
        "preview": preview,
        "total_rows": len(df),
        "columns": df.columns.tolist()
    }