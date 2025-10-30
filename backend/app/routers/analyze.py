from fastapi import APIRouter, HTTPException
from app.core.session_manager import get_session_df
from app.core.data_utils import analyze_column
from app.core.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_column_endpoint(request: AnalyzeRequest):
    df = get_session_df(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if request.column_name not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found in CSV")
    
    analysis = analyze_column(df, request.column_name)
    return AnalyzeResponse(analysis=analysis)
