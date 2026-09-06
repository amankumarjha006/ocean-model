"""Tests for Pydantic schema validation and domain constraints."""

import pytest
from pydantic import ValidationError
from app.schemas.coordinates import (
    TimeCoordinate,
    DepthCoordinate,
    LatitudeCoordinate,
    LongitudeCoordinate,
    CoordinateMetadata,
)
from app.schemas.variables import VariableMetadata
from app.schemas.observations import ObservationMetadata


def test_variable_metadata_validation():
    """Verify generic VariableMetadata accepts arbitrary variables without special casing."""
    turbidity = VariableMetadata(
        name="turbidity",
        display_name="Ocean Water Turbidity",
        units="NTU",
        standard_name="sea_water_turbidity",
        dimensions=["time", "depth", "latitude", "longitude"],
        description="Nephelometric turbidity units measuring water clarity",
        valid_min=0.0,
        valid_max=50.0,
        default_palette="viridis",
    )
    assert turbidity.name == "turbidity"
    assert turbidity.units == "NTU"
    assert len(turbidity.dimensions) == 4


def test_coordinate_bounds_validation():
    """Verify latitude constraints reject out-of-bounds geographic values."""
    with pytest.raises(ValidationError):
        LatitudeCoordinate(
            min_val=-120.0,  # Invalid latitude < -90
            max_val=30.0,
            step=0.5,
            count=10,
        )


def test_depth_coordinate_positive_down():
    """Verify DepthCoordinate defaults to positive-down convention."""
    depth = DepthCoordinate(
        values=[0.0, 10.0, 50.0, 100.0],
        min_depth=0.0,
        max_depth=100.0,
        count=4,
    )
    assert depth.positive == "down"
    assert depth.units == "meters"
    assert depth.count == 4


def test_observation_metadata_validation():
    """Verify ObservationMetadata model validation."""
    obs = ObservationMetadata(
        id="argo_demo",
        platform_type="argo",
        platform_name="Test Float",
        variables_measured=["temperature", "salinity"],
        time_range=["2026-09-01T00:00:00Z", "2026-09-07T00:00:00Z"],
        depth_range_m=[0.0, 2000.0],
        spatial_extent=[65.0, 10.0, 70.0, 15.0],
        profile_count=5,
    )
    assert obs.platform_type == "argo"
    assert obs.status == "active"
