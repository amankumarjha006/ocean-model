"""Integration tests for dataset, slice, profile, and NetCDF export endpoints."""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_dataset_variables():
    """Verify /api/dataset/variables returns dictionary of 6 canonical variables."""
    response = client.get("/api/dataset/variables")
    assert response.status_code == 200
    vars_dict = response.json()

    assert len(vars_dict) == 6
    for var in ["temperature", "salinity", "chlorophyll", "u_current", "v_current", "w_current"]:
        assert var in vars_dict
        assert vars_dict[var]["name"] == var
        assert "units" in vars_dict[var]
        assert "valid_min" in vars_dict[var]
        assert "valid_max" in vars_dict[var]


def test_get_dataset_coordinates():
    """Verify /api/dataset/coordinates returns 4D coordinates with exact counts."""
    response = client.get("/api/dataset/coordinates")
    assert response.status_code == 200
    coords = response.json()

    assert coords["time"]["count"] == 10
    assert coords["depth"]["count"] == 24
    assert coords["latitude"]["count"] == 64
    assert coords["longitude"]["count"] == 96
    assert coords["depth"]["positive"] == "down"


def test_get_dataset_scenarios():
    """Verify /api/dataset/scenarios returns available scenarios."""
    response = client.get("/api/dataset/scenarios")
    assert response.status_code == 200
    scenarios = response.json()

    scenario_names = [s["name"] for s in scenarios]
    for expected in ["normal", "warm_eddy", "cold_eddy", "strong_currents"]:
        assert expected in scenario_names


def test_get_data_slice_success():
    """Verify /api/data/slice returns a valid 2D matrix (64 lat × 96 lon)."""
    response = client.get("/api/data/slice?variable=temperature&time_index=2&depth_index=5&scenario=normal")
    assert response.status_code == 200
    data = response.json()

    assert data["variable"] == "temperature"
    assert data["time_index"] == 2
    assert data["depth_index"] == 5
    assert data["shape"] == [64, 96]
    assert len(data["data"]) == 64
    assert len(data["data"][0]) == 96
    assert "min" in data
    assert "max" in data
    assert "mean" in data
    assert data["min"] <= data["max"]


def test_get_current_speed_slice():
    """Verify /api/data/slice computes virtual variable current_speed (hypot(u,v))."""
    response = client.get("/api/data/slice?variable=current_speed&time_index=0&depth_index=0")
    assert response.status_code == 200
    data = response.json()
    assert data["variable"] == "current_speed"
    assert data["min"] >= 0.0
    assert data["max"] > 0.0


def test_get_data_volume():
    """Verify /api/data/volume returns 3D matrix with requested num_depths."""
    response = client.get("/api/data/volume?variable=temperature&time_index=0&num_depths=8")
    assert response.status_code == 200
    data = response.json()
    assert data["variable"] == "temperature"
    assert data["num_depths"] == 8
    assert data["shape"] == [8, 64, 96]
    assert len(data["data"]) == 8
    assert len(data["data"][0]) == 64
    assert len(data["data"][0][0]) == 96


def test_get_data_slice_invalid_variable():
    """Verify /api/data/slice rejects unknown variable names with HTTP 400."""
    response = client.get("/api/data/slice?variable=nonexistent_var&time_index=0&depth_index=0")
    assert response.status_code == 400
    assert "Invalid variable" in response.json()["detail"]


def test_get_data_profile_success():
    """Verify /api/data/profile returns 1D vertical column (24 depth levels)."""
    response = client.get("/api/data/profile?latitude_index=30&longitude_index=45&time_index=0&variable=salinity")
    assert response.status_code == 200
    data = response.json()

    assert data["variable"] == "salinity"
    assert data["latitude_index"] == 30
    assert data["longitude_index"] == 45
    assert len(data["depths"]) == 24
    assert len(data["values"]) == 24
    assert data["min"] <= data["max"]


def test_post_export_netcdf():
    """Verify /api/data/export/netcdf exports a NetCDF file successfully."""
    response = client.post("/api/data/export/netcdf?scenario=normal&filename=test_export.nc")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert os.path.exists(data["filepath"])
    assert data["size_bytes"] > 1_000_000
