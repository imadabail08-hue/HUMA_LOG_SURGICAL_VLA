from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

QualityStatus = Literal["validated", "review_recommended", "alert"]
BoxSource = Literal["ai", "manual"]
BatchStatus = Literal["idle", "processing", "completed", "error"]

class QualityAnomaly(BaseModel):
    code: str
    message: str
    severity: Literal["low", "medium", "high"]
    box_id: Optional[str] = None

class BoundingBox(BaseModel):
    id: str
    label: str
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    # Normalized coordinates (0.0 to 1.0)
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    width: float = Field(ge=0.0, le=1.0)
    height: float = Field(ge=0.0, le=1.0)
    verified: bool = False
    source: BoxSource = "ai"

class ImageAnnotation(BaseModel):
    image_id: str
    filename: str
    width: int
    height: int
    image_url: str
    boxes: List[BoundingBox] = []
    quality_status: QualityStatus = "validated"
    quality_score: float = Field(ge=0.0, le=100.0, default=100.0)
    anomalies: List[QualityAnomaly] = []
    is_reviewed: bool = False

class DatasetSummary(BaseModel):
    id: str
    name: str
    total_images: int
    annotated_count: int
    validated_count: int  # Green
    review_count: int     # Orange
    alert_count: int      # Red
    average_confidence: float
    classes: List[str] = []
    created_at: str

class BatchInferenceRequest(BaseModel):
    dataset_id: str
    model_name: str = "yolov8n.pt"
    confidence_threshold: float = Field(default=0.25, ge=0.05, le=0.95)
    override_existing: bool = False

class BatchProgress(BaseModel):
    dataset_id: str
    status: BatchStatus = "idle"
    current: int = 0
    total: int = 0
    percent: float = 0.0
    current_image: Optional[str] = None
    error_message: Optional[str] = None

class UpdateBoxRequest(BaseModel):
    boxes: List[BoundingBox]
    mark_reviewed: bool = True
