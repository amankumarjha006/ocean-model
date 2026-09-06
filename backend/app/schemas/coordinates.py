"""Coordinate schemas for 4D ocean domain (time, depth, latitude, longitude)."""

from typing import List, Optional
from pydantic import BaseModel, Field


class TimeCoordinate(BaseModel):
    """Temporal coordinate dimension."""
    units: str = Field(default="ISO-8601", description="Time coordinate format standard")
    calendar: str = Field(default="gregorian", description="Calendar system")
    values: List[str] = Field(..., description="Array of ISO-8601 timestamp strings")
    start: str = Field(..., description="Start timestamp of available range")
    end: str = Field(..., description="End timestamp of available range")
    step: str = Field(default="1h", description="Nominal time resolution step")
    count: int = Field(..., description="Total time steps")


class DepthCoordinate(BaseModel):
    """Vertical depth coordinate dimension, positive-down convention."""
    units: str = Field(default="meters", description="Vertical unit of measure (positive downwards)")
    positive: str = Field(default="down", description="Direction of increasing coordinate value")
    standard_name: str = Field(default="depth", description="CF convention standard name")
    values: List[float] = Field(..., description="Discrete depth levels in meters (0 = surface)")
    min_depth: float = Field(..., description="Minimum depth (usually surface 0m)")
    max_depth: float = Field(..., description="Maximum depth in meters (e.g. 5000m)")
    count: int = Field(..., description="Total depth levels")


class LatitudeCoordinate(BaseModel):
    """Spatial latitude coordinate dimension."""
    units: str = Field(default="degrees_north", description="Latitude units")
    standard_name: str = Field(default="latitude", description="CF convention standard name")
    min_val: float = Field(..., ge=-90.0, le=90.0, description="Southernmost latitude bound")
    max_val: float = Field(..., ge=-90.0, le=90.0, description="Northernmost latitude bound")
    step: float = Field(..., gt=0, description="Grid resolution in degrees")
    count: int = Field(..., gt=0, description="Total grid cells along latitude")


class LongitudeCoordinate(BaseModel):
    """Spatial longitude coordinate dimension."""
    units: str = Field(default="degrees_east", description="Longitude units")
    standard_name: str = Field(default="longitude", description="CF convention standard name")
    min_val: float = Field(..., ge=-180.0, le=360.0, description="Westernmost longitude bound")
    max_val: float = Field(..., ge=-180.0, le=360.0, description="Easternmost longitude bound")
    step: float = Field(..., gt=0, description="Grid resolution in degrees")
    count: int = Field(..., gt=0, description="Total grid cells along longitude")


class CoordinateMetadata(BaseModel):
    """Aggregate 4D coordinates (time, depth, latitude, longitude)."""
    time: TimeCoordinate
    depth: DepthCoordinate
    latitude: LatitudeCoordinate
    longitude: LongitudeCoordinate
