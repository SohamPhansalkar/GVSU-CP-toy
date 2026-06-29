from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers from your individual endpoint files
from signup import router as signup_router
from login import router as login_router
from controlls import router as controlls_router

# Initialize the FastAPI application
app = FastAPI(title="PlayAble Backend")

# Add CORS middleware to allow your frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the endpoints with a common '/api' prefix
app.include_router(signup_router, prefix="/api")
app.include_router(login_router, prefix="/api")
app.include_router(controlls_router, prefix="/api")

# A simple root endpoint to verify the server is running
@app.get("/")
def read_root():
    return {"message": "Welcome to the PlayAble API"}

if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)