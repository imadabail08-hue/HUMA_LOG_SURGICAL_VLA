import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';
import { annotationApi } from '../../services/annotationApi';
import { DatasetSummary } from '../../types/annotation';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: DatasetSummary) => void;
}

export const DatasetUploadModal: React.FC<DatasetUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [datasetName, setDatasetName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!datasetName) {
        setDatasetName(f.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Veuillez sélectionner une archive ZIP contenant vos images.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const summary = await annotationApi.uploadZip(selectedFile, datasetName.trim());
      onSuccess(summary);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'importation du dataset");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Importer un Dataset Volumineux</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nom du Dataset :
            </label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="Ex: instruments_chirurgicaux_serie_01"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Drag & Drop File Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Archive d'images (format .ZIP sans limite de taille) :
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileArchive className="w-10 h-10 text-cyan-400 mx-auto mb-2 opacity-80" />
              {selectedFile ? (
                <div>
                  <div className="text-sm font-semibold text-slate-200">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-slate-300">
                    Cliquez ou glissez une archive ZIP ici
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Supporte des milliers d'images (.jpg, .png, .webp)
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-900/30"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extraction en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Créer le Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
