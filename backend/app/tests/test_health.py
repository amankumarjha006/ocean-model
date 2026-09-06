"""Tests for the /api/health endpoint."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint_status():
    """Verify that /api/health returns HTTP 200 and status ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert "service" in data
    assert "version" in data


def test_root_endpoint():
    """Verify root endpoint responds with project metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "online"
    assert "/api/dataset" in data.values() or data.get("dataset") == "/api/dataset"
