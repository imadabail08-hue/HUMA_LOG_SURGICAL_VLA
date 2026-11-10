import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DATASETS_DIR = STORAGE_DIR / "datasets"
EXPORTS_DIR = STORAGE_DIR / "exports"
MODELS_DIR = BASE_DIR / "models"

# Ensure runtime directories exist
DATASETS_DIR.mkdir(parents=True, exist_ok=True)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Quality Control Thresholds
CONF_HIGH = 0.80     # Green: high confidence, verified automatically
CONF_LOW = 0.45      # Orange: medium confidence / human review recommended; < 0.45 = Red Alert
MIN_BOX_AREA_RATIO = 0.0005  # Box covering less than 0.05% of image is flagged as tiny anomaly
MAX_BOX_AREA_RATIO = 0.98    # Box covering > 98% of image is flagged as oversized anomaly
IOU_DUPLICATE_THRESH = 0.70  # Overlapping boxes threshold

# Supported image extensions
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}

# Default classes for surgical instruments (matching the existing project nomenclature)
SURGICAL_CLASSES = [
    "pince_bipolar",
    "bistouri_scalpel",
    "ciseaux_metzenbaum",
    "porte_aiguille",
    "pince_dissection",
    "ecarteur_farabeuf",
    "pince_kocher",
    "canule_aspiration"
]
