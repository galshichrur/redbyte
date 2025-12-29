from fastapi import FastAPI
from api.auth import router as auth_router
from api.enrollment import enrollment_router
from database import init_db
from config import Config
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="RedByte Server")

origins = [
    "http://localhost:8080",
    "https://redbyte.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth_router)
app.include_router(enrollment_router)

@app.get("/")
def root():
    return {"status": "redbyte server running"}

def main():
    import uvicorn
    uvicorn.run(app, host=Config.API_ADDRESS, port=Config.API_PORT)

if __name__ == "__main__":
    main()
