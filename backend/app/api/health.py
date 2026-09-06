"""Health check endpoint."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    service: str = "ocean-data-backend"


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint confirming API availability."""
    return HealthResponse(status="ok", version="0.1.0", service="ocean-data-backend")
