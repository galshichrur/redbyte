import uvicorn
from config import Config

def main():
    uvicorn.run("app:app", host=Config.API_ADDRESS, port=Config.API_PORT, log_level="info")

if __name__ == '__main__':
    main()