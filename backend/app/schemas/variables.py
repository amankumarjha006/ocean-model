"""Generic variable metadata schemas for CF-compliant ocean variables."""

from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class VariableMetadata(BaseModel):
    """Canonical metadata for any 4D ocean variable (temperature, salinity, etc.)."""
    name: str = Field(..., description="Unique variable identifier (e.g. 'temperature', 'salinity')")
    display_name: str = Field(..., description="Human-readable title (e.g. 'Sea Water Temperature')")
    units: str = Field(..., description="Scientific units (e.g. 'degC', 'PSU', 'mg/m^3', 'm/s')")
    standard_name: str = Field(..., description="CF-convention standard name")
    dimensions: List[str] = Field(
        default=["time", "depth", "latitude", "longitude"],
        description="Ordered list of dimension names matching numerical tensor layout"
    )
    description: str = Field(..., description="Scientific or operational description of the field")
    valid_min: Optional[float] = Field(None, description="Expected minimum valid value")
    valid_max: Optional[float] = Field(None, description="Expected maximum valid value")
    default_palette: str = Field(default="thermal", description="Recommended colormap palette")
    scale_type: str = Field(default="linear", description="Recommended scale ('linear' or 'log')")
    fill_value: Optional[float] = Field(default=-9999.0, description="Fill/missing value marker")
