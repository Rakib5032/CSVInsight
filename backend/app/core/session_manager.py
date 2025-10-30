import uuid

# Dictionary to hold CSV data in memory
# session_id : pandas DataFrame
SESSION_STORE = {}

def create_session(df):
    """
    Create a new session and store the DataFrame
    Returns: session_id (str)
    """
    import uuid
    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = df
    return session_id

def get_session_df(session_id):
    """
    Retrieve DataFrame for a given session_id
    """
    return SESSION_STORE.get(session_id)

def update_session_df(session_id, df):
    """
    Update existing session with new DataFrame
    """
    if session_id in SESSION_STORE:
        SESSION_STORE[session_id] = df
        return True
    return False
