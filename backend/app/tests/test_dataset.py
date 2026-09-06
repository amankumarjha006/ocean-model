"""Tests for the /api/dataset metadata endpoint."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_dataset_endpoint_status():
    """Verify that /api/dataset returns HTTP 200 and valid schema."""
    response = client.get("/api/dataset")
    assert response.status_code == 200
    data = response.json()

    assert "incois_" in data["id"]
    assert "conventions" in data
    assert "coordinates" in data
    assert "variables" in data


def test_dataset_coordinates():
    """Verify 4D coordinates contain time, depth, latitude, and longitude dimensions."""
    response = client.get("/api/dataset")
    assert response.status_code == 200
    coords = response.json()["coordinates"]

    # Time coordinate
    assert "time" in coords
    assert len(coords["time"]["values"]) > 0
    assert coords["time"]["step"] == "6h"

    # Depth coordinate (positive-down)
    assert "depth" in coords
    assert coords["depth"]["positive"] == "down"
    assert coords["depth"]["units"] == "meters"
    assert 0.0 in coords["depth"]["values"]
    assert coords["depth"]["max_depth"] >= 1000.0

    # Lat/Lon coordinates
    assert "latitude" in coords
    assert "longitude" in coords
    assert coords["latitude"]["min_val"] < coords["latitude"]["max_val"]
    assert coords["longitude"]["min_val"] < coords["longitude"]["max_val"]


def test_dataset_required_variables():
    """Verify all 6 canonical ocean variables exist with generic metadata."""
    response = client.get("/api/dataset")
    assert response.status_code == 200
    variables = response.json()["variables"]

    required_vars = [
        "temperature",
        "salinity",
        "chlorophyll",
        "u_current",
        "v_current",
        "w_current",
    ]

    for var_name in required_vars:
        assert var_name in variables, f"Missing required variable: {var_name}"
        var_meta = variables[var_name]
        assert var_meta["name"] == var_name
        assert "units" in var_meta
        assert "display_name" in var_meta
        assert "dimensions" in var_meta
        assert var_meta["dimensions"] == ["time", "depth", "latitude", "longitude"]
        assert "default_palette" in var_meta


def test_dataset_observations():
    """Verify in-situ ocean observation platforms are included."""
    response = client.get("/api/dataset")
    assert response.status_code == 200
    observations = response.json()["observations"]

    assert len(observations) >= 2
    platform_types = {obs["platform_type"] for obs in observations}
    assert "argo" in platform_types
    assert "glider" in platform_types
