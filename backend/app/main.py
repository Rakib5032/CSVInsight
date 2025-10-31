from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, analyze, preprocess

app = FastAPI(title="Lensify API", version="1.0.0")

# CORS middleware
# For Render deployment, allow your frontend URL or all origins temporarily
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(preprocess.router, prefix="/api", tags=["preprocess"])

@app.get("/")
def root():
    return {"message": "Lensify API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
