import { memo } from 'react';
import { CameraPreset } from '../../scene/SceneCamera';
import { BoxInteriorStyle } from '../../scene/MedicalInstrumentBox';
import { LightingMode } from '../../scene/SceneLighting';
import {
  Box,
  ArrowDown,
  Layers,
  Sparkles,
  Bot,
  Tag,
  Maximize2,
  Crosshair,
  Sun,
  Zap
} from 'lucide-react';

interface CameraToolbarProps {
  currentPreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  showFOV: boolean;
  onToggleFOV: () => void;
  showRobot: boolean;
  onToggleRobot: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  show3DBBox: boolean;
  onToggle3DBBox: () => void;
  showGraspPose: boolean;
  onToggleGraspPose: () => void;
  interiorStyle: BoxInteriorStyle;
  onToggleInteriorStyle: () => void;
  lightingMode: LightingMode;
  onCycleLightingMode: () => void;
  hasSelection?: boolean;
  onClearSelection?: () => void;
  onSimulateGrasp?: () => void;
  isGrasping?: boolean;
}

/**
 * Barre de contrôle haute précision pour le Digital Twin HUMA-LOG VLA :
 * - Presets caméra : Boîte 3D, Caméra RGB-D, Zénithale, Iso 45°, Salle Complète
 * - Toggles robotiques & VLA : BBox 3D, Grasp Poses, Badges, FOV, Robot
 * - Rendu & Photoréalisme : Éclairage (Chirurgie / Ambiance / UV Stérile), Boîtier (Velours Rouge / Mousse / Sangles)
 * - Actionneur : Simulation de saisie robotisée
 */
