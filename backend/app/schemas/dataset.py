"""Dataset metadata schema for 4D ocean model products."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.coordinates import CoordinateMetadata
from app.schemas.variables import VariableMetadata
from app.schemas.observations import ObservationMetadata


class SpatialBounds(BaseModel):
    """Geographic bounding box."""
    min_latitude: float = Field(..., description="Southern boundary")
    max_latitude: float = Field(..., description="Northern boundary")
    min_longitude: float = Field(..., description="Western boundary")
    max_longitude: float = Field(..., description="Eastern boundary")


class TemporalBounds(BaseModel):
    """Dataset time limits."""
    start_time: str = Field(..., description="Start timestamp ISO-8601")
    end_time: str = Field(..., description="End timestamp ISO-8601")
    time_steps_count: int = Field(..., description="Total time slices available")


class DatasetMetadata(BaseModel):
    """Canonical root metadata object representing an ocean model simulation dataset."""
    id: str = Field(..., description="Dataset unique identifier")
    title: str = Field(..., description="Descriptive dataset name")
    institution: str = Field(default="INCOIS / MoES, Govt. of India", description="Publishing ocean institution")
    conventions: str = Field(default="CF-1.8, ACDD-1.3", description="Metadata conventions adhered to")
    source_model: str = Field(default="INCOIS-ROMS Indian Ocean High-Res Forecast", description="Underlying ocean physics model")
    summary: str = Field(..., description="Scientific abstract or operational summary of the dataset")
    spatial_bounds: SpatialBounds
    temporal_bounds: TemporalBounds
    coordinates: CoordinateMetadata
    variables: Dict[str, VariableMetadata] = Field(
        ...,
        description="Map of variable identifiers to generic VariableMetadata definitions"
    )
    observations: List[ObservationMetadata] = Field(
        default_factory=list,
        description="Associated in-situ observation platforms in the domain"
    )
    version: str = Field(default="1.0.0", description="Dataset release version")
