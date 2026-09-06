"""Procedurally generated, scientifically-inspired synthetic ocean dataset generator.

IMPORTANT SCIENTIFIC NOTE:
This is NOT a numerical ocean circulation model. It is a procedural generator designed
to reproduce realistic spatial, vertical, and temporal patterns (stratification, thermocline,
mesoscale eddies, subsurface chlorophyll maximum, and correlated rotational currents)
for the INCOIS SIH 2026 3D Ocean Data Visualization Platform without requiring proprietary datasets.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
import xarray as xr

from app.generators.scenarios import ScenarioConfig, get_scenario_config


class SyntheticOceanGenerator:
    """Generates 4D (time, depth, latitude, longitude) synthetic ocean datasets

    using vectorized NumPy calculations and encapsulates them in an xarray.Dataset.
    """

    def __init__(self, scenario: Optional[ScenarioConfig] = None):
        self.config = scenario or get_scenario_config("normal")

        # 1. Define Coordinates
        # Time: 10 steps (6-hour interval)
        self.n_time = 10
        base_time = datetime(2026, 9, 1, 0, 0, 0)
        self.time_datetimes = [base_time + timedelta(hours=6 * i) for i in range(self.n_time)]
        self.time_strings = [dt.isoformat() + "Z" for dt in self.time_datetimes]

        # Depth: Exactly 24 non-uniform oceanographic levels from 0 to 1000m
        self.depth_levels = np.array([
            0.0, 5.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 75.0, 100.0,
            125.0, 150.0, 175.0, 200.0, 250.0, 300.0, 400.0, 500.0, 600.0,
            700.0, 800.0, 900.0, 950.0, 1000.0
        ], dtype=np.float32)
        self.n_depth = len(self.depth_levels)  # Exactly 24

        # Latitude: 64 points from 0.0°N to 30.0°N
        self.n_lat = 64
        self.latitudes = np.linspace(0.0, 30.0, self.n_lat, dtype=np.float32)

        # Longitude: 96 points from 55.0°E to 100.0°E
        self.n_lon = 96
        self.longitudes = np.linspace(55.0, 100.0, self.n_lon, dtype=np.float32)

    def generate(self) -> xr.Dataset:
        """Generate full 4D dataset using vectorized NumPy operations

        and return as an xarray.Dataset.
        """
        cfg = self.config
        rng = np.random.Generator(np.random.PCG64(cfg.random_seed))

        # 4D Broadcast coordinate grids: (10, 24, 64, 96)
        T_idx = np.arange(self.n_time, dtype=np.float32)[:, None, None, None]
        Z = self.depth_levels[None, :, None, None]
        LAT = self.latitudes[None, None, :, None]
        LON = self.longitudes[None, None, None, :]

        # Approximate metric scaling for horizontal eddy coordinates (deg to relative km)
        cos_lat = np.cos(np.radians(LAT))

        # =====================================================================
        # 1. Mesoscale Eddy Kinematics & Spatial Gaussian Structures
        # =====================================================================
        # Warm Eddy (Anticyclonic) trajectory over time
        x_warm = cfg.warm_eddy_start_lon + cfg.warm_eddy_drift_u * T_idx
        y_warm = cfg.warm_eddy_start_lat + cfg.warm_eddy_drift_v * T_idx
        r_warm_sq = ((LON - x_warm) * cos_lat) ** 2 + (LAT - y_warm) ** 2
        eddy_warm_horiz = np.exp(-r_warm_sq / (2.0 * (cfg.warm_eddy_radius_deg ** 2)))
        eddy_warm_vert = np.exp(-Z / cfg.warm_eddy_depth_scale_m)
        warm_eddy_field = cfg.warm_eddy_amp * eddy_warm_horiz * eddy_warm_vert

        # Cold Eddy (Cyclonic) trajectory over time
        x_cold = cfg.cold_eddy_start_lon + cfg.cold_eddy_drift_u * T_idx
        y_cold = cfg.cold_eddy_start_lat + cfg.cold_eddy_drift_v * T_idx
        r_cold_sq = ((LON - x_cold) * cos_lat) ** 2 + (LAT - y_cold) ** 2
        eddy_cold_horiz = np.exp(-r_cold_sq / (2.0 * (cfg.cold_eddy_radius_deg ** 2)))
        eddy_cold_vert = np.exp(-Z / cfg.cold_eddy_depth_scale_m)
        cold_eddy_field = cfg.cold_eddy_amp * eddy_cold_horiz * eddy_cold_vert

        # =====================================================================
        # 2. Temperature Field [time, depth, lat, lon]
        # =====================================================================
        # Surface horizontal background (equatorial warmth + subtle zonal contrast)
        surface_temp = (
            cfg.surface_temp_base
            - 0.11 * LAT                        # colder toward 30°N
            + 0.03 * (LON - 75.0)               # subtle east-west tilt
            + 0.25 * np.sin(2.0 * np.pi * T_idx / self.n_time) # temporal modulation
        )

        # Vertical stratification with steep thermocline around 120m
        # Thermocline is shifted deeper inside warm eddy and shoals in cold eddy
        local_thermocline_z = cfg.thermocline_depth_m + (warm_eddy_field * 18.0) + (cold_eddy_field * 16.0)
        thermocline_sigmoid = 1.0 / (1.0 + np.exp((Z - local_thermocline_z) / cfg.thermocline_thickness_m))

        # Deep exponential tail to ensure 5-8°C at 1000m
        deep_attenuation = np.exp(-Z / 400.0)
        temp_vertical = cfg.deep_temp + (surface_temp - cfg.deep_temp) * thermocline_sigmoid

        # Deterministic micro-turbulence
        temp_noise = rng.normal(0.0, 0.05, size=(self.n_time, self.n_depth, self.n_lat, self.n_lon)).astype(np.float32)

        temperature = temp_vertical + warm_eddy_field + cold_eddy_field + temp_noise
        temperature = np.clip(temperature, 4.0, 32.5)

        # =====================================================================
        # 3. Salinity Field [time, depth, lat, lon]
        # =====================================================================
        # Regional contrast: High salinity Arabian Sea (west), low salinity Bay of Bengal (east)
        # Normalized zonal coordinate [-1 to 1]
        lon_norm = (LON - 77.5) / 22.5
        salinity_surf_contrast = np.where(
            lon_norm < 0,
            cfg.salinity_west_contrast * np.abs(lon_norm), # Arabian Sea evaporation pool
            cfg.salinity_east_contrast * lon_norm          # Bay of Bengal freshwater pool
        )

        # Subsurface salinity maximum in Arabian Sea (~120m) and surface freshwater lens in east
        subsurface_sal_max = 0.65 * np.exp(-((Z - 120.0) / 75.0) ** 2) * np.maximum(-lon_norm, 0.0)
        surface_fresh_lens = -1.2 * np.exp(-Z / 45.0) * np.maximum(lon_norm, 0.0)

        # Vertical baseline salinity transition
        sal_vert_base = cfg.salinity_base + 0.35 * (1.0 - np.exp(-Z / 250.0))

        # Eddy isohaline displacement
        sal_eddy_effect = 0.22 * (warm_eddy_field / cfg.warm_eddy_amp) - 0.28 * (cold_eddy_field / cfg.cold_eddy_amp)

        sal_noise = rng.normal(0.0, 0.02, size=(self.n_time, self.n_depth, self.n_lat, self.n_lon)).astype(np.float32)

        salinity = sal_vert_base + salinity_surf_contrast + subsurface_sal_max + surface_fresh_lens + sal_eddy_effect + sal_noise
        salinity = np.clip(salinity, 32.0, 37.8)

        # =====================================================================
        # 4. Chlorophyll-a Field [time, depth, lat, lon]
        # =====================================================================
        # Subsurface Chlorophyll Maximum (SCM) centered in the euphotic layer (~55m)
        scm_layer = cfg.chlorophyll_scm_peak * np.exp(
            -((Z - cfg.chlorophyll_scm_depth_m) ** 2) / (2.0 * (cfg.chlorophyll_scm_spread_m ** 2))
        )

        # Upwelling boost inside cyclonic cold eddy (divergent upwelling brings nutrients)
        cold_eddy_upwelling_ratio = -cold_eddy_field / (abs(cfg.cold_eddy_amp) + 1e-5)
        eddy_chl_boost = cfg.chlorophyll_upwelling_boost * cold_eddy_upwelling_ratio * np.exp(-Z / 85.0)

        # Coastal boundary enhancement near western domain (Somali/Oman upwelling proxy)
        coastal_boost = 1.2 * np.exp(-(LON - 55.0) / 4.5) * np.exp(-Z / 60.0)

        # Deep water biological decay (essentially 0 below photic depth > 200m)
        deep_bio_cutoff = np.exp(-((Z / 150.0) ** 3))

        chl_noise = np.abs(rng.normal(0.0, 0.04, size=(self.n_time, self.n_depth, self.n_lat, self.n_lon))).astype(np.float32)

        chlorophyll = (cfg.chlorophyll_background + (scm_layer + eddy_chl_boost + coastal_boost) * deep_bio_cutoff + chl_noise)
        chlorophyll = np.clip(chlorophyll, 0.02, 12.5)

        # =====================================================================
        # 5. Ocean Currents (U, V, W) [time, depth, lat, lon]
        # =====================================================================
        # Vertical attenuation of currents
        decay_current_z = np.exp(-Z / cfg.current_depth_decay_m)

        # Distance vectors from eddy centers
        dx_warm = (LON - x_warm) * cos_lat
        dy_warm = (LAT - y_warm)
        dx_cold = (LON - x_cold) * cos_lat
        dy_cold = (LAT - y_cold)

        # Rotational velocities:
        # Warm core eddy (Anticyclonic in Northern Hemisphere -> Clockwise rotation):
        # Clockwise flow: u = +dy, v = -dx
        warm_rot_scale = 0.55 * cfg.surface_current_scale
        u_warm_rot = +warm_rot_scale * dy_warm * eddy_warm_horiz * decay_current_z
        v_warm_rot = -warm_rot_scale * dx_warm * eddy_warm_horiz * decay_current_z

        # Cold core eddy (Cyclonic in Northern Hemisphere -> Counter-Clockwise rotation):
        # Counter-Clockwise flow: u = -dy, v = +dx
        cold_rot_scale = 0.60 * cfg.surface_current_scale
        u_cold_rot = -cold_rot_scale * dy_cold * eddy_cold_horiz * decay_current_z
        v_cold_rot = +cold_rot_scale * dx_cold * eddy_cold_horiz * decay_current_z

        # Background Indian Ocean basin circulation (monsoon drift)
        u_background = cfg.background_current_u * decay_current_z * (1.0 + 0.15 * np.sin(LAT * 0.2))
        v_background = cfg.background_current_v * decay_current_z * np.cos(LON * 0.1)

        # Velocity noise
        vel_noise_u = rng.normal(0.0, 0.02, size=(self.n_time, self.n_depth, self.n_lat, self.n_lon)).astype(np.float32)
        vel_noise_v = rng.normal(0.0, 0.02, size=(self.n_time, self.n_depth, self.n_lat, self.n_lon)).astype(np.float32)

        u_current = u_background + u_warm_rot + u_cold_rot + vel_noise_u
        v_current = v_background + v_warm_rot + v_cold_rot + vel_noise_v

        u_current = np.clip(u_current, -2.5, 2.5)
        v_current = np.clip(v_current, -2.5, 2.5)

        # Vertical velocity W: Upwelling (W > 0) in cyclonic cold eddy; Downwelling (W < 0) in warm eddy
        # W must vanish at the surface (Z = 0) and at the bottom floor (Z = 1000m)
        w_depth_envelope = (Z / 100.0) * np.exp(-Z / 150.0)
        w_current = (
            cfg.vertical_velocity_scale * (
                + 1.0 * eddy_cold_horiz   # upwelling in cold eddy
                - 0.85 * eddy_warm_horiz  # downwelling in warm eddy
            ) * w_depth_envelope
        )
        w_current = np.clip(w_current, -0.05, 0.05)

        # =====================================================================
        # 6. Construct xarray Dataset with CF-compliant Metadata
        # =====================================================================
        ds = xr.Dataset(
            data_vars={
                "temperature": (
                    ["time", "depth", "latitude", "longitude"],
                    temperature,
                    {
                        "standard_name": "sea_water_temperature",
                        "long_name": "Sea Water Potential Temperature",
                        "units": "degC",
                        "valid_min": float(temperature.min()),
                        "valid_max": float(temperature.max()),
                        "default_palette": "thermal",
                        "scale_type": "linear",
                    }
                ),
                "salinity": (
                    ["time", "depth", "latitude", "longitude"],
                    salinity,
                    {
                        "standard_name": "sea_water_salinity",
                        "long_name": "Sea Water Practical Salinity",
                        "units": "PSU",
                        "valid_min": float(salinity.min()),
                        "valid_max": float(salinity.max()),
                        "default_palette": "haline",
                        "scale_type": "linear",
                    }
                ),
                "chlorophyll": (
                    ["time", "depth", "latitude", "longitude"],
                    chlorophyll,
                    {
                        "standard_name": "mass_concentration_of_chlorophyll_a_in_sea_water",
                        "long_name": "Chlorophyll-a Mass Concentration",
                        "units": "mg/m^3",
                        "valid_min": float(chlorophyll.min()),
                        "valid_max": float(chlorophyll.max()),
                        "default_palette": "algae",
                        "scale_type": "log",
                    }
                ),
                "u_current": (
                    ["time", "depth", "latitude", "longitude"],
                    u_current,
                    {
                        "standard_name": "eastward_sea_water_velocity",
                        "long_name": "Zonal Velocity Component (U - Eastward)",
                        "units": "m/s",
                        "valid_min": float(u_current.min()),
                        "valid_max": float(u_current.max()),
                        "default_palette": "coolwarm",
                        "scale_type": "linear",
                    }
                ),
                "v_current": (
                    ["time", "depth", "latitude", "longitude"],
                    v_current,
                    {
                        "standard_name": "northward_sea_water_velocity",
                        "long_name": "Meridional Velocity Component (V - Northward)",
                        "units": "m/s",
                        "valid_min": float(v_current.min()),
                        "valid_max": float(v_current.max()),
                        "default_palette": "coolwarm",
                        "scale_type": "linear",
                    }
                ),
                "w_current": (
                    ["time", "depth", "latitude", "longitude"],
                    w_current,
                    {
                        "standard_name": "upward_sea_water_velocity",
                        "long_name": "Vertical Velocity Component (W - Upward)",
                        "units": "m/s",
                        "valid_min": float(w_current.min()),
                        "valid_max": float(w_current.max()),
                        "default_palette": "coolwarm",
                        "scale_type": "linear",
                    }
                ),
            },
            coords={
                "time": (
                    ["time"],
                    np.array(self.time_datetimes, dtype="datetime64[ns]"),
                    {"standard_name": "time", "axis": "T"}
                ),
                "depth": (
                    ["depth"],
                    self.depth_levels,
                    {
                        "standard_name": "depth",
                        "units": "meters",
                        "positive": "down",
                        "axis": "Z",
                    }
                ),
                "latitude": (
                    ["latitude"],
                    self.latitudes,
                    {
                        "standard_name": "latitude",
                        "units": "degrees_north",
                        "axis": "Y",
                    }
                ),
                "longitude": (
                    ["longitude"],
                    self.longitudes,
                    {
                        "standard_name": "longitude",
                        "units": "degrees_east",
                        "axis": "X",
                    }
                ),
            },
            attrs={
                "title": f"Synthetic Ocean 4D Dataset - {cfg.name.upper()} Scenario",
                "institution": "Indian National Centre for Ocean Information Services (INCOIS) / SIH 2026 Prototype",
                "source": "Procedural Synthetic Ocean-Data Generator (Vectorized NumPy)",
                "conventions": "CF-1.8, ACDD-1.3",
                "scenario": cfg.name,
                "scenario_description": cfg.description,
                "history": f"Generated {datetime.now(timezone.utc).isoformat()} by synthetic_ocean generator",
            }
        )

        return ds

    def export_netcdf(self, output_filepath: str) -> str:
        """Generate and export the dataset directly to NetCDF-4 format."""
        ds = self.generate()
        ds.to_netcdf(output_filepath, engine="netcdf4")
        return output_filepath
