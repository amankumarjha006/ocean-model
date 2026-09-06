"""Command-line utility for generating and exporting synthetic ocean NetCDF datasets."""

import argparse
import os
from app.generators.synthetic_ocean import SyntheticOceanGenerator
from app.generators.scenarios import get_scenario_config, SCENARIOS


def main():
    parser = argparse.ArgumentParser(description="Generate and export synthetic ocean NetCDF dataset")
    parser.add_argument(
        "--scenario",
        default="normal",
        choices=list(SCENARIOS.keys()),
        help="Ocean scenario name (normal, warm_eddy, cold_eddy, strong_currents)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Target output .nc filepath",
    )

    args = parser.parse_args()

    cfg = get_scenario_config(args.scenario)
    gen = SyntheticOceanGenerator(scenario=cfg)

    default_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
    os.makedirs(default_dir, exist_ok=True)

    output_path = args.output or os.path.join(default_dir, f"synthetic_ocean_{args.scenario}.nc")

    print(f"Generating synthetic ocean dataset for scenario: '{args.scenario}'...")
    gen.export_netcdf(output_path)
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Successfully exported CF-compliant NetCDF-4 to: {output_path} ({file_size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
