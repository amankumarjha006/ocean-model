"""Scenario definitions and parameter configurations for synthetic ocean generation."""

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class ScenarioConfig:
    """Configuration parameters defining a specific synthetic ocean scenario."""
    name: str
    description: str

    # Temperature parameters (°C)
    surface_temp_base: float = 28.5
    deep_temp: float = 8.0
    thermocline_depth_m: float = 120.0
    thermocline_thickness_m: float = 60.0

    # Warm Eddy (Anticyclonic)
    warm_eddy_amp: float = 2.4        # °C temperature elevation
    warm_eddy_radius_deg: float = 3.2  # radius in degrees
    warm_eddy_depth_scale_m: float = 220.0
    warm_eddy_start_lon: float = 68.0
    warm_eddy_start_lat: float = 15.5
    warm_eddy_drift_u: float = -0.3   # degrees lon drift per time step
    warm_eddy_drift_v: float = 0.05   # degrees lat drift per time step

    # Cold Eddy (Cyclonic)
    cold_eddy_amp: float = -2.8       # °C temperature depression
    cold_eddy_radius_deg: float = 3.6  # radius in degrees
    cold_eddy_depth_scale_m: float = 180.0
    cold_eddy_start_lon: float = 87.0
    cold_eddy_start_lat: float = 14.0
    cold_eddy_drift_u: float = -0.25  # degrees lon drift per time step
    cold_eddy_drift_v: float = -0.08  # degrees lat drift per time step

    # Currents (m/s)
    surface_current_scale: float = 1.0     # scalar multiplier on baseline velocities
    current_depth_decay_m: float = 180.0   # e-folding scale depth
    background_current_u: float = 0.35     # zonal drift
    background_current_v: float = 0.15     # meridional drift
    vertical_velocity_scale: float = 0.015 # m/s upwelling/downwelling

    # Salinity parameters (PSU)
    salinity_base: float = 35.0
    salinity_west_contrast: float = 1.6    # higher salinity in Arabian Sea
    salinity_east_contrast: float = -1.8   # lower salinity in Bay of Bengal
    salinity_depth_gradient: float = 0.8

    # Chlorophyll parameters (mg/m³)
    chlorophyll_background: float = 0.12
    chlorophyll_scm_peak: float = 1.85     # subsurface maximum peak
    chlorophyll_scm_depth_m: float = 55.0  # depth of peak
    chlorophyll_scm_spread_m: float = 28.0 # vertical thickness of SCM
    chlorophyll_upwelling_boost: float = 2.2 # biological enhancement in cyclonic eddy

    # Reproducibility seed
    random_seed: int = 42


SCENARIOS: Dict[str, ScenarioConfig] = {
    "normal": ScenarioConfig(
        name="normal",
        description="Standard baseline with balanced warm anticyclonic and cold cyclonic mesoscale eddies.",
    ),
    "warm_eddy": ScenarioConfig(
        name="warm_eddy",
        description="Intensified warm-core anticyclonic eddy with enhanced downward thermocline deflection and clockwise current circulation.",
        warm_eddy_amp=4.2,
        warm_eddy_radius_deg=4.2,
        warm_eddy_depth_scale_m=320.0,
        surface_current_scale=1.35,
    ),
    "cold_eddy": ScenarioConfig(
        name="cold_eddy",
        description="Intensified cold-core cyclonic eddy with strong localized upwelling and elevated subsurface chlorophyll bloom.",
        cold_eddy_amp=-4.5,
        cold_eddy_radius_deg=4.5,
        cold_eddy_depth_scale_m=280.0,
        chlorophyll_upwelling_boost=4.5,
        vertical_velocity_scale=0.035,
        surface_current_scale=1.3,
    ),
    "strong_currents": ScenarioConfig(
        name="strong_currents",
        description="Intense energetic surface circulation with strong shears, accelerated boundary flows, and rotational eddies.",
        surface_current_scale=2.2,
        background_current_u=0.8,
        background_current_v=0.45,
        vertical_velocity_scale=0.04,
        warm_eddy_amp=3.0,
        cold_eddy_amp=-3.2,
    ),
}


def get_scenario_config(scenario_name: str = "normal") -> ScenarioConfig:
    """Retrieve scenario configuration or return default 'normal' scenario."""
    return SCENARIOS.get(scenario_name.lower(), SCENARIOS["normal"])