export const CameraToolbar = memo(function CameraToolbar({
  currentPreset,
  onSelectPreset,
  showFOV,
  onToggleFOV,
  showRobot,
  onToggleRobot,
  showLabels,
  onToggleLabels,
  show3DBBox,
  onToggle3DBBox,
  showGraspPose,
  onToggleGraspPose,
  interiorStyle,
  onToggleInteriorStyle,
  lightingMode,
  onCycleLightingMode,
  hasSelection = false,
  onClearSelection,
  onSimulateGrasp,
  isGrasping = false
}: CameraToolbarProps) {
  // Label du mode d'éclairage
  const lightingLabel =
    lightingMode === 'surgery' ? 'Scialytique' : lightingMode === 'ambient' ? 'Ambiance' : 'UV Stérile';

  // Label du style de boîte
  const styleLabel =
    interiorStyle === 'red_velvet' ? 'Velours Rouge' : interiorStyle === 'eva_foam' ? 'Mousse EVA' : 'Sangles';

  return (
    <div className="w-full h-auto py-1.5 px-3 flex flex-wrap items-center justify-between gap-1.5 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-[11px] font-mono select-none flex-shrink-0 z-20">
      {/* GROUPE GAUCHE : 5 PRESETS CAMÉRA AVEC LABELS COURTS */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Preset 1 : Boîte 3D (DÉFAUT) */}
        <button
          onClick={() => {
            if (hasSelection && onClearSelection) onClearSelection();
            onSelectPreset('box');
          }}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap border cursor-pointer ${
            currentPreset === 'box' && !hasSelection
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-750'
          }`}
          title="Vue serrée sur la trousse (80% du champ)"
        >
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>Boîte 3D</span>
        </button>

        {/* Preset 2 : Caméra RGB-D */}
        <button
          onClick={() => {
            if (hasSelection && onClearSelection) onClearSelection();
            onSelectPreset('robot_pov');
          }}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap border cursor-pointer ${
            currentPreset === 'robot_pov' && !hasSelection
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-750'
          }`}
          title="Vue plongeante subjective depuis le capteur stéréo du robot"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>Caméra RGB-D</span>
        </button>

        {/* Preset 3 : Zénithale */}
        <button
          onClick={() => {
            if (hasSelection && onClearSelection) onClearSelection();
            onSelectPreset('top_down');
          }}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap border cursor-pointer ${
            currentPreset === 'top_down' && !hasSelection
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-750'
          }`}
          title="Vue 90° verticale stricte sur les 8 instruments"
        >
          <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
          <span>Zénithale</span>
        </button>

        {/* Preset 4 : Iso 45° */}
        <button
          onClick={() => {
            if (hasSelection && onClearSelection) onClearSelection();
            onSelectPreset('isometric');
          }}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap border cursor-pointer ${
            currentPreset === 'isometric' && !hasSelection
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-750'
          }`}
          title="Vue isométrique 45° serrée"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Iso 45°</span>
        </button>

        {/* Preset 5 : Salle Complète */}
        <button
          onClick={() => {
            if (hasSelection && onClearSelection) onClearSelection();
            onSelectPreset('overview');
          }}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap border cursor-pointer ${
            currentPreset === 'overview' && !hasSelection
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-750'
          }`}
          title="Vue générale large de toute la salle opératoire"
        >
          <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Salle Complète</span>
        </button>
      </div>

      {/* GROUPE DROIT : TOGGLES ROBOTIQUES, ÉCLAIRAGE ET ACTIONS */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* BOUTON ACTION RAPIDE : SIMULER SAISIE ROBOTIQUE (SI UN OUTIL EST CHOISI) */}
        {hasSelection && onSimulateGrasp && (
          <button
            onClick={onSimulateGrasp}
            disabled={isGrasping}
            className={`px-2.5 py-1 rounded flex items-center gap-1 text-[11px] whitespace-nowrap font-bold transition-all shadow-md cursor-pointer ${
              isGrasping
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/60 shadow-cyan-500/30'
            }`}
            title="Activer le préhenseur robotique VLA sur l'instrument sélectionné"
          >
            <Zap className="w-3 h-3 text-cyan-200" />
            <span>{isGrasping ? 'Préhension...' : 'Simuler Saisie'}</span>
          </button>
        )}

        {/* TOGGLE : 3D BOUNDING BOXES */}
        <button
          onClick={onToggle3DBBox}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            show3DBBox
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Afficher/masquer les 3D Bounding Boxes orientées des 8 instruments"
        >
          <Box className="w-3 h-3 text-cyan-400" />
          <span>BBox 3D</span>
        </button>

        {/* TOGGLE : GRASP POSE (VLA) */}
        <button
          onClick={onToggleGraspPose}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            showGraspPose
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Afficher/masquer les points et vecteurs d'approche de préhension robotique"
        >
          <Crosshair className="w-3 h-3 text-emerald-400" />
          <span>Grasp</span>
        </button>

        {/* TOGGLE : ÉCLAIRAGE (SCIALYTIQUE / AMBIANCE / UV STÉRILE) */}
        <button
          onClick={onCycleLightingMode}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            lightingMode === 'uv_sterile'
              ? 'bg-purple-500/25 text-purple-300 border-purple-500/50 font-bold'
              : lightingMode === 'ambient'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
              : 'bg-slate-900 text-slate-300 border-slate-750'
          }`}
          title="Basculer le mode d'éclairage : Scialytique (Blanc) / Ambiance (Bleu) / UV Stérile (Fluo)"
        >
          <Sun className={`w-3 h-3 ${lightingMode === 'uv_sterile' ? 'text-purple-400' : 'text-amber-400'}`} />
          <span>{lightingLabel}</span>
        </button>

        {/* TOGGLE : STYLE BOÎTIER (VELOURS ROUGE / MOUSSE EVA / SANGLES) */}
        <button
          onClick={onToggleInteriorStyle}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            interiorStyle === 'red_velvet'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
          }`}
          title="Basculer le support : Trousse velours rouge (Photo réelle) / Mousse EVA / Sangles"
        >
          <Layers className="w-3 h-3" />
          <span>{styleLabel}</span>
        </button>

        {/* TOGGLE : BADGES */}
        <button
          onClick={onToggleLabels}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            showLabels
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Afficher/masquer les pastilles de classe"
        >
          <Tag className="w-3 h-3" />
          <span>Badges</span>
        </button>

        {/* TOGGLE : FOV */}
        <button
          onClick={onToggleFOV}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            showFOV
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Afficher/masquer le cône optique FOV"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${showFOV ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>FOV</span>
        </button>

        {/* TOGGLE : ROBOT */}
        <button
          onClick={onToggleRobot}
          className={`px-2 py-0.5 rounded transition flex items-center gap-1 text-[10.5px] whitespace-nowrap border cursor-pointer ${
            showRobot
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Afficher/masquer le robot AGV et le personnel médical"
        >
          <Bot className="w-3 h-3" />
          <span>Robot</span>
        </button>
      </div>
    </div>
  );
});
