"""API router aggregation."""

from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.dataset import router as dataset_router
from app.api.data import router as data_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(dataset_router)
api_router.include_router(data_router)

__all__ = ["api_router"]
