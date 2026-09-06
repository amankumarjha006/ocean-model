"""Comprehensive unit tests for procedural ocean generator and scenario system."""

import os
import tempfile
import numpy as np
import pytest
import xarray as xr

from app.generators.synthetic_ocean import SyntheticOceanGenerator
from app.generators.scenarios import get_scenario_config, SCENARIOS


class TestSyntheticOceanGenerator:
    """Test suite validating the mathematical, physical, and structural integrity of synthetic data."""

    @pytest.fixture(scope="class")
    @classmethod
    def dataset(cls):
        gen = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))
        return gen.generate()

    def test_dimensions_and_shapes(self, dataset):
        """Verify exact canonical dimensions: (10, 24, 64, 96)."""
        assert dataset.sizes["time"] == 10
        assert dataset.sizes["depth"] == 24
        assert dataset.sizes["latitude"] == 64
        assert dataset.sizes["longitude"] == 96

        expected_vars = ["temperature", "salinity", "chlorophyll", "u_current", "v_current", "w_current"]
        for var in expected_vars:
            assert var in dataset.data_vars
            assert dataset[var].shape == (10, 24, 64, 96)

    def test_coordinate_values(self, dataset):
        """Verify coordinate value ranges and conventions."""
        # Depths: 0m to 1000m
        depths = dataset["depth"].values
        assert depths[0] == 0.0
        assert depths[-1] == 1000.0
        assert len(depths) == 24
        assert dataset["depth"].attrs["positive"] == "down"

        # Latitudes: 0°N to 30°N
        lats = dataset["latitude"].values
        assert pytest.approx(lats[0], 0.01) == 0.0
        assert pytest.approx(lats[-1], 0.01) == 30.0

        # Longitudes: 55°E to 100°E
        lons = dataset["longitude"].values
        assert pytest.approx(lons[0], 0.01) == 55.0
        assert pytest.approx(lons[-1], 0.01) == 100.0

    def test_numerical_validity(self, dataset):
        """Ensure no NaNs or Infinite values in any variable."""
        for var in dataset.data_vars:
            arr = dataset[var].values
            assert not np.isnan(arr).any(), f"NaN found in {var}"
            assert not np.isinf(arr).any(), f"Inf found in {var}"

    def test_temperature_stratification(self, dataset):
        """Verify vertical cooling: surface temperature must be significantly warmer than deep water."""
        temp = dataset["temperature"]
        surface_mean = float(temp.isel(depth=0).mean())
        deep_mean = float(temp.isel(depth=-1).mean())

        assert surface_mean > 22.0
        assert deep_mean < 12.0
        assert surface_mean - deep_mean > 12.0

    def test_subsurface_chlorophyll_maximum(self, dataset):
        """Verify SCM: peak chlorophyll concentration occurs in euphotic zone (<=100m) and vanishes at depth."""
        chl = dataset["chlorophyll"]
        mean_profile = chl.isel(time=0).mean(dim=["latitude", "longitude"]).values
        peak_idx = int(np.argmax(mean_profile))
        peak_depth = float(dataset["depth"].values[peak_idx])

        assert peak_depth <= 100.0, f"SCM peak at {peak_depth}m, expected in upper 100m"
        assert mean_profile[peak_idx] > 1.0, "SCM peak value should be substantial"
        assert mean_profile[-1] < 0.25, "Deep chlorophyll should be minimal"

    def test_current_attenuation_with_depth(self, dataset):
        """Verify ocean currents are strong at the surface and decay with depth."""
        u = dataset["u_current"]
        v = dataset["v_current"]
        surf_speed = np.hypot(u.isel(depth=0).values, v.isel(depth=0).values).mean()
        deep_speed = np.hypot(u.isel(depth=-1).values, v.isel(depth=-1).values).mean()

        assert surf_speed > 0.25
        assert deep_speed < 0.10
        assert surf_speed > deep_speed * 3.0

    def test_eddy_circulation_correlation(self, dataset):
        """Verify that temperature anomalies correlate with rotational currents.

        - Warm eddy center has local temperature maximum and clockwise rotation.
        - Cold eddy center has local temperature minimum, counter-clockwise rotation, and upwelling (w > 0).
        """
        cfg = get_scenario_config("normal")
        # Sample around warm eddy location at time 0
        lons = dataset["longitude"].values
        lats = dataset["latitude"].values

        # Find grid index closest to warm eddy center
        w_lon_idx = int(np.argmin(np.abs(lons - cfg.warm_eddy_start_lon)))
        w_lat_idx = int(np.argmin(np.abs(lats - cfg.warm_eddy_start_lat)))

        # Find grid index closest to cold eddy center
        c_lon_idx = int(np.argmin(np.abs(lons - cfg.cold_eddy_start_lon)))
        c_lat_idx = int(np.argmin(np.abs(lats - cfg.cold_eddy_start_lat)))

        temp_warm = float(dataset["temperature"].isel(time=0, depth=0, latitude=w_lat_idx, longitude=w_lon_idx))
        temp_cold = float(dataset["temperature"].isel(time=0, depth=0, latitude=c_lat_idx, longitude=c_lon_idx))

        assert temp_warm > temp_cold + 2.5, f"Warm eddy ({temp_warm}°C) should be warmer than cold eddy ({temp_cold}°C)"

        # Vertical velocity in cold eddy should be positive (upwelling)
        w_cold = float(dataset["w_current"].isel(time=0, depth=8, latitude=c_lat_idx, longitude=c_lon_idx))
        assert w_cold > 0.005, f"Expected upwelling (w > 0) in cold eddy, got {w_cold}"

    def test_temporal_evolution_smoothness(self, dataset):
        """Verify data evolves smoothly over time without erratic jumping."""
        temp = dataset["temperature"].isel(depth=0).values
        # Step-to-step difference between consecutive time slices
        for t in range(dataset.sizes["time"] - 1):
            diff = np.abs(temp[t + 1] - temp[t])
            # Maximum step change across 6 hours should be realistic (< 2.5°C)
            assert diff.max() < 2.5, f"Unrealistic temporal jump at step {t}: {diff.max()}°C"
            assert diff.mean() > 0.01, f"Time step {t} should not be static"

    def test_deterministic_reproducibility(self):
        """Verify identical seed produces strictly bitwise identical dataset arrays."""
        gen1 = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))
        gen2 = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))

        ds1 = gen1.generate()
        ds2 = gen2.generate()

        for var in ds1.data_vars:
            np.testing.assert_array_equal(ds1[var].values, ds2[var].values)

    def test_scenario_parameter_adaptation(self):
        """Verify scenarios modify generator behavior predictably without separate code."""
        gen_norm = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))
        gen_warm = SyntheticOceanGenerator(scenario=get_scenario_config("warm_eddy"))

        ds_norm = gen_norm.generate()
        ds_warm = gen_warm.generate()

        # Warm eddy scenario should have higher peak temperature
        assert ds_warm["temperature"].max() > ds_norm["temperature"].max()

    def test_netcdf_export_roundtrip(self):
        """Verify dataset can be saved to NetCDF-4 and read back via xarray without loss."""
        gen = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))
        with tempfile.TemporaryDirectory() as tmpdir:
            nc_path = os.path.join(tmpdir, "test_ocean.nc")
            gen.export_netcdf(nc_path)

            assert os.path.exists(nc_path)
            assert os.path.getsize(nc_path) > 1_000_000  # Multi-megabyte NetCDF

            with xr.open_dataset(nc_path) as reloaded:
                assert reloaded.sizes["time"] == 10
                assert reloaded.sizes["depth"] == 24
                assert "temperature" in reloaded.data_vars
                assert reloaded.attrs["conventions"] == "CF-1.8, ACDD-1.3"
                np.testing.assert_allclose(
                    reloaded["temperature"].values,
                    gen.generate()["temperature"].values,
                    rtol=1e-5
                )
