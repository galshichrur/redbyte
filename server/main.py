from fastapi import FastAPI
from api.auth import router as auth_router
from database import init_db
from config import Config


app = FastAPI(title="RedByte Server")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "redbyte server running"}

def main():
    import uvicorn
    uvicorn.run(app, host=Config.API_ADDRESS, port=Config.API_PORT)

if __name__ == "__main__":
    main()
