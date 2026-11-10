import json
import zipfile
import shutil
from pathlib import Path
from typing import Literal, Dict, Any
from .. import config
from .dataset_service import DatasetService

ExportFormat = Literal["yolo", "coco", "voc"]

class ExportService:
    @classmethod
    def export_dataset(cls, dataset_id: str, export_format: ExportFormat = "yolo") -> Path:
        """Export dataset annotations and images into a downloadable ZIP archive."""
        annotations = DatasetService.load_annotations(dataset_id)
        images_dir = DatasetService.get_images_dir(dataset_id)
        summary = DatasetService.get_summary(dataset_id)
        dataset_name = summary.name if summary else dataset_id

        # Unique export bundle folder
        export_folder = config.EXPORTS_DIR / f"{dataset_id}_{export_format}"
        if export_folder.exists():
            shutil.rmtree(export_folder)
        export_folder.mkdir(parents=True, exist_ok=True)

        # Build class index mapping
        all_labels = sorted(list({box.label for ann in annotations for box in ann.boxes}))
        label_to_id = {label: i for i, label in enumerate(all_labels)}

        if export_format == "yolo":
            cls._export_yolo(export_folder, annotations, label_to_id, all_labels, images_dir)
        elif export_format == "coco":
            cls._export_coco(export_folder, annotations, label_to_id, all_labels, images_dir)
        elif export_format == "voc":
            cls._export_voc(export_folder, annotations, images_dir)

        # Create ZIP archive
        zip_path = config.EXPORTS_DIR / f"{dataset_name}_{export_format}.zip"
        if zip_path.exists():
            zip_path.unlink()

        shutil.make_archive(str(zip_path.with_suffix("")), "zip", export_folder)
        # Clean temp directory
        shutil.rmtree(export_folder)

        return zip_path

    @staticmethod
    def _export_yolo(
        export_folder: Path,
        annotations,
        label_to_id: Dict[str, int],
        all_labels,
        images_dir: Path
    ):
        labels_dir = export_folder / "labels"
        imgs_dir = export_folder / "images"
        labels_dir.mkdir(parents=True, exist_ok=True)
        imgs_dir.mkdir(parents=True, exist_ok=True)

        # data.yaml
        yaml_content = f"names:\n"
        for i, name in enumerate(all_labels):
            yaml_content += f"  {i}: {name}\n"
        yaml_content += f"nc: {len(all_labels)}\n"
        with open(export_folder / "data.yaml", "w", encoding="utf-8") as f:
            f.write(yaml_content)

        # classes.txt
        with open(export_folder / "classes.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(all_labels))

        # Write labels and copy images
        for ann in annotations:
            txt_path = labels_dir / f"{Path(ann.filename).stem}.txt"
            lines = []
            for box in ann.boxes:
                cls_id = label_to_id.get(box.label, 0)
                # YOLO format requires center x, center y, width, height (all normalized)
                center_x = min(1.0, max(0.0, box.x + (box.width / 2.0)))
                center_y = min(1.0, max(0.0, box.y + (box.height / 2.0)))
                w = min(1.0, max(0.0, box.width))
                h = min(1.0, max(0.0, box.height))
                lines.append(f"{cls_id} {center_x:.6f} {center_y:.6f} {w:.6f} {h:.6f}")

            with open(txt_path, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))

            # Copy image if exists
            src_img = images_dir / ann.filename
            if src_img.exists():
                shutil.copy2(src_img, imgs_dir / ann.filename)

    @staticmethod
    def _export_coco(
        export_folder: Path,
        annotations,
        label_to_id: Dict[str, int],
        all_labels,
        images_dir: Path
    ):
        imgs_dir = export_folder / "images"
        imgs_dir.mkdir(parents=True, exist_ok=True)

        categories = [{"id": i, "name": name, "supercategory": "none"} for i, name in enumerate(all_labels)]
        coco_images = []
        coco_annotations = []
        ann_id = 1

        for img_idx, ann in enumerate(annotations, start=1):
            coco_images.append({
                "id": img_idx,
                "file_name": ann.filename,
                "width": ann.width,
                "height": ann.height
            })

            src_img = images_dir / ann.filename
            if src_img.exists():
                shutil.copy2(src_img, imgs_dir / ann.filename)

            for box in ann.boxes:
                # COCO format: [x_min, y_min, width, height] in absolute pixels
                x_px = box.x * ann.width
                y_px = box.y * ann.height
                w_px = box.width * ann.width
                h_px = box.height * ann.height

                coco_annotations.append({
                    "id": ann_id,
                    "image_id": img_idx,
                    "category_id": label_to_id.get(box.label, 0),
                    "bbox": [round(x_px, 2), round(y_px, 2), round(w_px, 2), round(h_px, 2)],
                    "area": round(w_px * h_px, 2),
                    "iscrowd": 0,
                    "score": round(box.confidence, 3)
                })
                ann_id += 1

        coco_data = {
            "info": {"description": "HUMA-LOG Surgical Auto-Annotation Export"},
            "categories": categories,
            "images": coco_images,
            "annotations": coco_annotations
        }

        with open(export_folder / "annotations.json", "w", encoding="utf-8") as f:
            json.dump(coco_data, f, indent=2)

    @staticmethod
    def _export_voc(export_folder: Path, annotations, images_dir: Path):
        annotations_dir = export_folder / "Annotations"
        imgs_dir = export_folder / "JPEGImages"
        annotations_dir.mkdir(parents=True, exist_ok=True)
        imgs_dir.mkdir(parents=True, exist_ok=True)

        for ann in annotations:
            src_img = images_dir / ann.filename
            if src_img.exists():
                shutil.copy2(src_img, imgs_dir / ann.filename)

            xml_content = f"""<annotation>
    <filename>{ann.filename}</filename>
    <size>
        <width>{ann.width}</width>
        <height>{ann.height}</height>
        <depth>3</depth>
    </size>"""
            for box in ann.boxes:
                xmin = int(box.x * ann.width)
                ymin = int(box.y * ann.height)
                xmax = int((box.x + box.width) * ann.width)
                ymax = int((box.y + box.height) * ann.height)
                xml_content += f"""
    <object>
        <name>{box.label}</name>
        <bndbox>
            <xmin>{xmin}</xmin>
            <ymin>{ymin}</ymin>
            <xmax>{xmax}</xmax>
            <ymax>{ymax}</ymax>
        </bndbox>
    </object>"""
            xml_content += "\n</annotation>"

            with open(annotations_dir / f"{Path(ann.filename).stem}.xml", "w", encoding="utf-8") as f:
                f.write(xml_content)
