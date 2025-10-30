from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, analyze

app = FastAPI(title="CSVInsight Backend Phase 1")

# Allow frontend to access API
origins = [
    "http://localhost:5173",  # default Vite dev server
    "http://localhost:3000"   # alternative dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
