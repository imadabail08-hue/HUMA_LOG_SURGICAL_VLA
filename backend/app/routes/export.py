from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from ..services.export_service import ExportService, ExportFormat
from ..services.dataset_service import DatasetService

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/{dataset_id}")
def export_dataset(
    dataset_id: str,
    format: ExportFormat = Query("yolo", description="Format: yolo, coco, voc")
):
    summary = DatasetService.get_summary(dataset_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")

    try:
        zip_path = ExportService.export_dataset(dataset_id, export_format=format)
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=zip_path.name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'export: {str(e)}")
