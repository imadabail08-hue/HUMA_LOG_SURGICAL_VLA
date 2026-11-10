import json
import zipfile
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any
from .. import config
from ..models.schemas import DatasetSummary, ImageAnnotation, BoundingBox

class DatasetService:
    @staticmethod
    def get_dataset_dir(dataset_id: str) -> Path:
        return config.DATASETS_DIR / dataset_id

    @staticmethod
    def get_images_dir(dataset_id: str) -> Path:
        p = config.DATASETS_DIR / dataset_id / "images"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @staticmethod
    def get_annotations_path(dataset_id: str) -> Path:
        return config.DATASETS_DIR / dataset_id / "annotations.json"

    @classmethod
    def create_dataset_from_zip(cls, zip_path: Path, dataset_name: str) -> str:
        """Extract a large ZIP file into a new dataset workspace."""
        dataset_id = str(uuid.uuid4())[:8]
        images_dir = cls.get_images_dir(dataset_id)

        # Extract only allowed image files (flat extraction into images_dir)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for member in zip_ref.infolist():
                if member.is_dir():
                    continue
                file_ext = Path(member.filename).suffix.lower()
                if file_ext in config.ALLOWED_IMAGE_EXTENSIONS:
                    # Flatten filename to avoid directory traversal / nested folders
                    filename = Path(member.filename).name
                    target_path = images_dir / filename
                    with zip_ref.open(member) as source, open(target_path, "wb") as target:
                        shutil.copyfileobj(source, target)

        # Save metadata
        meta = {
            "id": dataset_id,
            "name": dataset_name,
            "created_at": datetime.now().isoformat(),
            "classes": []
        }
        with open(cls.get_dataset_dir(dataset_id) / "meta.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        # Initialize empty annotations.json
        cls.save_annotations(dataset_id, [])
        return dataset_id

    @classmethod
    def create_dataset_from_files(cls, files: List[tuple[str, bytes]], dataset_name: str) -> str:
        """Create a dataset from directly uploaded image files."""
        dataset_id = str(uuid.uuid4())[:8]
        images_dir = cls.get_images_dir(dataset_id)

        for filename, content in files:
            file_ext = Path(filename).suffix.lower()
            if file_ext in config.ALLOWED_IMAGE_EXTENSIONS:
                safe_name = Path(filename).name
                with open(images_dir / safe_name, "wb") as f:
                    f.write(content)

        meta = {
            "id": dataset_id,
            "name": dataset_name,
            "created_at": datetime.now().isoformat(),
            "classes": []
        }
        with open(cls.get_dataset_dir(dataset_id) / "meta.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        cls.save_annotations(dataset_id, [])
        return dataset_id

    @classmethod
    def list_image_paths(cls, dataset_id: str) -> List[Path]:
        images_dir = cls.get_images_dir(dataset_id)
        if not images_dir.exists():
            return []
        paths = [
            p for p in images_dir.iterdir()
            if p.is_file() and p.suffix.lower() in config.ALLOWED_IMAGE_EXTENSIONS
        ]
        paths.sort(key=lambda p: p.name)
        return paths

    @classmethod
    def load_annotations(cls, dataset_id: str) -> List[ImageAnnotation]:
        ann_path = cls.get_annotations_path(dataset_id)
        if not ann_path.exists():
            return []
        try:
            with open(ann_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [ImageAnnotation(**item) for item in data]
        except Exception:
            return []

    @classmethod
    def save_annotations(cls, dataset_id: str, annotations: List[ImageAnnotation]):
        ann_path = cls.get_annotations_path(dataset_id)
        ann_path.parent.mkdir(parents=True, exist_ok=True)
        data = [ann.model_dump() for ann in annotations]
        with open(ann_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    @classmethod
    def update_single_image_boxes(
        cls,
        dataset_id: str,
        image_id: str,
        boxes: List[BoundingBox],
        mark_reviewed: bool = True
    ) -> Optional[ImageAnnotation]:
        """Update bounding boxes for a single image and re-audit quality."""
        from .quality_control import QualityControlEngine

        annotations = cls.load_annotations(dataset_id)
        target_ann = None

        for ann in annotations:
            if ann.image_id == image_id or ann.filename == image_id:
                ann.boxes = boxes
                ann.is_reviewed = mark_reviewed
                status, score, anomalies = QualityControlEngine.audit_image_annotations(boxes)
                ann.quality_status = status
                ann.quality_score = score
                ann.anomalies = anomalies
                target_ann = ann
                break

        if target_ann:
            cls.save_annotations(dataset_id, annotations)
        return target_ann

    @classmethod
    def get_summary(cls, dataset_id: str) -> Optional[DatasetSummary]:
        ds_dir = cls.get_dataset_dir(dataset_id)
        if not ds_dir.exists():
            return None

        meta_path = ds_dir / "meta.json"
        name = dataset_id
        created_at = datetime.now().isoformat()
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                name = meta.get("name", dataset_id)
                created_at = meta.get("created_at", created_at)

        all_images = cls.list_image_paths(dataset_id)
        total_images = len(all_images)
        annotations = cls.load_annotations(dataset_id)

        annotated_count = len(annotations)
        validated_count = sum(1 for a in annotations if a.quality_status == "validated")
        review_count = sum(1 for a in annotations if a.quality_status == "review_recommended")
        alert_count = sum(1 for a in annotations if a.quality_status == "alert")

        all_confs = [
            box.confidence for a in annotations for box in a.boxes
        ]
        avg_conf = (sum(all_confs) / len(all_confs)) if all_confs else 0.0

        classes = sorted(list({box.label for a in annotations for box in a.boxes}))

        return DatasetSummary(
            id=dataset_id,
            name=name,
            total_images=total_images,
            annotated_count=annotated_count,
            validated_count=validated_count,
            review_count=review_count,
            alert_count=alert_count,
            average_confidence=round(avg_conf, 3),
            classes=classes,
            created_at=created_at
        )

    @classmethod
    def list_datasets(cls) -> List[DatasetSummary]:
        summaries = []
        if not config.DATASETS_DIR.exists():
            return summaries
        for sub in config.DATASETS_DIR.iterdir():
            if sub.is_dir():
                s = cls.get_summary(sub.name)
                if s:
                    summaries.append(s)
        summaries.sort(key=lambda s: s.created_at, reverse=True)
        return summaries
