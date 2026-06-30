from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from signup import router as signup_router
from login import router as login_router
from controlls import router as controller_router 
from virtualController import router as virtual_controller_router
from activity import router as activity_router

app = FastAPI(title="PlayAble Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(signup_router, prefix="/api")
app.include_router(login_router, prefix="/api")
app.include_router(controller_router, prefix="/api")
app.include_router(virtual_controller_router, prefix="/api") 
app.include_router(activity_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the PlayAble API"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)