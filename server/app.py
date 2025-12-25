from fastapi import FastAPI
from api.health import router as health_router

app = FastAPI(title="RedByte Server")
app.include_router(health_router)

@app.get("/")
def root():
    return {"status": "redbyte server running"}
