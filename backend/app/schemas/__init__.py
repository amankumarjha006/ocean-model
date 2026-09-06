"""Schema package for 4D ocean domain model."""

from app.schemas.coordinates import (
    TimeCoordinate,
    DepthCoordinate,
    LatitudeCoordinate,
    LongitudeCoordinate,
    CoordinateMetadata,
)
from app.schemas.variables import VariableMetadata
from app.schemas.observations import ObservationMetadata
from app.schemas.dataset import (
    DatasetMetadata,
    SpatialBounds,
    TemporalBounds,
)

__all__ = [
    "TimeCoordinate",
    "DepthCoordinate",
    "LatitudeCoordinate",
    "LongitudeCoordinate",
    "CoordinateMetadata",
    "VariableMetadata",
    "ObservationMetadata",
    "DatasetMetadata",
    "SpatialBounds",
    "TemporalBounds",
]
