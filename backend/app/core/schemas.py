from pydantic import BaseModel
from typing import List

class UploadResponse(BaseModel):
    session_id: str
    summary: dict

class AnalyzeRequest(BaseModel):
    session_id: str
    column_name: str

class AnalyzeResponse(BaseModel):
    analysis: dict
