from fastapi import FastAPI
from api.auth import router as auth_router
from database import init_db

app = FastAPI(title="RedByte Server")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "redbyte server running"}
