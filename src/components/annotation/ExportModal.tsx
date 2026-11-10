import React, { useState } from 'react';
import { Download, X, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { annotationApi } from '../../services/annotationApi';

interface ExportModalProps {
  isOpen: boolean;
  datasetId: string | null;
  datasetName: string;
  annotatedCount: number;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  datasetId,
  datasetName,
  annotatedCount,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'yolo' | 'coco' | 'voc'>('yolo');

  if (!isOpen || !datasetId) return null;

  const handleDownload = () => {
    const downloadUrl = annotationApi.getExportUrl(datasetId, selectedFormat);
    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${datasetName}_${selectedFormat}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Exporter le Dataset</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-400">
            Export de <strong className="text-slate-200">{annotatedCount} images annotées</strong> prêtes pour l'entraînement :
          </div>

          {/* Formats Radio List */}
          <div className="space-y-2.5">
            {/* YOLO */}
            <label
              onClick={() => setSelectedFormat('yolo')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                selectedFormat === 'yolo'
                  ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="export-format"
                checked={selectedFormat === 'yolo'}
                onChange={() => setSelectedFormat('yolo')}
                className="mt-0.5 accent-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Format YOLO (Ultralytics)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    Recommandé
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Structure : <code className="text-indigo-300 font-mono">labels/*.txt</code>,{' '}
                  <code className="text-indigo-300 font-mono">images/</code> et fichier{' '}
                  <code className="text-indigo-300 font-mono">data.yaml</code>.
                </div>
              </div>
            </label>

            {/* COCO */}
            <label
              onClick={() => setSelectedFormat('coco')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                selectedFormat === 'coco'
                  ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="export-format"
                checked={selectedFormat === 'coco'}
                onChange={() => setSelectedFormat('coco')}
                className="mt-0.5 accent-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-white">Format MS COCO (.json)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Fichier <code className="text-indigo-300 font-mono">annotations.json</code> standard avec coordonnées normalisées en pixels absolus.
                </div>
              </div>
            </label>

            {/* Pascal VOC */}
            <label
              onClick={() => setSelectedFormat('voc')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                selectedFormat === 'voc'
                  ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="export-format"
                checked={selectedFormat === 'voc'}
                onChange={() => setSelectedFormat('voc')}
                className="mt-0.5 accent-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-white">Format Pascal VOC (.xml)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Fichiers XML individuels par image dans <code className="text-indigo-300 font-mono">Annotations/*.xml</code>.
                </div>
              </div>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-900/30"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
