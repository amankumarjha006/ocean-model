"""Observation metadata schema for in-situ platforms (Argo floats, gliders, moorings)."""

from typing import List, Optional
from pydantic import BaseModel, Field


class ObservationMetadata(BaseModel):
    """Metadata representing an in-situ ocean observation platform/campaign."""
    id: str = Field(..., description="Unique platform identifier or WMO code (e.g. 'argo_2903334')")
    platform_type: str = Field(..., description="Type of platform: 'argo', 'glider', 'mooring', 'drifter'")
    platform_name: str = Field(..., description="Display title of platform (e.g. 'Argo Float #2903334')")
    institution: str = Field(default="INCOIS", description="Operating oceanographic agency")
    variables_measured: List[str] = Field(..., description="Observed variables (e.g. ['temperature', 'salinity'])")
    time_range: List[str] = Field(..., description="[start_time, end_time] in ISO-8601")
    depth_range_m: List[float] = Field(..., description="[min_depth, max_depth] in meters")
    spatial_extent: List[float] = Field(
        ...,
        description="Bounding box [min_lon, min_lat, max_lon, max_lat] in degrees"
    )
    profile_count: int = Field(default=1, description="Number of vertical profiles or trajectory waypoints")
    status: str = Field(default="active", description="Operational status: 'active', 'completed', 'inactive'")
