from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import auth, dashboard, records, users
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinOps - Finance Dashboard Backend",
    description="Role-based finance data processing and access control backend",
    version="1.0.0",
)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(records.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "FinOps API"}
