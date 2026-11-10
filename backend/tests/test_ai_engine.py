import pytest
from pathlib import Path
from app.models.schemas import BoundingBox, QualityAnomaly
from app.services.quality_control import QualityControlEngine, calculate_iou
from app.services.dataset_service import DatasetService
from app.services.export_service import ExportService

def test_calculate_iou_no_overlap():
    b1 = BoundingBox(id="1", label="scalpel", confidence=0.9, x=0.1, y=0.1, width=0.2, height=0.2)
    b2 = BoundingBox(id="2", label="forceps", confidence=0.9, x=0.5, y=0.5, width=0.2, height=0.2)
    assert calculate_iou(b1, b2) == 0.0

def test_calculate_iou_full_overlap():
    b1 = BoundingBox(id="1", label="scalpel", confidence=0.9, x=0.2, y=0.2, width=0.2, height=0.2)
    b2 = BoundingBox(id="2", label="scalpel", confidence=0.9, x=0.2, y=0.2, width=0.2, height=0.2)
    assert pytest.approx(calculate_iou(b1, b2), 0.01) == 1.0

def test_quality_control_empty_detection_alert():
    status, score, anomalies = QualityControlEngine.audit_image_annotations([])
    assert status == "alert"
    assert any(a.code == "NO_DETECTION" for a in anomalies)

def test_quality_control_validated():
    boxes = [
        BoundingBox(id="1", label="bistouri_scalpel", confidence=0.94, x=0.1, y=0.1, width=0.2, height=0.3),
        BoundingBox(id="2", label="pince_bipolar", confidence=0.88, x=0.4, y=0.2, width=0.25, height=0.3)
    ]
    status, score, anomalies = QualityControlEngine.audit_image_annotations(boxes)
    assert status == "validated"
    assert len(anomalies) == 0
    assert score >= 85.0

def test_quality_control_medium_confidence_review():
    boxes = [
        BoundingBox(id="1", label="porte_aiguille", confidence=0.62, x=0.1, y=0.1, width=0.2, height=0.3)
    ]
    status, score, anomalies = QualityControlEngine.audit_image_annotations(boxes)
    assert status == "review_recommended"
    assert any(a.code == "MEDIUM_CONFIDENCE" for a in anomalies)

def test_quality_control_duplicate_overlap_alert():
    boxes = [
        BoundingBox(id="1", label="bistouri_scalpel", confidence=0.95, x=0.2, y=0.2, width=0.2, height=0.2),
        BoundingBox(id="2", label="bistouri_scalpel", confidence=0.91, x=0.21, y=0.21, width=0.2, height=0.2)
    ]
    status, score, anomalies = QualityControlEngine.audit_image_annotations(boxes)
    assert status == "alert"
    assert any(a.code == "DUPLICATE_OVERLAP" for a in anomalies)


def test_export_service_yolo_and_coco(tmp_path, monkeypatch):
    import json
    from app.models.schemas import ImageAnnotation, BoundingBox

    dataset_id = "test_ds_001"
    images_dir = tmp_path / "storage" / "datasets" / dataset_id / "images"
    images_dir.mkdir(parents=True)
    exports_dir = tmp_path / "storage" / "exports"
    exports_dir.mkdir(parents=True)

    # Monkeypatch storage dirs to tmp_path
    from app import config
    monkeypatch.setattr(config, "DATASETS_DIR", tmp_path / "storage" / "datasets")
    monkeypatch.setattr(config, "EXPORTS_DIR", exports_dir)

    # Create dummy image file
    from PIL import Image
    test_img = images_dir / "sample_01.jpg"
    Image.new("RGB", (640, 480), color="blue").save(test_img)

    # Save mock annotations
    ann = ImageAnnotation(
        image_id="sample_01",
        filename="sample_01.jpg",
        width=640,
        height=480,
        image_url="/raw/sample_01.jpg",
        boxes=[
            BoundingBox(id="b1", label="bistouri_scalpel", confidence=0.92, x=0.1, y=0.1, width=0.2, height=0.3)
        ],
        quality_status="validated",
        quality_score=94.0,
        anomalies=[],
        is_reviewed=True
    )
    DatasetService.save_annotations(dataset_id, [ann])

    # 1. Test YOLO Export
    yolo_zip = ExportService.export_dataset(dataset_id, export_format="yolo")
    assert yolo_zip.exists()
    assert yolo_zip.suffix == ".zip"

    # 2. Test COCO Export
    coco_zip = ExportService.export_dataset(dataset_id, export_format="coco")
    assert coco_zip.exists()
    assert coco_zip.suffix == ".zip"


def test_ai_engine_real_inference(tmp_path):
    from PIL import Image, ImageDraw
    from app.services.ai_engine import AIEngine

    # Create a realistic test image with shapes
    img_path = tmp_path / "test_inference.jpg"
    img = Image.new("RGB", (640, 640), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 200, 200], fill=(20, 20, 20))
    img.save(img_path)

    engine = AIEngine(model_name="yolov8n.pt")
    ann = engine.annotate_single_image(
        image_path=img_path,
        image_url="/raw/test_inference.jpg",
        conf_threshold=0.10
    )

    assert ann.filename == "test_inference.jpg"
    assert ann.width == 640
    assert ann.height == 640
    assert ann.quality_status in ["validated", "review_recommended", "alert"]
    assert 0.0 <= ann.quality_score <= 100.0
