from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, business, customers, enquiries, knowledge_base

app = FastAPI(title="AI Business Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(business.router)
app.include_router(customers.router)
app.include_router(enquiries.router)
app.include_router(knowledge_base.router)


@app.get("/")
async def root():
    return {"message": "AI Business Assistant API"}