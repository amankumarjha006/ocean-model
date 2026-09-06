"""Data slice and vertical profile API endpoints."""

import os
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/data", tags=["Ocean Data"])


@router.get("/slice")
async def get_horizontal_slice(
    variable: str = Query(..., description="Variable name (temperature, salinity, chlorophyll, u_current, v_current, w_current, current_speed)"),
    time_index: int = Query(default=0, ge=0, description="Time index (0 to 9)"),
    depth_index: int = Query(default=0, ge=0, description="Depth index (0 to 23)"),
    scenario: str = Query(default="normal", description="Scenario: normal, warm_eddy, cold_eddy, strong_currents"),
) -> Dict[str, Any]:
    """Retrieve a 2D horizontal slice [latitude, longitude] for a specific time and depth."""
    try:
        return DatasetService.get_slice(
            variable=variable,
            time_index=time_index,
            depth_index=depth_index,
            scenario=scenario,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate slice: {str(e)}")


@router.get("/volume")
async def get_volume_data(
    variable: str = Query(default="temperature", description="Variable name"),
    time_index: int = Query(default=0, ge=0, description="Time index (0 to 9)"),
    scenario: str = Query(default="normal", description="Scenario name"),
    num_depths: int = Query(default=12, ge=4, le=24, description="Depth levels count: 8 (fast), 12/16 (balanced), 24 (full)"),
) -> Dict[str, Any]:
    """Retrieve a 3D sub-volume [depth, latitude, longitude] for layered volume and isosurfaces."""
    try:
        return DatasetService.get_volume(
            variable=variable,
            time_index=time_index,
            scenario=scenario,
            num_depths=num_depths,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate volume: {str(e)}")


@router.get("/profile")
async def get_vertical_profile(
    latitude_index: int = Query(..., ge=0, description="Latitude grid index (0 to 63)"),
    longitude_index: int = Query(..., ge=0, description="Longitude grid index (0 to 95)"),
    time_index: int = Query(default=0, ge=0, description="Time index (0 to 9)"),
    variable: str = Query(default="temperature", description="Variable name"),
    scenario: str = Query(default="normal", description="Scenario: normal, warm_eddy, cold_eddy, strong_currents"),
) -> Dict[str, Any]:
    """Retrieve a 1D vertical column profile across all 24 depth levels."""
    try:
        return DatasetService.get_profile(
            latitude_index=latitude_index,
            longitude_index=longitude_index,
            time_index=time_index,
            variable=variable,
            scenario=scenario,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate profile: {str(e)}")


@router.post("/export/netcdf")
async def export_netcdf(
    scenario: str = Query(default="normal", description="Scenario to export"),
    filename: Optional[str] = Query(default=None, description="Optional custom filename"),
):
    """Export the 4D dataset for the scenario to a standard CF-compliant NetCDF-4 file."""
    try:
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
        os.makedirs(data_dir, exist_ok=True)

        safe_name = filename or f"synthetic_ocean_{scenario}.nc"
        target_path = os.path.join(data_dir, safe_name)

        DatasetService.export_netcdf(output_filepath=target_path, scenario=scenario)

        return {
            "status": "success",
            "scenario": scenario,
            "filepath": target_path,
            "filename": safe_name,
            "size_bytes": os.path.getsize(target_path),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NetCDF export failed: {str(e)}")
