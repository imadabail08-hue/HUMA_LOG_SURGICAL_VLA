import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from ..services.dataset_service import DatasetService
from ..models.schemas import DatasetSummary, ImageAnnotation, UpdateBoxRequest
from ..config import DATASETS_DIR

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

@router.post("/upload-zip", response_model=DatasetSummary)
async def upload_zip_dataset(
    file: UploadFile = File(...),
    dataset_name: Optional[str] = Form(None)
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Seuls les fichiers .zip sont acceptés")

    name = dataset_name or Path(file.filename).stem
    temp_zip_path = DATASETS_DIR / f"temp_{file.filename}"

    with open(temp_zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        dataset_id = DatasetService.create_dataset_from_zip(temp_zip_path, name)
    finally:
        if temp_zip_path.exists():
            temp_zip_path.unlink()

    summary = DatasetService.get_summary(dataset_id)
    return summary

@router.post("/upload-images", response_model=DatasetSummary)
async def upload_images_dataset(
    files: List[UploadFile] = File(...),
    dataset_name: Optional[str] = Form("Lot d'images")
):
    file_tuples = []
    for f in files:
        content = await f.read()
        file_tuples.append((f.filename, content))

    dataset_id = DatasetService.create_dataset_from_files(file_tuples, dataset_name)
    summary = DatasetService.get_summary(dataset_id)
    return summary

@router.get("", response_model=List[DatasetSummary])
def list_datasets():
    return DatasetService.list_datasets()

@router.get("/{dataset_id}", response_model=DatasetSummary)
def get_dataset(dataset_id: str):
    summary = DatasetService.get_summary(dataset_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    return summary

@router.get("/{dataset_id}/images", response_model=List[ImageAnnotation])
def get_dataset_images(
    dataset_id: str,
    status_filter: Optional[str] = Query(None, description="Filtrer: validated, review_recommended, alert")
):
    annotations = DatasetService.load_annotations(dataset_id)
    if not annotations:
        # If not annotated yet, return unannotated image stubs
        image_paths = DatasetService.list_image_paths(dataset_id)
        return [
            ImageAnnotation(
                image_id=p.stem,
                filename=p.name,
                width=0,
                height=0,
                image_url=f"/api/datasets/{dataset_id}/raw/{p.name}",
                boxes=[],
                quality_status="alert",
                quality_score=0.0,
                anomalies=[{
                    "code": "NOT_ANNOTATED",
                    "message": "Image non encore annotée",
                    "severity": "medium"
                }]
            )
            for p in image_paths
        ]

    if status_filter:
        annotations = [a for a in annotations if a.quality_status == status_filter]

    # Sort annotations: 'alert' first, then 'review_recommended', then 'validated'
    priority_order = {"alert": 0, "review_recommended": 1, "validated": 2}
    annotations.sort(key=lambda a: priority_order.get(a.quality_status, 3))
    return annotations

@router.get("/{dataset_id}/raw/{filename}")
def get_raw_image(dataset_id: str, filename: str):
    img_path = DatasetService.get_images_dir(dataset_id) / filename
    if not img_path.exists():
        raise HTTPException(status_code=404, detail="Image non trouvée")
    return FileResponse(img_path)

@router.put("/{dataset_id}/images/{image_id}/boxes", response_model=ImageAnnotation)
def update_image_boxes(
    dataset_id: str,
    image_id: str,
    request: UpdateBoxRequest
):
    updated = DatasetService.update_single_image_boxes(
        dataset_id=dataset_id,
        image_id=image_id,
        boxes=request.boxes,
        mark_reviewed=request.mark_reviewed
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Image non trouvée dans le dataset")
    return updated
