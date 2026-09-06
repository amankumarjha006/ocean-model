# 3D Ocean Data Visualization Platform (INCOIS SIH 2026 Prototype)

A browser-native scientific 3D visualization platform built for exploring multi-dimensional hydrodynamic and biogeochemical ocean models alongside in-situ observational networks (Argo, Gliders), inspired by the INCOIS problem statement for Smart India Hackathon 2026.

![Dashboard Preview](docs/assets/dashboard_preview.png)

## Core Capabilities (Phase 1 Foundation)

- **Canonical 4D Ocean Domain Model**: Structured dimensions along $\text{time} \times \text{depth} \times \text{latitude} \times \text{longitude}$.
- **6 Physical & Biogeochemical Variables**: Sea water temperature, practical salinity, chlorophyll-a, zonal current ($u$), meridional current ($v$), and vertical velocity ($w$).
- **Scientific 3D Viewport**: Built on Three.js & React Three Fiber with OrbitControls, depth slice indicator, coordinate bounding frame, and in-situ platform markers.
- **Generic Metadata-Driven Architecture**: Fully generic variable registry with automatic colormap, unit, range, and scale resolution without variable-specific hardcoding.
- **FastAPI REST Backend**: Pydantic v2 schemas adhering to Climate & Forecast (CF-1.8) conventions, with `/api/health` and `/api/dataset` endpoints.
- **4D Temporal Scrubber & Playback**: Timeline controls with continuous playback, step forward/backward, and UTC simulation time indicator.
- **Scientific HUD & Inspector**: Floating colorbars, depth readouts, axis legends, and observation metadata inspector.

---

## Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js v18+ (tested on Node v22)
- npm v9+

### 1. Backend Setup & Startup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (FastAPI, Uvicorn, Pydantic, NumPy, xarray, pytest, httpx)
pip install -r requirements.txt

# Run unit and integration tests
python -m pytest

# Start the FastAPI server on http://127.0.0.1:8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Dataset metadata: [http://127.0.0.1:8000/api/dataset](http://127.0.0.1:8000/api/dataset)
- Variables catalog: [http://127.0.0.1:8000/api/dataset/variables](http://127.0.0.1:8000/api/dataset/variables)
- 4D Coordinates: [http://127.0.0.1:8000/api/dataset/coordinates](http://127.0.0.1:8000/api/dataset/coordinates)
- Scenarios list: [http://127.0.0.1:8000/api/dataset/scenarios](http://127.0.0.1:8000/api/dataset/scenarios)
- 2D Horizontal Slice: `GET /api/data/slice?variable=temperature&time_index=0&depth_index=0`
- 1D Vertical Profile: `GET /api/data/profile?latitude_index=32&longitude_index=48&time_index=0`

### Synthetic Ocean CLI Utilities

```bash
# Run physical validation and generate sanity check plots (in docs/assets/)
python -m app.generators.sanity_check

# Export CF-compliant NetCDF-4 dataset for any scenario
python -m app.generators.export_cli --scenario normal
python -m app.generators.export_cli --scenario warm_eddy
python -m app.generators.export_cli --scenario cold_eddy
python -m app.generators.export_cli --scenario strong_currents
```

### 2. Frontend Setup & Startup

```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Build production bundle / verify TypeScript
npm run build

# Start Vite development server on http://127.0.0.1:5173
npm run dev
```

Open your browser at:
**[http://127.0.0.1:5173](http://127.0.0.1:5173)**

---

## Project Structure

```text
ocean-model/
├── backend/
│   ├── app/
│   │   ├── api/              # Health and dataset API routes
│   │   ├── core/             # Configuration settings
│   │   ├── schemas/          # Pydantic domain models (coordinates, variables, dataset)
│   │   ├── services/         # DatasetService providing canonical 4D metadata
│   │   ├── tests/            # Pytest test suite
│   │   └── main.py           # FastAPI entrypoint
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/       # UI layout, controls, and 3D visualization viewport
│   │   ├── features/         # Generic variable configuration & observation types
│   │   ├── hooks/            # useDataset custom hook
│   │   ├── services/         # API HTTP client
│   │   ├── store/            # Zustand global state store
│   │   ├── types/            # TypeScript interfaces matching backend schemas
│   │   ├── utils/            # Scientific colormaps (thermal, haline, algae, coolwarm, speed)
│   │   ├── App.tsx
│   │   └── index.css         # Deep ocean dark theme design system
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── data/
│   ├── sample_metadata.json  # Static canonical dataset export
│   └── README.md
└── docs/
    ├── architecture.md       # Architectural specifications
    └── data-model.md         # Canonical 4D domain model details
```

---

## Testing

### Backend Tests
```bash
cd backend
python -m pytest -v
```

Tests cover:
- Health check status code and payload verification (`test_health.py`)
- Dataset metadata structure, coordinates, 6 canonical variables, and in-situ platforms (`test_dataset.py`)
- Pydantic schema validation, out-of-bounds rejection, and positive-down depth convention (`test_schemas.py`)

### Frontend Verification
```bash
cd frontend
npm run build
```
Validates full TypeScript typing, module resolution, and asset bundling.
