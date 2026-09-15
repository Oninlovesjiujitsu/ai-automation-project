from fastapi import FastAPI

app = FastAPI(title="Autonomous Support API")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}
