from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db
from routers.auth import router as auth_router
from routers.analyze import router as analyze_router
from routers.history import router as history_router
from routers.rewrite import router as rewrite_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AI Resume Analyzer",
    description="Upload a resume and get AI-powered analysis via Groq.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5180",
        "http://localhost:5181",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5180",
        "https://resume-ai-frontend.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(analyze_router)
app.include_router(history_router)
app.include_router(rewrite_router)


@app.get("/health")
def health():
    return {"status": "ok", "database": "connected"}
