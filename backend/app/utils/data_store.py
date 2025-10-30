import pandas as pd
from typing import Dict, Optional

# In-memory storage: session_id -> pandas DataFrame
data_store: Dict[str, pd.DataFrame] = {}

def store_dataframe(session_id: str, df: pd.DataFrame) -> None:
    """Store a DataFrame for a given session ID"""
    data_store[session_id] = df

def get_dataframe(session_id: str) -> Optional[pd.DataFrame]:
    """Retrieve a DataFrame for a given session ID"""
    return data_store.get(session_id)

def delete_dataframe(session_id: str) -> bool:
    """Delete a DataFrame for a given session ID"""
    if session_id in data_store:
        del data_store[session_id]
        return True
    return False

def session_exists(session_id: str) -> bool:
    """Check if a session exists"""
    return session_id in data_store

def get_all_sessions() -> list:
    """Get all active session IDs"""
    return list(data_store.keys())