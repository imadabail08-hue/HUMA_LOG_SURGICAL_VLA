import { DetectionItem, Position3D } from '../../types/detection';
import { getInstrumentClassById } from '../../data/instruments';
import { formatCoordinatesMm, worldToTrayLocalPosition } from '../../utils/coordinateTransforms';
import { getStatusBadgeColor } from '../../utils/colors';
import {
  X,
  Target,
  Activity,
  Sliders,
  ShieldCheck,
  EyeOff,
  Move,
  Ruler,
  Wrench,
  RotateCcw
} from 'lucide-react';

interface InstrumentInspectorProps {
  detection?: DetectionItem;
  onClose: () => void;
  onUpdatePosition?: (instanceId: number, pos: Position3D) => void;
  onToggleOcclusion?: (instanceId: number) => void;
  isSimulationMode?: boolean;
}

export function InstrumentInspector({
  detection,
  onClose,
  onUpdatePosition,
  onToggleOcclusion,
  isSimulationMode = true
}: InstrumentInspectorProps) {
  if (!detection) return null;

  const classDef = getInstrumentClassById(detection.class_id);
  const coordsMm = formatCoordinatesMm(detection.position_3d, detection.class_id);
  const localPos = worldToTrayLocalPosition(detection.position_3d, detection.class_id);
  const statusBadge = getStatusBadgeColor(detection.status);

  const handleNudge = (axis: 'x' | 'y' | 'z', delta: number) => {
    if (!onUpdatePosition) return;
    const current = { ...detection.position_3d };
    current[axis] = Number((current[axis] + delta).toFixed(4));
    onUpdatePosition(detection.instance_id, current);
  };

  return (
    <div className="w-full max-w-[380px] bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 p-4 shadow-2xl text-slate-200 space-y-3.5 max-h-[85vh] overflow-y-auto">
      {/* 1. En-tête avec pastille de couleur imposée */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full shadow-lg flex-shrink-0"
            style={{
              backgroundColor: classDef.color,
              boxShadow: `0 0 14px ${classDef.color}`
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                YOLO ID: #{detection.class_id.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Inst: #{detection.instance_id}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide font-sans mt-0.5">
              {classDef.french_name}
            </h3>
            <p className="text-[11px] text-cyan-400 font-mono italic">
              {detection.class_name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Fermer et revenir à la vue générale"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Statut et indice de confiance */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-400" /> Suivi
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
            {statusBadge.label}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Confiance
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {(detection.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 3. Coordonnées spatiales [X, Y, Z] et orientation Yaw */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" /> Coordonnées Repère Plateau
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Yaw: {detection.rotation_3d?.yaw?.toFixed(2) ?? '0.00'} rad</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
          <div className="p-1.5 rounded bg-slate-900 border border-red-500/30">
            <div className="text-[9px] text-red-400 font-bold">X (Latéral)</div>
            <div className="text-xs font-bold text-white mt-0.5">{coordsMm.xMm} mm</div>
            <div className="text-[9px] text-slate-500">{localPos.x.toFixed(3)} m</div>
          </div>

          <div className="p-2 rounded bg-slate-900 border border-green-500/30">
            <div className="text-[9px] text-green-400 font-bold">Y (Long.)</div>
            <div className="text-xs font-bold text-white mt-0.5">{coordsMm.yMm} mm</div>
            <div className="text-[9px] text-slate-500">{localPos.y.toFixed(3)} m</div>
          </div>

          <div className="p-1.5 rounded bg-slate-900 border border-blue-500/30">
            <div className="text-[9px] text-blue-400 font-bold">Z (Hauteur)</div>
            <div className="text-xs font-bold text-white mt-0.5">{coordsMm.zMm} mm</div>
            <div className="text-[9px] text-slate-500">{localPos.z.toFixed(3)} m</div>
          </div>
        </div>
      </div>

      {/* 4. Caractéristiques physiques & Dimensionnelles */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2">
        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1 text-cyan-400 font-mono">
            <Ruler className="w-3.5 h-3.5" /> Dimensions Estimées
          </span>
          <span className="text-slate-400 font-mono text-[10px]">
            Poids: ~{classDef.weight_g} g
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center font-mono text-[11px]">
          <div className="p-1 rounded bg-slate-900/60">
            <span className="text-slate-500 block text-[9px]">Longueur</span>
            <span className="text-white font-bold">{classDef.length_mm} mm</span>
          </div>
          <div className="p-1 rounded bg-slate-900/60">
            <span className="text-slate-500 block text-[9px]">Largeur</span>
            <span className="text-white font-bold">{classDef.width_mm} mm</span>
          </div>
          <div className="p-1 rounded bg-slate-900/60">
            <span className="text-slate-500 block text-[9px]">Épaisseur</span>
            <span className="text-white font-bold">{classDef.thickness_mm} mm</span>
          </div>
        </div>

        <div className="pt-1 text-[11px] text-slate-400 font-mono">
          <span>Matériau : </span>
          <span className="text-slate-200 font-semibold">{classDef.material}</span>
          <span className="block text-[10px] text-slate-500 mt-0.5">Finition : {classDef.finish}</span>
        </div>
      </div>

      {/* 5. Détails anatomiques et mécaniques reconnaissables */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 font-mono">
          <Wrench className="w-3.5 h-3.5 text-indigo-400" /> Détails Mécaniques Observés
        </div>
        <ul className="space-y-1 font-mono text-[10px] text-slate-400">
          {classDef.mechanical_features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Rôle clinique */}
      <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Rôle Clinique
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          {classDef.clinical_purpose}
        </p>
      </div>

      {/* 7. Contrôles de simulation */}
      {isSimulationMode && (
        <div className="pt-2 border-t border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> Ajustement Simulation
            </span>
            <span className="text-[10px] text-amber-400">Mode Démo</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Nudge X :</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNudge('x', -0.005)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                -5mm
              </button>
              <button
                onClick={() => handleNudge('x', 0.005)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                +5mm
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Nudge Y :</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNudge('y', -0.005)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                -5mm
              </button>
              <button
                onClick={() => handleNudge('y', 0.005)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                +5mm
              </button>
            </div>
          </div>

          {onToggleOcclusion && (
            <button
              onClick={() => onToggleOcclusion(detection.instance_id)}
              className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center justify-center gap-1.5"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>
                {detection.status === 'occluded' ? 'Rétablir détection' : 'Simuler occultation'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 8. Bouton pour revenir à la vue générale */}
      <button
        onClick={onClose}
        className="w-full py-2 px-3 rounded-lg font-mono text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
        <span>Revenir à la vue d'ensemble</span>
      </button>
    </div>
  );
}
