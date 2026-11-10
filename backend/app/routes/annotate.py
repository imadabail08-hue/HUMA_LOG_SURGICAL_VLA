from typing import Dict
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..models.schemas import BatchInferenceRequest, BatchProgress
from ..services.dataset_service import DatasetService
from ..services.ai_engine import AIEngine

router = APIRouter(prefix="/api/annotate", tags=["annotate"])

# In-memory progress tracking for active batches
active_batches: Dict[str, BatchProgress] = {}

def run_batch_inference_task(dataset_id: str, model_name: str, conf_threshold: float):
    progress = active_batches.get(dataset_id)
    if not progress:
        return

    try:
        progress.status = "processing"
        image_paths = DatasetService.list_image_paths(dataset_id)
        total = len(image_paths)
        progress.total = total

        if total == 0:
            progress.status = "completed"
            progress.percent = 100.0
            return

        def update_progress(current: int, tot: int, filename: str):
            progress.current = current
            progress.total = tot
            progress.current_image = filename
            progress.percent = round((current / tot) * 100, 1)

        def url_builder(p: Path) -> str:
            return f"/api/datasets/{dataset_id}/raw/{p.name}"

        ai_engine = AIEngine(model_name=model_name)
        annotations = ai_engine.annotate_batch(
            image_paths=image_paths,
            url_builder=url_builder,
            conf_threshold=conf_threshold,
            progress_callback=update_progress
        )

        DatasetService.save_annotations(dataset_id, annotations)
        progress.status = "completed"
        progress.percent = 100.0
    except Exception as e:
        progress.status = "error"
        progress.error_message = str(e)

@router.post("/batch", response_model=BatchProgress)
def start_batch_annotation(
    request: BatchInferenceRequest,
    background_tasks: BackgroundTasks
):
    dataset_id = request.dataset_id
    summary = DatasetService.get_summary(dataset_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")

    # If already processing, return current status
    if dataset_id in active_batches and active_batches[dataset_id].status == "processing":
        return active_batches[dataset_id]

    progress = BatchProgress(
        dataset_id=dataset_id,
        status="processing",
        current=0,
        total=summary.total_images,
        percent=0.0
    )
    active_batches[dataset_id] = progress

    background_tasks.add_task(
        run_batch_inference_task,
        dataset_id,
        request.model_name,
        request.confidence_threshold
    )

    return progress

@router.get("/progress/{dataset_id}", response_model=BatchProgress)
def get_batch_progress(dataset_id: str):
    if dataset_id in active_batches:
        return active_batches[dataset_id]
    
    # Check if dataset has existing annotations
    summary = DatasetService.get_summary(dataset_id)
    if summary and summary.annotated_count > 0:
        return BatchProgress(
            dataset_id=dataset_id,
            status="completed",
            current=summary.annotated_count,
            total=summary.total_images,
            percent=100.0
        )

    return BatchProgress(
        dataset_id=dataset_id,
        status="idle",
        current=0,
        total=summary.total_images if summary else 0,
        percent=0.0
    )
