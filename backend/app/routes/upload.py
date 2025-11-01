from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import uuid
import io
from app.utils.data_store import store_dataframe
from app.utils.preprocessing import get_column_info

router = APIRouter()

def detect_column_types(df: pd.DataFrame):
    """Enhanced column type detection"""
    numeric_cols = []
    categorical_cols = []
    datetime_cols = []
    
    for col in df.columns:
        # Skip if all null
        if df[col].isnull().all():
            categorical_cols.append(col)
            continue
        
        # Get non-null sample
        sample = df[col].dropna()
        if len(sample) == 0:
            categorical_cols.append(col)
            continue
        
        # Check if datetime
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            datetime_cols.append(col)
            continue
        
        # Check if already numeric dtype
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
            continue
        
        # Try to convert to numeric (handles strings like "123", "45.6")
        try:
            # Remove common non-numeric characters
            cleaned = sample.astype(str).str.replace(',', '').str.strip()
            pd.to_numeric(cleaned, errors='raise')
            
            # If successful, convert the entire column
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace(',', '').str.strip(), 
                errors='coerce'
            )
            numeric_cols.append(col)
        except (ValueError, TypeError):
            # Check if it's a date column
            try:
                pd.to_datetime(sample, errors='raise')
                df[col] = pd.to_datetime(df[col], errors='coerce')
                datetime_cols.append(col)
            except:
                # It's categorical
                categorical_cols.append(col)
    
    return numeric_cols, categorical_cols, datetime_cols

def handle_null_representations(df: pd.DataFrame):
    """Replace common null representations with actual NaN"""
    null_values = ['-', '--', 'N/A', 'NA', 'n/a', 'null', 'NULL', 'None', 'none', '', ' ', 'NaN', 'nan']
    
    # Replace in entire dataframe
    df.replace(null_values, np.nan, inplace=True)
    
    # Also handle whitespace-only strings
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].apply(lambda x: np.nan if isinstance(x, str) and x.strip() == '' else x)
    
    return df

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and return session ID with summary"""
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read CSV file
        contents = await file.read()
        
        # Read with common null values
        df = pd.read_csv(
            io.BytesIO(contents),
            na_values=['-', '--', 'N/A', 'NA', 'n/a', 'null', 'NULL', 'None', 'none', 'NaN', 'nan'],
            keep_default_na=True
        )
        
        # Additional null handling
        df = handle_null_representations(df)
        
        # Detect column types with enhanced logic
        numeric_cols, categorical_cols, datetime_cols = detect_column_types(df)
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Store DataFrame
        store_dataframe(session_id, df)
        
        # Create summary
        summary = {
            "session_id": session_id,
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "datetime_columns": datetime_cols,
            "column_info": get_column_info(df)
        }
        
        return JSONResponse(content=summary, status_code=200)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get information about a specific session"""
    from app.utils.data_store import get_dataframe
    
    df = get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist()
    }

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    from app.utils.data_store import delete_dataframe
    
    success = delete_dataframe(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}