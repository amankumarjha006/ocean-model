"""Visual and physical sanity check utility for the synthetic ocean dataset."""

import os
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np

from app.generators.synthetic_ocean import SyntheticOceanGenerator
from app.generators.scenarios import get_scenario_config


def run_sanity_checks():
    """Execute physical sanity checks and generate visual confirmation plots."""
    print("=" * 60)
    print("RUNNING OCEAN DATA GENERATOR SANITY CHECKS")
    print("=" * 60)

    gen = SyntheticOceanGenerator(scenario=get_scenario_config("normal"))
    ds = gen.generate()

    # 1. Dimension validation
    assert ds.sizes["time"] == 10, f"Expected 10 times, got {ds.sizes['time']}"
    assert ds.sizes["depth"] == 24, f"Expected 24 depths, got {ds.sizes['depth']}"
    assert ds.sizes["latitude"] == 64, f"Expected 64 lats, got {ds.sizes['latitude']}"
    assert ds.sizes["longitude"] == 96, f"Expected 96 lons, got {ds.sizes['longitude']}"
    print("[PASS] Coordinate Dimensions: (10 time × 24 depth × 64 lat × 96 lon)")

    # 2. NaN / Inf validation
    for var_name in ds.data_vars:
        arr = ds[var_name].values
        assert not np.isnan(arr).any(), f"NaN detected in {var_name}"
        assert not np.isinf(arr).any(), f"Inf detected in {var_name}"
    print("[PASS] Numerical Integrity: Zero NaNs or Infs across all 6 variables")

    # 3. Vertical temperature stratification check
    surf_temp = float(ds["temperature"].isel(time=0, depth=0).mean())
    deep_temp = float(ds["temperature"].isel(time=0, depth=-1).mean())
    assert surf_temp > deep_temp + 10.0, f"Expected surface ({surf_temp:.1f}°C) >> deep ({deep_temp:.1f}°C)"
    print(f"[PASS] Vertical Stratification: Surface Mean = {surf_temp:.2f}°C, Deep Mean (1000m) = {deep_temp:.2f}°C")

    # 4. Chlorophyll SCM check (peak concentration in upper 100m)
    chl_mean_profile = ds["chlorophyll"].isel(time=0).mean(dim=["latitude", "longitude"]).values
    max_chl_depth_idx = int(np.argmax(chl_mean_profile))
    max_chl_depth_m = float(ds["depth"].values[max_chl_depth_idx])
    assert max_chl_depth_m <= 100.0, f"SCM peak at {max_chl_depth_m}m, expected <= 100m"
    print(f"[PASS] Subsurface Chlorophyll Max (SCM): Peak at {max_chl_depth_m:.1f}m ({chl_mean_profile[max_chl_depth_idx]:.2f} mg/m³)")

    # 5. Currents attenuation with depth
    surf_speed = np.hypot(ds["u_current"].isel(time=0, depth=0).values, ds["v_current"].isel(time=0, depth=0).values).mean()
    deep_speed = np.hypot(ds["u_current"].isel(time=0, depth=-1).values, ds["v_current"].isel(time=0, depth=-1).values).mean()
    assert surf_speed > deep_speed * 3.0, f"Currents should attenuate: surf={surf_speed:.2f}, deep={deep_speed:.2f}"
    print(f"[PASS] Velocity Attenuation: Surface Speed = {surf_speed:.2f} m/s, Deep Speed = {deep_speed:.3f} m/s")

    # 6. Generate Sanity Check Visualizations
    assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs", "assets"))
    os.makedirs(assets_dir, exist_ok=True)

    # Plot 1: 2D Horizontal Sea Surface Temperature + Currents
    fig, ax = plt.subplots(figsize=(10, 6), dpi=120)
    lons = ds["longitude"].values
    lats = ds["latitude"].values
    temp_surf = ds["temperature"].isel(time=0, depth=0).values
    u_surf = ds["u_current"].isel(time=0, depth=0).values
    v_surf = ds["v_current"].isel(time=0, depth=0).values

    mesh = ax.contourf(lons, lats, temp_surf, levels=25, cmap="inferno")
    cbar = plt.colorbar(mesh, ax=ax, label="Temperature (°C)")

    # Downsample quiver for clean visualization
    step_x, step_y = 4, 3
    ax.quiver(
        lons[::step_x],
        lats[::step_y],
        u_surf[::step_y, ::step_x],
        v_surf[::step_y, ::step_x],
        color="cyan",
        scale=18,
        width=0.003,
        alpha=0.85,
    )
    ax.set_title("Synthetic 2D Surface Temperature & Current Vectors (Normal Scenario)", fontsize=12, fontweight="bold")
    ax.set_xlabel("Longitude (°E)")
    ax.set_ylabel("Latitude (°N)")
    ax.grid(True, linestyle="--", alpha=0.3)

    slice_path = os.path.join(assets_dir, "sanity_check_slice.png")
    plt.tight_layout()
    plt.savefig(slice_path)
    plt.close()
    print(f"[SAVED] 2D Horizontal Slice Plot: {slice_path}")

    # Plot 2: 1D Vertical Profiles (Temperature & Chlorophyll)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 5), dpi=120, sharey=True)
    depths = ds["depth"].values
    temp_profile = ds["temperature"].isel(time=0, latitude=32, longitude=48).values
    chl_profile = ds["chlorophyll"].isel(time=0, latitude=32, longitude=48).values

    ax1.plot(temp_profile, depths, color="orangered", linewidth=2.2, label="Temperature")
    ax1.set_xlabel("Temperature (°C)")
    ax1.set_ylabel("Depth (m)")
    ax1.invert_yaxis()
    ax1.set_title("Vertical Temperature Stratification")
    ax1.grid(True, linestyle="--", alpha=0.4)

    ax2.plot(chl_profile, depths, color="forestgreen", linewidth=2.2, label="Chlorophyll-a")
    ax2.set_xlabel("Chlorophyll-a (mg/m³)")
    ax2.set_title("Subsurface Chlorophyll Max (SCM)")
    ax2.grid(True, linestyle="--", alpha=0.4)

    profile_path = os.path.join(assets_dir, "sanity_check_profile.png")
    plt.tight_layout()
    plt.savefig(profile_path)
    plt.close()
    print(f"[SAVED] 1D Vertical Profile Plot: {profile_path}")

    print("=" * 60)
    print("ALL SANITY CHECKS COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    run_sanity_checks()
