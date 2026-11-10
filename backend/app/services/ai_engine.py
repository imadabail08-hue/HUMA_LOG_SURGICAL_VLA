import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional, Callable
from PIL import Image
from ..models.schemas import BoundingBox, ImageAnnotation
from .quality_control import QualityControlEngine

class AIEngine:
    """
    High-throughput Batch Auto-Annotation Engine using YOLO & Quality Control.
    Processes unlimited images in streamed batches with progress tracking.
    """

    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model_name = model_name
        self._model = None

    def get_model(self):
        if self._model is None:
            # Lazy import to speed up startup
            from ultralytics import YOLO
            self._model = YOLO(self.model_name)
        return self._model

    def annotate_single_image(
        self,
        image_path: Path,
        image_url: str,
        conf_threshold: float = 0.25
    ) -> ImageAnnotation:
        """Run YOLO inference on a single image and compute its quality audit."""
        model = self.get_model()

        # Get original image dimensions using PIL without loading full image into tensor
        with Image.open(image_path) as img:
            img_width, img_height = img.size

        # Inférence YOLO
        results = model.predict(
            source=str(image_path),
            conf=conf_threshold,
            verbose=False
        )

        boxes: List[BoundingBox] = []
        if results and len(results) > 0:
            result = results[0]
            names = result.names  # class index -> label

            for box in result.boxes:
                # xyxy coordinates in absolute pixels
                coords = box.xyxy[0].tolist()
                x1, y1, x2, y2 = coords
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = names.get(cls_id, f"class_{cls_id}")

                # Normalized coordinates (0.0 to 1.0)
                norm_x = max(0.0, min(1.0, x1 / img_width))
                norm_y = max(0.0, min(1.0, y1 / img_height))
                norm_w = max(0.0, min(1.0, (x2 - x1) / img_width))
                norm_h = max(0.0, min(1.0, (y2 - y1) / img_height))

                boxes.append(BoundingBox(
                    id=str(uuid.uuid4())[:8],
                    label=label,
                    confidence=round(conf, 3),
                    x=round(norm_x, 4),
                    y=round(norm_y, 4),
                    width=round(norm_w, 4),
                    height=round(norm_h, 4),
                    verified=False,
                    source="ai"
                ))

        # Perform Quality Control Audit
        quality_status, quality_score, anomalies = QualityControlEngine.audit_image_annotations(boxes)

        return ImageAnnotation(
            image_id=image_path.stem,
            filename=image_path.name,
            width=img_width,
            height=img_height,
            image_url=image_url,
            boxes=boxes,
            quality_status=quality_status,
            quality_score=quality_score,
            anomalies=anomalies,
            is_reviewed=False
        )

    def annotate_batch(
        self,
        image_paths: List[Path],
        url_builder: Callable[[Path], str],
        conf_threshold: float = 0.25,
        batch_size: int = 16,
        progress_callback: Optional[Callable[[int, int, str], None]] = None
    ) -> List[ImageAnnotation]:
        """
        Stream batch inference across large image datasets.
        Invokes progress_callback(current, total, current_filename) after each processed image.
        """
        total = len(image_paths)
        annotations: List[ImageAnnotation] = []

        for idx, img_path in enumerate(image_paths):
            try:
                img_url = url_builder(img_path)
                ann = self.annotate_single_image(img_path, img_url, conf_threshold=conf_threshold)
                annotations.append(ann)
            except Exception as e:
                # In case of corrupt image, still report anomaly rather than crashing batch
                annotations.append(ImageAnnotation(
                    image_id=img_path.stem,
                    filename=img_path.name,
                    width=0,
                    height=0,
                    image_url="",
                    boxes=[],
                    quality_status="alert",
                    quality_score=0.0,
                    anomalies=[{
                        "code": "IMAGE_READ_ERROR",
                        "message": f"Erreur de lecture image: {str(e)}",
                        "severity": "high"
                    }]
                ))

            if progress_callback:
                progress_callback(idx + 1, total, img_path.name)

        return annotations
