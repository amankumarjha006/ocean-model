"""Service layer for ocean dataset metadata, caching, slicing, and profile queries."""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import xarray as xr

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
from app.generators.scenarios import get_scenario_config, SCENARIOS
from app.generators.synthetic_ocean import SyntheticOceanGenerator


class DatasetService:
    """Manages synthetic ocean dataset instances, in-memory caching,

    metadata publishing, and spatial/temporal slice extraction.
    """

    _datasets: Dict[str, xr.Dataset] = {}
    _generators: Dict[str, SyntheticOceanGenerator] = {}

    @classmethod
    def get_generator(cls, scenario: str = "normal") -> SyntheticOceanGenerator:
        """Get or create a generator for the requested scenario."""
        sc_key = scenario.lower()
        if sc_key not in cls._generators:
            cfg = get_scenario_config(sc_key)
            cls._generators[sc_key] = SyntheticOceanGenerator(scenario=cfg)
        return cls._generators[sc_key]

    @classmethod
    def get_dataset(cls, scenario: str = "normal") -> xr.Dataset:
        """Get or lazily generate and cache the xarray.Dataset for a scenario."""
        sc_key = scenario.lower()
        if sc_key not in cls._datasets:
            gen = cls.get_generator(sc_key)
            cls._datasets[sc_key] = gen.generate()
        return cls._datasets[sc_key]

    @classmethod
    def get_canonical_dataset(cls, scenario: str = "normal") -> DatasetMetadata:
        """Return canonical DatasetMetadata aligned with the generated xarray dimensions."""
        gen = cls.get_generator(scenario)
        ds = cls.get_dataset(scenario)

        time_vals = gen.time_strings
        depth_vals = [float(d) for d in gen.depth_levels]
        lats = [float(l) for l in gen.latitudes]
        lons = [float(l) for l in gen.longitudes]

        coordinates = CoordinateMetadata(
            time=TimeCoordinate(
                units="ISO-8601",
                calendar="gregorian",
                values=time_vals,
                start=time_vals[0],
                end=time_vals[-1],
                step="6h",
                count=len(time_vals),
            ),
            depth=DepthCoordinate(
                units="meters",
                positive="down",
                standard_name="depth",
                values=depth_vals,
                min_depth=depth_vals[0],
                max_depth=depth_vals[-1],
                count=len(depth_vals),
            ),
            latitude=LatitudeCoordinate(
                units="degrees_north",
                standard_name="latitude",
                min_val=round(lats[0], 2),
                max_val=round(lats[-1], 2),
                step=round(float(lats[1] - lats[0]), 3),
                count=len(lats),
            ),
            longitude=LongitudeCoordinate(
                units="degrees_east",
                standard_name="longitude",
                min_val=round(lons[0], 2),
                max_val=round(lons[-1], 2),
                step=round(float(lons[1] - lons[0]), 3),
                count=len(lons),
            ),
        )

        variables: Dict[str, VariableMetadata] = {}
        for var_name, data_array in ds.data_vars.items():
            attrs = data_array.attrs
            variables[var_name] = VariableMetadata(
                name=var_name,
                display_name=attrs.get("long_name", var_name.replace("_", " ").title()),
                units=attrs.get("units", ""),
                standard_name=attrs.get("standard_name", var_name),
                dimensions=["time", "depth", "latitude", "longitude"],
                description=f"{attrs.get('long_name', var_name)} for {scenario} scenario",
                valid_min=round(float(data_array.min()), 3),
                valid_max=round(float(data_array.max()), 3),
                default_palette=attrs.get("default_palette", "thermal"),
                scale_type=attrs.get("scale_type", "linear"),
            )

        observations: List[ObservationMetadata] = [
            ObservationMetadata(
                id="argo_2903334",
                platform_type="argo",
                platform_name="INCOIS Argo Profiling Float #2903334 (Arabian Sea)",
                institution="INCOIS / Argo India",
                variables_measured=["temperature", "salinity"],
                time_range=[time_vals[0], time_vals[-1]],
                depth_range_m=[2.0, 1000.0],
                spatial_extent=[66.0, 14.0, 68.5, 16.5],
                profile_count=18,
                status="active",
            ),
            ObservationMetadata(
                id="argo_2903335",
                platform_type="argo",
                platform_name="INCOIS Argo Profiling Float #2903335 (Bay of Bengal)",
                institution="INCOIS / Argo India",
                variables_measured=["temperature", "salinity", "chlorophyll"],
                time_range=[time_vals[0], time_vals[-1]],
                depth_range_m=[2.0, 1000.0],
                spatial_extent=[86.0, 11.5, 88.5, 14.0],
                profile_count=14,
                status="active",
            ),
            ObservationMetadata(
                id="glider_sg601",
                platform_type="glider",
                platform_name="Deep Ocean Mission Autonomous Glider SG-601",
                institution="NIOT / INCOIS",
                variables_measured=["temperature", "salinity", "chlorophyll"],
                time_range=[time_vals[0], time_vals[-1]],
                depth_range_m=[0.0, 1000.0],
                spatial_extent=[70.0, 8.0, 73.5, 11.0],
                profile_count=92,
                status="active",
            ),
        ]

        return DatasetMetadata(
            id=f"incois_synthetic_4d_{scenario}",
            title=f"INCOIS Indian Ocean 4D Synthetic Ocean Model ({scenario.upper()})",
            institution="Indian National Centre for Ocean Information Services (INCOIS), MoES",
            conventions="CF-1.8, ACDD-1.3",
            source_model="Procedural Synthetic Ocean-Data Generator (Vectorized NumPy)",
            summary=(
                "Procedurally generated 4D ocean domain (10 time × 24 depth × 64 lat × 96 lon) "
                "representing physical oceanographic phenomena including thermocline stratification, "
                "mesoscale eddies, subsurface chlorophyll maximum, and correlated current velocities."
            ),
            spatial_bounds=SpatialBounds(
                min_latitude=float(lats[0]),
                max_latitude=float(lats[-1]),
                min_longitude=float(lons[0]),
                max_longitude=float(lons[-1]),
            ),
            temporal_bounds=TemporalBounds(
                start_time=time_vals[0],
                end_time=time_vals[-1],
                time_steps_count=len(time_vals),
            ),
            coordinates=coordinates,
            variables=variables,
            observations=observations,
            version="2.0.0-synthetic",
        )

    @classmethod
    def get_slice(
        cls,
        variable: str,
        time_index: int = 0,
        depth_index: int = 0,
        scenario: str = "normal",
    ) -> Dict[str, Any]:
        """Extract a 2D horizontal slice [latitude, longitude] for a specific time and depth."""
        ds = cls.get_dataset(scenario)
        gen = cls.get_generator(scenario)
        t_idx = max(0, min(time_index, gen.n_time - 1))
        z_idx = max(0, min(depth_index, gen.n_depth - 1))

        # Handle derived current_speed virtual variable
        if variable == "current_speed":
            u_slice = ds["u_current"].isel(time=t_idx, depth=z_idx).values
            v_slice = ds["v_current"].isel(time=t_idx, depth=z_idx).values
            slice_vals = np.hypot(u_slice, v_slice)
            display_name = "Horizontal Current Speed"
            units = "m/s"
        elif variable in ds.data_vars:
            slice_da = ds[variable].isel(time=t_idx, depth=z_idx)
            slice_vals = slice_da.values  # shape: (64, 96)
            display_name = slice_da.attrs.get("long_name", variable)
            units = slice_da.attrs.get("units", "")
        else:
            valid_vars = list(ds.data_vars.keys()) + ["current_speed"]
            raise ValueError(f"Invalid variable '{variable}'. Available: {valid_vars}")

        return {
            "variable": variable,
            "display_name": display_name,
            "units": units,
            "scenario": scenario,
            "time_index": t_idx,
            "timestamp": gen.time_strings[t_idx],
            "depth_index": z_idx,
            "depth_m": float(gen.depth_levels[z_idx]),
            "shape": list(slice_vals.shape),  # [64, 96]
            "latitudes": [round(float(l), 3) for l in gen.latitudes],
            "longitudes": [round(float(l), 3) for l in gen.longitudes],
            "min": float(np.min(slice_vals)),
            "max": float(np.max(slice_vals)),
            "mean": float(np.mean(slice_vals)),
            "data": np.round(slice_vals, 3).tolist(),  # 2D nested list
        }

    @classmethod
    def get_volume(
        cls,
        variable: str = "temperature",
        time_index: int = 0,
        scenario: str = "normal",
        num_depths: int = 12,
    ) -> Dict[str, Any]:
        """Extract a 3D sub-volume [depth, latitude, longitude] for layered volume or isosurfaces."""
        ds = cls.get_dataset(scenario)
        gen = cls.get_generator(scenario)
        t_idx = max(0, min(time_index, gen.n_time - 1))

        # Select depth indices based on requested num_depths
        total_depths = gen.n_depth  # 24
        num_depths = max(4, min(num_depths, total_depths))
        depth_indices = np.linspace(0, total_depths - 1, num_depths, dtype=int)
        selected_depths = [float(gen.depth_levels[i]) for i in depth_indices]

        if variable == "current_speed":
            u_vol = ds["u_current"].isel(time=t_idx, depth=depth_indices).values
            v_vol = ds["v_current"].isel(time=t_idx, depth=depth_indices).values
            vol_vals = np.hypot(u_vol, v_vol)
            display_name = "Horizontal Current Speed"
            units = "m/s"
        elif variable in ds.data_vars:
            vol_da = ds[variable].isel(time=t_idx, depth=depth_indices)
            vol_vals = vol_da.values  # shape: (num_depths, 64, 96)
            display_name = vol_da.attrs.get("long_name", variable)
            units = vol_da.attrs.get("units", "")
        else:
            valid_vars = list(ds.data_vars.keys()) + ["current_speed"]
            raise ValueError(f"Invalid variable '{variable}'. Available: {valid_vars}")

        return {
            "variable": variable,
            "display_name": display_name,
            "units": units,
            "scenario": scenario,
            "time_index": t_idx,
            "timestamp": gen.time_strings[t_idx],
            "num_depths": num_depths,
            "depth_indices": depth_indices.tolist(),
            "depths": selected_depths,
            "shape": list(vol_vals.shape),  # [num_depths, 64, 96]
            "latitudes": [round(float(l), 3) for l in gen.latitudes],
            "longitudes": [round(float(l), 3) for l in gen.longitudes],
            "min": float(np.min(vol_vals)),
            "max": float(np.max(vol_vals)),
            "mean": float(np.mean(vol_vals)),
            "data": np.round(vol_vals, 3).tolist(),  # 3D nested list [z, y, x]
        }

    @classmethod
    def get_profile(
        cls,
        latitude_index: int,
        longitude_index: int,
        time_index: int = 0,
        variable: str = "temperature",
        scenario: str = "normal",
    ) -> Dict[str, Any]:
        """Extract a 1D vertical column profile across all depth levels."""
        ds = cls.get_dataset(scenario)

        if variable not in ds.data_vars:
            valid_vars = list(ds.data_vars.keys())
            raise ValueError(f"Invalid variable '{variable}'. Available: {valid_vars}")

        gen = cls.get_generator(scenario)
        t_idx = max(0, min(time_index, gen.n_time - 1))
        lat_idx = max(0, min(latitude_index, gen.n_lat - 1))
        lon_idx = max(0, min(longitude_index, gen.n_lon - 1))

        profile_da = ds[variable].isel(time=t_idx, latitude=lat_idx, longitude=lon_idx)
        profile_vals = profile_da.values  # shape: (24,)

        return {
            "variable": variable,
            "display_name": profile_da.attrs.get("long_name", variable),
            "units": profile_da.attrs.get("units", ""),
            "scenario": scenario,
            "time_index": t_idx,
            "timestamp": gen.time_strings[t_idx],
            "latitude_index": lat_idx,
            "latitude": float(gen.latitudes[lat_idx]),
            "longitude_index": lon_idx,
            "longitude": float(gen.longitudes[lon_idx]),
            "depths": [float(d) for d in gen.depth_levels],
            "values": [round(float(v), 3) for v in profile_vals],
            "min": float(np.min(profile_vals)),
            "max": float(np.max(profile_vals)),
        }

    @classmethod
    def export_netcdf(cls, output_filepath: str, scenario: str = "normal") -> str:
        """Export the scenario dataset to NetCDF-4."""
        ds = cls.get_dataset(scenario)
        ds.to_netcdf(output_filepath, engine="netcdf4")
        return output_filepath
