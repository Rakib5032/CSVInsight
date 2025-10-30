from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.utils.data_store import get_dataframe, store_dataframe
from app.utils.preprocessing import (
    drop_columns,
    handle_missing_values,
    one_hot_encode,
    label_encode,
    normalize_data,
    remove_duplicates,
    get_column_info
)

router = APIRouter()

class PreprocessRequest(BaseModel):
    session_id: str
    operations: List[dict]

class DropColumnsRequest(BaseModel):
    session_id: str
    columns: List[str]

class MissingValuesRequest(BaseModel):
    session_id: str
    strategy: str  # 'mean', 'median', 'mode', 'drop', 'fill_zero'

class EncodeRequest(BaseModel):
    session_id: str
    columns: List[str]
    method: str  # 'one_hot' or 'label'

class NormalizeRequest(BaseModel):
    session_id: str
    columns: Optional[List[str]] = None

@router.post("/preprocess")
async def preprocess_data(request: PreprocessRequest):
    """Apply multiple preprocessing operations"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Apply operations in sequence
        for operation in request.operations:
            op_type = operation.get('type')
            
            if op_type == 'drop_columns':
                columns = operation.get('columns', [])
                df = drop_columns(df, columns)
            
            elif op_type == 'missing_values':
                strategy = operation.get('strategy', 'mean')
                df = handle_missing_values(df, strategy)
            
            elif op_type == 'one_hot_encode':
                columns = operation.get('columns', [])
                df = one_hot_encode(df, columns)
            
            elif op_type == 'label_encode':
                columns = operation.get('columns', [])
                df = label_encode(df, columns)
            
            elif op_type == 'normalize':
                columns = operation.get('columns')
                df = normalize_data(df, columns)
            
            elif op_type == 'remove_duplicates':
                df = remove_duplicates(df)
        
        # Store updated DataFrame
        store_dataframe(request.session_id, df)
        
        # Return updated summary
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        return {
            "message": "Preprocessing completed successfully",
            "summary": {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "numeric_columns": numeric_cols,
                "categorical_columns": categorical_cols,
                "column_info": get_column_info(df)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {str(e)}")

@router.post("/drop-columns")
async def drop_columns_endpoint(request: DropColumnsRequest):
    """Drop specified columns"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    df = drop_columns(df, request.columns)
    store_dataframe(request.session_id, df)
    
    return {
        "message": f"Dropped {len(request.columns)} columns",
        "remaining_columns": df.columns.tolist()
    }

@router.post("/handle-missing")
async def handle_missing_endpoint(request: MissingValuesRequest):
    """Handle missing values"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    original_nulls = df.isnull().sum().sum()
    df = handle_missing_values(df, request.strategy)
    new_nulls = df.isnull().sum().sum()
    
    store_dataframe(request.session_id, df)
    
    return {
        "message": "Missing values handled",
        "strategy": request.strategy,
        "original_null_count": int(original_nulls),
        "new_null_count": int(new_nulls)
    }

@router.post("/encode")
async def encode_columns_endpoint(request: EncodeRequest):
    """Encode categorical columns"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if request.method == 'one_hot':
        df = one_hot_encode(df, request.columns)
    elif request.method == 'label':
        df = label_encode(df, request.columns)
    else:
        raise HTTPException(status_code=400, detail="Invalid encoding method")
    
    store_dataframe(request.session_id, df)
    
    return {
        "message": f"Applied {request.method} encoding",
        "encoded_columns": request.columns,
        "new_column_count": len(df.columns)
    }

@router.post("/normalize")
async def normalize_endpoint(request: NormalizeRequest):
    """Normalize numeric columns"""
    
    df = get_dataframe(request.session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    df = normalize_data(df, request.columns)
    store_dataframe(request.session_id, df)
    
    columns_normalized = request.columns if request.columns else df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    return {
        "message": "Data normalized",
        "normalized_columns": columns_normalized
    }

@router.post("/remove-duplicates")
async def remove_duplicates_endpoint(request: dict):
    """Remove duplicate rows"""
    
    session_id = request.get("session_id")
    df = get_dataframe(session_id)
    
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    original_rows = len(df)
    df = remove_duplicates(df)
    new_rows = len(df)
    
    store_dataframe(session_id, df)
    
    return {
        "message": "Duplicates removed",
        "original_rows": original_rows,
        "new_rows": new_rows,
        "duplicates_removed": original_rows - new_rows
    }