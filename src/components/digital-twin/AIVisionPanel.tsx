import { memo, useState } from 'react';
import { DetectionItem } from '../../types/detection';
import { getInstrumentClassById } from '../../data/instruments';
import { formatCoordinatesMm } from '../../utils/coordinateTransforms';
import { Camera, ChevronDown, ChevronUp, Cpu, ShieldCheck, Target } from 'lucide-react';

interface AIVisionPanelProps {
  detections: DetectionItem[];
  selectedInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  isSimulationMode?: boolean;
}

export const AIVisionPanel = memo(function AIVisionPanel({
  detections,
  selectedInstanceId,
  onSelect,
  isSimulationMode = true
}: AIVisionPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const detectedCount = detections.filter((d) => d.status === 'detected' || d.status === 'tracking').length;

  return (
    <div className="w-full h-full rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl text-xs select-none flex flex-col min-h-0 overflow-hidden">
      {/* 1. En-tête du flux de vision robotique (fixe) */}
      <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Camera className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-white text-[11px]">
              <span>VISION ROBOT RGB-D</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[9.5px] font-mono text-cyan-400 flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" />
              <span>YOLO26s-seg • {detectedCount}/8 classes</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title={isExpanded ? 'Réduire' : 'Développer'}
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Badge d'intégrité scientifique (fixe) */}
      <div className="px-2 py-0.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[9px] font-mono flex-shrink-0">
        <span className="text-amber-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>{isSimulationMode ? 'SIMULATION CALIBRÉE' : 'YOLO26s CONNECTÉE'}</span>
        </span>
        <span className="text-slate-400">1024×768</span>
      </div>

      {/* 3. Contenu des 8/8 classes (compact, sans scroll si hauteur suffisante, overflow-y-auto si réduit) */}
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-1 font-mono text-[10.5px]">
          {detections.map((item) => {
            const classDef = getInstrumentClassById(item.class_id);
            const isSelected = item.instance_id === selectedInstanceId;
            const coordsMm = formatCoordinatesMm(item.position_3d, item.class_id);

            return (
              <div
                key={item.instance_id}
                onClick={() => onSelect(isSelected ? null : item.instance_id)}
                className={`py-1 px-2 rounded-lg border transition cursor-pointer flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-750 hover:bg-slate-900/40'
                }`}
              >
                {/* Ligne 1 : ID, nom et score de confiance */}
                <div className="flex items-center justify-between leading-tight">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: classDef.color }}
                    />
                    <span className="text-cyan-400 font-bold text-[10px]">0{item.class_id}</span>
                    <span className="text-slate-200 font-semibold truncate text-[10.5px]">
                      {item.class_name}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[9.5px]">
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Ligne 2 : Centroïde 2D image (pixels) & Pose 3D (mm) */}
                <div className="flex items-center justify-between text-[8.5px] text-slate-400 border-t border-slate-900 pt-0.5 leading-tight">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Target className="w-2.5 h-2.5 text-indigo-400" />
                    <span>UV:[{item.center_x},{item.center_y}]</span>
                  </span>
                  <span className="text-cyan-300 font-mono">
                    XYZ:[{coordsMm.xMm.startsWith('-') ? coordsMm.xMm : `+${coordsMm.xMm}`},{coordsMm.yMm.startsWith('-') ? coordsMm.yMm : `+${coordsMm.yMm}`},{coordsMm.zMm}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
