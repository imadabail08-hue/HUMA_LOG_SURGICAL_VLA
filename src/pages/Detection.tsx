import { useState } from 'react';
import { DetectionPayload } from '../types/detection';
import { INSTRUMENT_CLASSES_LIST } from '../data/instruments';
import {
  ScanEye,
  Layers,
  AlertTriangle,
  ImageIcon
} from 'lucide-react';

interface DetectionPageProps {
  payload: DetectionPayload;
  selectedInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
}

export function DetectionPage({
  payload,
  selectedInstanceId,
  onSelect
}: DetectionPageProps) {
  const [activeTab, setActiveTab] = useState<'annotated' | 'raw'>('annotated');
  const [selectedImageSource, setSelectedImageSource] = useState<'topdown' | 'perspective' | 'kit'>('topdown');
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Détermination de l'image source active
  const activeImageSrc =
    selectedImageSource === 'topdown'
      ? '/images/medical_box_topdown.jpg'
      : selectedImageSource === 'perspective'
      ? '/images/medical_box_perspective.jpg'
      : '/images/surgical_kit_ground_truth.jpg';

  const isCalibratedSvg = selectedImageSource === 'topdown';

  return (
    <div className="p-4 lg:p-6 max-w-[1800px] mx-auto space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
            <ScanEye className="w-5 h-5 text-cyan-400" />
            VISION IA — SEGMENTATION ET DÉTECTION (YOLO26s-seg)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Validation sur les photographies réelles de la valise chirurgicale avec masques vectoriels et centroïdes
          </p>
        </div>

        {/* Message d'honnêteté scientifique explicite */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>FLUX ENTRANT : ÉCHANTILLON ACADÉMIQUE ÉTALONNÉ (MODÈLE SIMULÉ)</span>
        </div>
      </div>

      {/* Barre de sélection de l'image source réelle */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-cyan-400" /> Image Source :
          </span>

          <button
            onClick={() => setSelectedImageSource('topdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedImageSource === 'topdown'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Image Source 1 (Vue Zénithale Top-Down)
          </button>

          <button
            onClick={() => setSelectedImageSource('perspective')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedImageSource === 'perspective'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Image Source 2 (Perspective sur Table)
          </button>

          <button
            onClick={() => setSelectedImageSource('kit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedImageSource === 'kit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Trousse Fermée (Archive)
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Modèle IA cible : <span className="text-cyan-400 font-bold">YOLO26s-seg</span> (8 classes)
        </div>
      </div>

      {/* Conteneur principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Colonne gauche : Visualiseur Vidéo / Segmentation */}
        <div className="lg:col-span-8 space-y-3">
          {/* Barre de contrôle des couches de rendu */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Onglets de visualisation */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('annotated')}
                className={`px-3 py-1 rounded font-mono font-medium transition ${
                  activeTab === 'annotated'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inférence Annotée
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1 rounded font-mono font-medium transition ${
                  activeTab === 'raw'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cliché Brut
              </button>
            </div>

            {/* Bascules des couches vectorielles */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showMasks}
                  onChange={(e) => setShowMasks(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Masques Polygones</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showBBoxes}
                  onChange={(e) => setShowBBoxes(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Bounding Boxes</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Labels IA</span>
              </label>
            </div>
          </div>

          {/* Affichage de l'image avec masques vectoriels SVG */}
          <div className="relative w-full max-h-[720px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-2xl">
            {/* Cliché réel actif */}
            <img
              src={activeImageSrc}
              alt="Photographie source de la valise chirurgicale"
              className="max-h-[720px] w-auto object-contain mx-auto select-none"
            />

            {/* Calque vectoriel SVG des annotations YOLO26s-seg (calibré pour l'image zénithale 1024x768) */}
            {activeTab === 'annotated' && isCalibratedSvg && (
              <svg
                viewBox="0 0 1024 768"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid meet"
              >
                {payload.detections.map((d) => {
                  const classDef = INSTRUMENT_CLASSES_LIST.find((c) => c.id === d.class_id);
                  const color = classDef?.color || '#00FFFF';
                  const isSelected = d.instance_id === selectedInstanceId;

                  const pointsStr = d.polygon ? d.polygon.map((p) => p.join(',')).join(' ') : '';
                  const [bx, by, bw, bh] = d.bbox;

                  return (
                    <g
                      key={d.instance_id}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => onSelect(isSelected ? null : d.instance_id)}
                    >
                      {/* Masque polygonal de segmentation */}
                      {showMasks && pointsStr && (
                        <polygon
                          points={pointsStr}
                          fill={color}
                          fillOpacity={isSelected ? 0.45 : 0.22}
                          stroke={color}
                          strokeWidth={isSelected ? 3.5 : 1.8}
                          strokeDasharray={isSelected ? '4 2' : undefined}
                          className="transition-all duration-150 hover:fill-opacity-50"
                        />
                      )}

                      {/* Bounding box */}
                      {showBBoxes && (
                        <rect
                          x={bx}
                          y={by}
                          width={bw}
                          height={bh}
                          fill="none"
                          stroke={color}
                          strokeWidth={isSelected ? 2.5 : 1.2}
                          strokeDasharray="4 3"
                          opacity={0.85}
                        />
                      )}

                      {/* Centroïde 2D */}
                      <circle
                        cx={d.center_x}
                        cy={d.center_y}
                        r={isSelected ? 6 : 4}
                        fill={color}
                        stroke="#000000"
                        strokeWidth={1.5}
                      />

                      {/* Étiquette d'inférence */}
                      {showLabels && (
                        <g transform={`translate(${bx}, ${by - 8})`}>
                          <rect
                            x={0}
                            y={-14}
                            width={Math.max(140, d.class_name.length * 8.5)}
                            height={16}
                            fill="#070d18"
                            fillOpacity={0.92}
                            rx={3}
                            stroke={color}
                            strokeWidth={1}
                          />
                          <text
                            x={6}
                            y={-3}
                            fill="#ffffff"
                            fontSize="9.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            #{d.class_id.toString().padStart(2, '0')} {d.class_name} ({(d.confidence * 100).toFixed(0)}%)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Légende en bas à gauche */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-cyan-300 pointer-events-none">
              Source : Cliché réel boîte chirurgicale • Résolution native 1024x768
            </div>
          </div>
        </div>

        {/* Colonne droite : Synthèse des 8 classes et confiances */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                NOMENCLATURE DES HUIT CLASSES
              </h3>
            </div>

            <div className="space-y-2">
              {INSTRUMENT_CLASSES_LIST.map((cls) => {
                const item = payload.detections.find((d) => d.class_id === cls.id);
                const isSelected = item && item.instance_id === selectedInstanceId;

                return (
                  <div
                    key={cls.id}
                    onClick={() => {
                      if (item) onSelect(isSelected ? null : item.instance_id);
                    }}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow"
                        style={{ backgroundColor: cls.color }}
                      />
                      <div>
                        <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          <span>0{cls.id}</span>
                          <span>{cls.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          {cls.french_name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      {item ? (
                        <>
                          <div className="text-xs font-bold text-emerald-400">
                            {(item.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-slate-500">
                            1 instance
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-rose-400 font-bold">
                          Non détecté
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
