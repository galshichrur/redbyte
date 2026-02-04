from fastapi import FastAPI
from api.auth import router as auth_router
from api.enrollment import enrollment_router
from database import init_db
from config import Config
from network.server import TCPServer
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    server = TCPServer()
    server.start()
    yield
    server.stop()

app = FastAPI(
    title="RedByte Server",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(enrollment_router)

@app.get("/")
def root():
    return {"status": "redbyte server running"}

@app.get("/server")
def server_address():
    return {
        "tcp": {
            "ip": Config.TCP_SERVER_HOST,
            "port": Config.TCP_SERVER_PORT
        }
    }