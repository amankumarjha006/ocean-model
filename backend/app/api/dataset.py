"""Dataset metadata and variable catalog API endpoints."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Query
from app.schemas.dataset import DatasetMetadata
from app.schemas.coordinates import CoordinateMetadata
from app.schemas.variables import VariableMetadata
from app.services.dataset_service import DatasetService
from app.generators.scenarios import SCENARIOS

router = APIRouter(tags=["Dataset"])


@router.get("/dataset", response_model=DatasetMetadata)
async def get_dataset_metadata(
    scenario: str = Query(default="normal", description="Synthetic scenario name (normal, warm_eddy, cold_eddy, strong_currents)")
):
    """Retrieve canonical 4D ocean dataset metadata for the specified scenario."""
    return DatasetService.get_canonical_dataset(scenario=scenario)


@router.get("/dataset/variables", response_model=Dict[str, VariableMetadata])
async def get_dataset_variables(
    scenario: str = Query(default="normal", description="Synthetic scenario name")
):
    """Retrieve metadata catalog for all supported 4D ocean variables."""
    ds_meta = DatasetService.get_canonical_dataset(scenario=scenario)
    return ds_meta.variables


@router.get("/dataset/coordinates", response_model=CoordinateMetadata)
async def get_dataset_coordinates(
    scenario: str = Query(default="normal", description="Synthetic scenario name")
):
    """Retrieve 4D coordinate dimension definitions (time, depth, lat, lon)."""
    ds_meta = DatasetService.get_canonical_dataset(scenario=scenario)
    return ds_meta.coordinates


@router.get("/dataset/scenarios")
async def get_available_scenarios():
    """List all available procedural ocean scenarios and their descriptions."""
    return [
        {"name": name, "description": cfg.description}
        for name, cfg in SCENARIOS.items()
    ]
