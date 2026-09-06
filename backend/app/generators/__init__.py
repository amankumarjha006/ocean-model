"""Generators package for synthetic ocean data fields."""

from app.generators.scenarios import ScenarioConfig, get_scenario_config, SCENARIOS
from app.generators.synthetic_ocean import SyntheticOceanGenerator

__all__ = [
    "ScenarioConfig",
    "get_scenario_config",
    "SCENARIOS",
    "SyntheticOceanGenerator",
]
