import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Download,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { DatasetSummary, QualityStatus } from '../../types/annotation';

interface QualityDashboardProps {
  summary: DatasetSummary | null;
  activeFilter: QualityStatus | 'all';
  onFilterChange: (filter: QualityStatus | 'all') => void;
  onOpenUpload: () => void;
  onOpenBatchModal: () => void;
  onOpenExport: () => void;
  isProcessingBatch: boolean;
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({
  summary,
  activeFilter,
  onFilterChange,
  onOpenUpload,
  onOpenBatchModal,
  onOpenExport,
  isProcessingBatch
}) => {
  const total = summary?.total_images || 0;
  const validated = summary?.validated_count || 0;
  const review = summary?.review_count || 0;
  const alert = summary?.alert_count || 0;
  const avgConf = summary ? Math.round(summary.average_confidence * 100) : 0;

  const validPct = total > 0 ? Math.round((validated / total) * 100) : 0;
  const reviewPct = total > 0 ? Math.round((review / total) * 100) : 0;
  const alertPct = total > 0 ? Math.round((alert / total) * 100) : 0;

  return (
    <div className="bg-[#0f172a] border-b border-slate-800 p-4 space-y-4">
      {/* Top Bar: Title & Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              {summary ? summary.name : 'CVAT AI Studio — Auto-Annotation Illimitée'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              YOLOv8 Engine + Quality Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Détection automatique par lot, contrôle qualité sans quota et correction assistée
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Importer Dataset (ZIP)
          </button>

          <button
            onClick={onOpenBatchModal}
            disabled={!summary || summary.total_images === 0 || isProcessingBatch}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              isProcessingBatch
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Sparkles className="w-4 h-4" />
            {isProcessingBatch ? 'Traitement par lot en cours...' : 'Auto-Annoter Tout (YOLO)'}
          </button>

          <button
            onClick={onOpenExport}
            disabled={!summary || summary.annotated_count === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exporter (YOLO / COCO)
          </button>
        </div>
      </div>

      {/* KPI Cards & Quality Control Triage */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Card */}
        <button
          onClick={() => onFilterChange('all')}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 'all'
              ? 'bg-slate-800/80 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Images</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-[10px] text-slate-500 mt-1">
            {summary?.annotated_count || 0} annotées
          </div>
        </button>

        {/* Validated (Green) */}
        <button
          onClick={() => onFilterChange('validated')}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 'validated'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span>🟢 Validées</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{validated}</div>
          <div className="text-[10px] text-emerald-500/80 mt-1">
            {validPct}% fiables (&gt;80% conf.)
          </div>
        </button>

        {/* Review (Orange) */}
        <button
          onClick={() => onFilterChange('review_recommended')}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 'review_recommended'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span>🟡 À Réviser</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{review}</div>
          <div className="text-[10px] text-amber-500/80 mt-1">
            {reviewPct}% douteuses (50-80%)
          </div>
        </button>

        {/* Alert (Red) */}
        <button
          onClick={() => onFilterChange('alert')}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 'alert'
              ? 'bg-rose-950/40 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span>🔴 Alertes</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300">{alert}</div>
          <div className="text-[10px] text-rose-500/80 mt-1">
            {alertPct}% anomalies / 0 objets
          </div>
        </button>

        {/* Average Confidence */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Confiance Moyenne</span>
            <Percent className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300">{avgConf}%</div>
          <div className="text-[10px] text-slate-500 mt-1">
            {summary?.classes.length || 0} classes détectées
          </div>
        </div>
      </div>

      {/* Quality Ratio Distribution Bar */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Distribution de la qualité des annotations :</span>
            <span className="font-mono text-slate-300">
              🟢 {validPct}% | 🟡 {reviewPct}% | 🔴 {alertPct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${validPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Validées : ${validated} (${validPct}%)`}
            />
            <div
              style={{ width: `${reviewPct}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`À réviser : ${review} (${reviewPct}%)`}
            />
            <div
              style={{ width: `${alertPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Alertes : ${alert} (${alertPct}%)`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
