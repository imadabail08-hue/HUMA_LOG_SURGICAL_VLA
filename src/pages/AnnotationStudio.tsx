import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderPlus,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { annotationApi } from '../services/annotationApi';
import { DatasetSummary, ImageAnnotation, QualityStatus, BoundingBox } from '../types/annotation';
import { QualityDashboard } from '../components/annotation/QualityDashboard';
import { AnnotationCanvas } from '../components/annotation/AnnotationCanvas';
import { DatasetUploadModal } from '../components/annotation/DatasetUploadModal';
import { BatchProgressModal } from '../components/annotation/BatchProgressModal';
import { ExportModal } from '../components/annotation/ExportModal';

export const AnnotationStudioPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [currentDatasetSummary, setCurrentDatasetSummary] = useState<DatasetSummary | null>(null);

  const [images, setImages] = useState<ImageAnnotation[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<QualityStatus | 'all'>('all');
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load datasets on mount
  const refreshDatasets = useCallback(async () => {
    try {
      const list = await annotationApi.listDatasets();
      setDatasets(list);
      if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement datasets:', err);
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    refreshDatasets();
  }, [refreshDatasets]);

  // Load summary and images when selected dataset changes
  const loadDatasetData = useCallback(async (datasetId: string, filter?: QualityStatus | 'all') => {
    setIsLoadingImages(true);
    try {
      const summary = await annotationApi.getDataset(datasetId);
      setCurrentDatasetSummary(summary);

      const f = filter === 'all' ? undefined : filter;
      const imgList = await annotationApi.getDatasetImages(datasetId, f);
      setImages(imgList);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error('Erreur chargement images:', err);
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDatasetId) {
      loadDatasetData(selectedDatasetId, activeFilter);
    }
  }, [selectedDatasetId, activeFilter, loadDatasetData]);

  const activeImage = images[selectedImageIndex] || null;

  // Handle Box updates from canvas
  const handleUpdateBoxes = async (boxes: BoundingBox[], markReviewed: boolean) => {
    if (!selectedDatasetId || !activeImage) return;

    try {
      const updated = await annotationApi.updateBoxes(
        selectedDatasetId,
        activeImage.image_id,
        boxes,
        markReviewed
      );

      // Update in local state
      setImages((prev) =>
        prev.map((img) => (img.image_id === updated.image_id ? updated : img))
      );

      // Refresh dataset stats
      const refreshedSummary = await annotationApi.getDataset(selectedDatasetId);
      setCurrentDatasetSummary(refreshedSummary);
    } catch (err) {
      console.error('Erreur sauvegarde annotations:', err);
    }
  };

  // Keyboard navigation between images (Up / Down)
  useEffect(() => {
    const handleKeyNav = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedImageIndex((prev) => Math.min(images.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedImageIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [images.length]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1d] overflow-hidden text-slate-100">
      {/* Top Quality Control Dashboard */}
      <QualityDashboard
        summary={currentDatasetSummary}
        activeFilter={activeFilter}
        onFilterChange={(f) => setActiveFilter(f)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        isProcessingBatch={false}
      />

      {/* Main Studio Body: Sidebar Thumbnails | Canvas | Right Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Strip */}
        <div className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col flex-shrink-0">
          {/* Dataset Switcher */}
          <div className="p-3 border-b border-slate-800">
            <label className="text-[10px] font-mono font-semibold uppercase text-slate-500 block mb-1">
              Dataset Actif
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedDatasetId || ''}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.total_images} img)
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                title="Importer un nouveau dataset"
                className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 transition"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filmstrip Title */}
          <div className="px-3 py-2 text-[11px] font-mono font-semibold text-slate-400 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
            <span>Galerie ({images.length})</span>
            <span className="text-[10px] text-slate-500">Navigation ↑ / ↓</span>
          </div>

          {/* Images Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {isLoadingImages ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                Chargement des images...
              </div>
            ) : images.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Aucune image dans ce filtre.
              </div>
            ) : (
              images.map((img, idx) => {
                const isSelected = idx === selectedImageIndex;
                const statusColor =
                  img.quality_status === 'validated'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : img.quality_status === 'review_recommended'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                return (
                  <button
                    key={img.image_id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-full p-2.5 flex items-center gap-3 text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-l-4 border-l-cyan-500'
                        : 'hover:bg-slate-900/70 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-10 rounded bg-slate-950 overflow-hidden border border-slate-800 flex-shrink-0 relative">
                      <img
                        src={img.image_url}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                      {img.is_reviewed && (
                        <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {img.filename}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${statusColor}`}>
                          {img.quality_status === 'validated'
                            ? '🟢 OK'
                            : img.quality_status === 'review_recommended'
                            ? '🟡 Révision'
                            : '🔴 Alerte'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {img.boxes.length} boîte{img.boxes.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: CVAT Interactive Canvas */}
        <AnnotationCanvas
          annotation={activeImage}
          onUpdateBoxes={handleUpdateBoxes}
          availableClasses={currentDatasetSummary?.classes.length ? currentDatasetSummary.classes : undefined as any}
        />

        {/* Right Inspector Panel */}
        {activeImage && (
          <div className="w-72 bg-[#0d1322] border-l border-slate-800 flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Inspecteur d'Annotation
              </h3>
              <div className="text-sm font-semibold text-white truncate mt-1">
                {activeImage.filename}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {activeImage.width} × {activeImage.height} px
              </div>
            </div>

            {/* Quality Score Gauge */}
            <div className="p-4 border-b border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Indice de Qualité :</span>
                <span className="font-mono font-bold text-cyan-400">
                  {activeImage.quality_score}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${activeImage.quality_score}%` }}
                  className={`h-full ${
                    activeImage.quality_score >= 80
                      ? 'bg-emerald-500'
                      : activeImage.quality_score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* Boxes list */}
            <div className="p-4 flex-1 space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Objets Détectés ({activeImage.boxes.length})</span>
              </div>

              {activeImage.boxes.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                  Aucun objet annoté. Cliquez sur <strong>Créer Boîte (R)</strong> pour en ajouter un.
                </div>
              ) : (
                activeImage.boxes.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{b.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Conf: {Math.round(b.confidence * 100)}%</span>
                        <span>•</span>
                        <span className="text-slate-500 uppercase">{b.source}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const remaining = activeImage.boxes.filter((box) => box.id !== b.id);
                        handleUpdateBoxes(remaining, true);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Supprimer cette boîte"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(summary) => {
          refreshDatasets();
          setSelectedDatasetId(summary.id);
        }}
      />

      <BatchProgressModal
        isOpen={isBatchModalOpen}
        datasetId={selectedDatasetId}
        datasetName={currentDatasetSummary?.name || ''}
        totalImages={currentDatasetSummary?.total_images || 0}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchComplete={() => {
          if (selectedDatasetId) {
            loadDatasetData(selectedDatasetId, activeFilter);
          }
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        datasetId={selectedDatasetId}
        datasetName={currentDatasetSummary?.name || ''}
        annotatedCount={currentDatasetSummary?.annotated_count || 0}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
