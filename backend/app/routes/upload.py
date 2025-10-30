from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import uuid
import io
from app.utils.data_store import store_dataframe
from app.utils.preprocessing import get_column_info

router = APIRouter()

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and return session ID with summary"""
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Store DataFrame
        store_dataframe(session_id, df)
        
        # Get column information
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        datetime_cols = df.select_dtypes(include=['datetime64']).columns.tolist()
        
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