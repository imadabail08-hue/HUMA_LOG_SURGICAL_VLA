import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { annotationApi } from '../../services/annotationApi';
import { BatchProgress } from '../../types/annotation';

interface BatchProgressModalProps {
  isOpen: boolean;
  datasetId: string | null;
  datasetName: string;
  totalImages: number;
  onClose: () => void;
  onBatchComplete: () => void;
}

export const BatchProgressModal: React.FC<BatchProgressModalProps> = ({
  isOpen,
  datasetId,
  datasetName,
  totalImages,
  onClose,
  onBatchComplete
}) => {
  const [modelName, setModelName] = useState('yolov8n.pt');
  const [confThreshold, setConfThreshold] = useState(0.25);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll progress when running
  useEffect(() => {
    if (!isOpen || !datasetId) return;

    let intervalId: any;

    const checkProgress = async () => {
      try {
        const p = await annotationApi.getBatchProgress(datasetId);
        setProgress(p);

        if (p.status === 'completed') {
          clearInterval(intervalId);
          onBatchComplete();
        } else if (p.status === 'error') {
          clearInterval(intervalId);
          setError(p.error_message || 'Une erreur est survenue lors de l’inférence par lot');
        }
      } catch (err: any) {
        // silent polling error
      }
    };

    checkProgress();
    intervalId = setInterval(checkProgress, 1200);

    return () => clearInterval(intervalId);
  }, [isOpen, datasetId, onBatchComplete]);

  if (!isOpen || !datasetId) return null;

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const p = await annotationApi.startBatchAnnotation(datasetId, modelName, confThreshold);
      setProgress(p);
    } catch (err: any) {
      setError(err.message || 'Impossible de lancer le batch');
    } finally {
      setIsStarting(false);
    }
  };

  const isRunning = progress?.status === 'processing';
  const isDone = progress?.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Auto-Annotation par Lot (YOLO)</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Dataset cible :</div>
            <div className="text-sm font-bold text-white mt-0.5">{datasetName}</div>
            <div className="text-xs text-cyan-400 font-mono mt-1">
              {totalImages} image{totalImages > 1 ? 's' : ''} à traiter
            </div>
          </div>

          {/* Settings */}
          {!isRunning && !isDone && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Modèle d'inférence YOLO :
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="yolov8n.pt">YOLOv8 Nano (Rapide - CPU / GPU)</option>
                  <option value="yolov8s.pt">YOLOv8 Small (Équilibré)</option>
                  <option value="yolov8m.pt">YOLOv8 Medium (Haute Précision)</option>
                  <option value="yolov11n.pt">YOLOv11 Nano (Dernière génération)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Seuil de Confiance Initial :</span>
                  <span className="font-mono text-emerald-400">{Math.round(confThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Les détections inférieures à 50% seront automatiquement étiquetées en Rouge (Alerte) pour vérification.
                </p>
              </div>
            </div>
          )}

          {/* Running Progress Bar */}
          {isRunning && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  Traitement par lot en cours...
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {progress?.percent || 0}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${progress?.percent || 0}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {progress?.current || 0} / {progress?.total || totalImages} images traitées
                </span>
                <span className="truncate max-w-[200px] text-slate-500 font-mono">
                  {progress?.current_image}
                </span>
              </div>
            </div>
          )}

          {/* Done State */}
          {isDone && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-emerald-300">
                Auto-Annotation terminée avec succès !
              </div>
              <p className="text-xs text-slate-400">
                Toutes les images ont été traitées et le système de contrôle qualité a trié les détections.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            {!isRunning && !isDone && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isStarting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Démarrer l'Annotation ({totalImages} img)</span>
                </button>
              </>
            )}

            {isDone && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition"
              >
                Inspecter les Résultats
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
