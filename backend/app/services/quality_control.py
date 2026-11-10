from typing import List, Tuple
from ..models.schemas import BoundingBox, QualityAnomaly, QualityStatus
from ..config import (
    CONF_HIGH,
    CONF_LOW,
    MIN_BOX_AREA_RATIO,
    MAX_BOX_AREA_RATIO,
    IOU_DUPLICATE_THRESH
)

def calculate_iou(box1: BoundingBox, box2: BoundingBox) -> float:
    """Calculate Intersection-over-Union (IoU) of two normalized bounding boxes."""
    x1_max = max(box1.x, box2.x)
    y1_max = max(box1.y, box2.y)
    x2_min = min(box1.x + box1.width, box2.x + box2.width)
    y2_min = min(box1.y + box1.height, box2.y + box2.height)

    inter_w = max(0.0, x2_min - x1_max)
    inter_h = max(0.0, y2_min - y1_max)
    inter_area = inter_w * inter_h

    area1 = box1.width * box1.height
    area2 = box2.width * box2.height
    union_area = area1 + area2 - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area

class QualityControlEngine:
    """
    Automated Quality Control & Anomaly Detection for Computer Vision Datasets.
    Categorizes annotations into:
      - 'validated' (Green): High-confidence, sound geometry, ready for training
      - 'review_recommended' (Orange): Moderate confidence or minor geometry quirks
      - 'alert' (Red): Low confidence, 0 detections, or severe anomalies
    """

    @staticmethod
    def audit_image_annotations(boxes: List[BoundingBox]) -> Tuple[QualityStatus, float, List[QualityAnomaly]]:
        anomalies: List[QualityAnomaly] = []
        base_score = 100.0

        # 1. Check for empty detection
        if not boxes:
            anomalies.append(QualityAnomaly(
                code="NO_DETECTION",
                message="Aucun objet détecté par l'IA sur cette image",
                severity="high"
            ))
            return "alert", 20.0, anomalies

        # 2. Geometry & Confidence checks per box
        confidences: List[float] = []
        for box in boxes:
            confidences.append(box.confidence)
            box_area = box.width * box.height

            # Low confidence alert
            if box.confidence < CONF_LOW:
                anomalies.append(QualityAnomaly(
                    code="LOW_CONFIDENCE",
                    message=f"Confiance faible ({int(box.confidence * 100)}%) pour '{box.label}'",
                    severity="high",
                    box_id=box.id
                ))
                base_score -= 25.0
            elif box.confidence < CONF_HIGH:
                anomalies.append(QualityAnomaly(
                    code="MEDIUM_CONFIDENCE",
                    message=f"Confiance modérée ({int(box.confidence * 100)}%) pour '{box.label}'",
                    severity="medium",
                    box_id=box.id
                ))
                base_score -= 10.0

            # Tiny box anomaly
            if box_area < MIN_BOX_AREA_RATIO:
                anomalies.append(QualityAnomaly(
                    code="TINY_BOX",
                    message=f"Boîte microscopique ({box_area*100:.3f}% de l'image), possible bruit",
                    severity="medium",
                    box_id=box.id
                ))
                base_score -= 15.0

            # Oversized box anomaly
            if box_area > MAX_BOX_AREA_RATIO:
                anomalies.append(QualityAnomaly(
                    code="OVERSIZED_BOX",
                    message=f"Boîte occupant {box_area*100:.1f}% de l'image entière",
                    severity="medium",
                    box_id=box.id
                ))
                base_score -= 15.0

        # 3. Duplicate overlap check (IoU)
        n = len(boxes)
        for i in range(n):
            for j in range(i + 1, n):
                iou = calculate_iou(boxes[i], boxes[j])
                if iou >= IOU_DUPLICATE_THRESH:
                    anomalies.append(QualityAnomaly(
                        code="DUPLICATE_OVERLAP",
                        message=f"Forte superposition (IoU: {int(iou * 100)}%) entre '{boxes[i].label}' et '{boxes[j].label}'",
                        severity="high",
                        box_id=boxes[j].id
                    ))
                    base_score -= 20.0

        # 4. Final Quality Status Determination
        has_high_severity = any(a.severity == "high" for a in anomalies)
        has_med_severity = any(a.severity == "medium" for a in anomalies)

        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        final_score = max(5.0, min(100.0, (base_score * 0.5) + (avg_conf * 50.0)))

        if has_high_severity or avg_conf < CONF_LOW:
            status: QualityStatus = "alert"
        elif has_med_severity or avg_conf < CONF_HIGH:
            status = "review_recommended"
        else:
            status = "validated"

        return status, round(final_score, 1), anomalies
