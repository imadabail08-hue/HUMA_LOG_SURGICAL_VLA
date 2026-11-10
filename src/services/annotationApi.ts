import { DatasetSummary, ImageAnnotation, BatchProgress, BoundingBox } from '../types/annotation';

const API_BASE = '/api';

export const annotationApi = {
  async listDatasets(): Promise<DatasetSummary[]> {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error(`Erreur récupération datasets: ${res.statusText}`);
    return res.json();
  },

  async getDataset(datasetId: string): Promise<DatasetSummary> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}`);
    if (!res.ok) throw new Error(`Erreur récupération dataset: ${res.statusText}`);
    return res.json();
  },

  async getDatasetImages(datasetId: string, statusFilter?: string): Promise<ImageAnnotation[]> {
    const url = new URL(`${window.location.origin}${API_BASE}/datasets/${datasetId}/images`);
    if (statusFilter) url.searchParams.set('status_filter', statusFilter);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Erreur images: ${res.statusText}`);
    return res.json();
  },

  async uploadZip(file: File, datasetName?: string): Promise<DatasetSummary> {
    const formData = new FormData();
    formData.append('file', file);
    if (datasetName) formData.append('dataset_name', datasetName);

    const res = await fetch(`${API_BASE}/datasets/upload-zip`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Erreur upload ZIP: ${res.statusText}`);
    return res.json();
  },

  async uploadImages(files: File[], datasetName?: string): Promise<DatasetSummary> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    if (datasetName) formData.append('dataset_name', datasetName);

    const res = await fetch(`${API_BASE}/datasets/upload-images`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Erreur upload images: ${res.statusText}`);
    return res.json();
  },

  async startBatchAnnotation(
    datasetId: string,
    modelName: string = 'yolov8n.pt',
    confidenceThreshold: number = 0.25
  ): Promise<BatchProgress> {
    const res = await fetch(`${API_BASE}/annotate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataset_id: datasetId,
        model_name: modelName,
        confidence_threshold: confidenceThreshold,
      }),
    });
    if (!res.ok) throw new Error(`Erreur lancement batch: ${res.statusText}`);
    return res.json();
  },

  async getBatchProgress(datasetId: string): Promise<BatchProgress> {
    const res = await fetch(`${API_BASE}/annotate/progress/${datasetId}`);
    if (!res.ok) throw new Error(`Erreur statut batch: ${res.statusText}`);
    return res.json();
  },

  async updateBoxes(
    datasetId: string,
    imageId: string,
    boxes: BoundingBox[],
    markReviewed: boolean = true
  ): Promise<ImageAnnotation> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/images/${imageId}/boxes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boxes,
        mark_reviewed: markReviewed,
      }),
    });
    if (!res.ok) throw new Error(`Erreur mise à jour annotations: ${res.statusText}`);
    return res.json();
  },

  getExportUrl(datasetId: string, format: 'yolo' | 'coco' | 'voc' = 'yolo'): string {
    return `${API_BASE}/export/${datasetId}?format=${format}`;
  },
};
