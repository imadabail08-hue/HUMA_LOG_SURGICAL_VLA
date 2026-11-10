from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import datasets, annotate, export

app = FastAPI(
    title="HUMA-LOG Surgical Auto-Annotation Engine",
    description="Scalable Batch Auto-Annotation Platform with AI Quality Control (CVAT-grade)",
    version="1.0.0"
)

# CORS configuration for Frontend dev server (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite frontend & network requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datasets.router)
app.include_router(annotate.router)
app.include_router(export.router)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "online",
        "service": "HUMA-LOG CVAT Auto-Annotation Engine",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
