export type QualityStatus = 'validated' | 'review_recommended' | 'alert';
export type BoxSource = 'ai' | 'manual';
export type BatchStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface QualityAnomaly {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  box_id?: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  // Normalized 0.0 - 1.0
  x: number;
  y: number;
  width: number;
  height: number;
  verified?: boolean;
  source?: BoxSource;
}

export interface ImageAnnotation {
  image_id: string;
  filename: string;
  width: number;
  height: number;
  image_url: string;
  boxes: BoundingBox[];
  quality_status: QualityStatus;
  quality_score: number;
  anomalies: QualityAnomaly[];
  is_reviewed: boolean;
}

export interface DatasetSummary {
  id: string;
  name: string;
  total_images: number;
  annotated_count: number;
  validated_count: number;
  review_count: number;
  alert_count: number;
  average_confidence: number;
  classes: string[];
  created_at: string;
}

export interface BatchProgress {
  dataset_id: string;
  status: BatchStatus;
  current: number;
  total: number;
  percent: number;
  current_image?: string;
  error_message?: string;
}
