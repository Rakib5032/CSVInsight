from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from app.core.session_manager import create_session
from app.core.data_utils import csv_summary
from app.core.schemas import UploadResponse

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file. {str(e)}")
    
    session_id = create_session(df)
    summary = csv_summary(df)
    
    return UploadResponse(session_id=session_id, summary=summary)
