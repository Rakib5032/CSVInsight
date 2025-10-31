from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from app.utils.data_store import get_dataframe
import math

router = APIRouter()

class AnalyzeRequest(BaseModel):
    session_id: str
    column_name: str

def safe_float(value):
    """Convert value to JSON-safe float"""
    if pd.isna(value) or math.isnan(value) if isinstance(value, float) else False:
        return None
    if math.isinf(value) if isinstance(value, float) else False:
        return None
    return float(value)

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
        # Calculate statistics with safe conversion
        stats = {
            "min": safe_float(clean_data.min()),
            "max": safe_float(clean_data.max()),
            "mean": safe_float(clean_data.mean()),
            "median": safe_float(clean_data.median()),
            "std": safe_float(clean_data.std()),
            "q25": safe_float(clean_data.quantile(0.25)),
            "q75": safe_float(clean_data.quantile(0.75)),
            "null_count": int(column_data.isnull().sum()),
            "total_count": len(column_data)
        }
        
        # Create histogram data
        hist, bin_edges = np.histogram(clean_data, bins=15)
        histogram_data = [
            {
                "range": f"{safe_float(bin_edges[i]):.2f}-{safe_float(bin_edges[i+1]):.2f}",
                "count": int(hist[i]),
                "bin_start": safe_float(bin_edges[i]),
                "bin_end": safe_float(bin_edges[i+1])
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
    
    # Convert to list of dicts for frontend with safe float conversion
    correlations = []
    for i, col1 in enumerate(corr_matrix.columns):
        for j, col2 in enumerate(corr_matrix.columns):
            if i < j:  # Only upper triangle
                corr_val = safe_float(corr_matrix.iloc[i, j])
                if corr_val is not None:
                    correlations.append({
                        "column1": col1,
                        "column2": col2,
                        "correlation": corr_val
                    })
    
    # Convert matrix to dict with safe values
    matrix_dict = {}
    for col1 in corr_matrix.columns:
        matrix_dict[col1] = {}
        for col2 in corr_matrix.columns:
            matrix_dict[col1][col2] = safe_float(corr_matrix.loc[col1, col2]) or 0.0
    
    return {
        "correlations": correlations,
        "columns": corr_matrix.columns.tolist(),
        "matrix": matrix_dict
    }

@router.get("/preview/{session_id}")
async def preview_data(session_id: str, rows: int = 10):
    """Get a preview of the data"""
    
    df = get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Convert to records and handle NaN values
    preview_data = []
    for _, row in df.head(rows).iterrows():
        row_dict = {}
        for col in df.columns:
            value = row[col]
            if pd.isna(value):
                row_dict[col] = None
            elif isinstance(value, (np.integer, np.floating)):
                row_dict[col] = safe_float(value)
            else:
                row_dict[col] = str(value)
        preview_data.append(row_dict)
    
    return {
        "preview": preview_data,
        "total_rows": len(df),
        "columns": df.columns.tolist()
    }

@router.get("/download/{session_id}")
async def download_csv(session_id: str):
    """Download the current CSV"""
    from fastapi.responses import StreamingResponse
    import io
    
    df = get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Convert DataFrame to CSV
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=processed_data_{session_id[:8]}.csv"}
    )