import { useMemo } from 'react';
import { DigitalTwinCanvas } from '../components/digital-twin/DigitalTwinCanvas';
import { AIVisionPanel } from '../components/digital-twin/AIVisionPanel';
import { InstrumentInspector } from '../components/digital-twin/InstrumentInspector';
import { DetectionPayload, Position3D } from '../types/detection';
import { Box, Sparkles, Layers } from 'lucide-react';

interface DigitalTwinPageProps {
  payload: DetectionPayload;
  selectedInstanceId: number | null;
  hoveredInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  onHover: (instanceId: number | null) => void;
  onUpdatePosition: (instanceId: number, pos: Position3D) => void;
  onToggleOcclusion: (instanceId: number) => void;
}

/**
 * Page Jumeau Numérique 3D — Vue plein écran calibrée sans scroll vertical
 * Layout strict : Canvas 3D à gauche (1fr) + Panneau Vision IA à droite (320px)
 */
export function DigitalTwinPage({
  payload,
  selectedInstanceId,
  hoveredInstanceId,
  onSelect,
  onHover,
  onUpdatePosition,
  onToggleOcclusion
}: DigitalTwinPageProps) {
  // Instrument sélectionné pour la colonne d'inspection dédiée
  const selectedItem = useMemo(() => {
    if (selectedInstanceId === null) return null;
    return payload.detections.find((d) => d.instance_id === selectedInstanceId) ?? null;
  }, [payload.detections, selectedInstanceId]);

  return (
    <div className="h-[calc(100vh-64px)] p-3 pt-3 flex flex-col gap-2 overflow-hidden w-full">
      {/* 1. EN-TÊTE COMPACT TOTALEMENT VISIBLE SANS ROGNAGE (FLEX-SHRINK-0) */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <h2 className="text-sm font-black text-white font-mono tracking-wide">
            DIGITAL TWIN 3D — BLOC OPÉRATOIRE & VALISE CHIRURGICALE
          </h2>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
            • AGV en [0, 0, -1.15] • Équipe en [-1.5, 0, -2.8]
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>WebGL PBR</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>8 Classes</span>
          </span>
        </div>
      </div>

      {/* 2. LAYOUT GRID STRICT CÔTE À CÔTE SANS SCROLL VERTICAL : [1FR_320PX] */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-2.5 flex-1 min-h-0 overflow-hidden w-full">
        {/* Colonne gauche : Canvas 3D (remplit 100% de la hauteur disponible) */}
        <div className="h-full min-h-0 w-full flex flex-col overflow-hidden">
          <DigitalTwinCanvas
            detections={payload.detections}
            selectedInstanceId={selectedInstanceId}
            hoveredInstanceId={hoveredInstanceId}
            onSelect={onSelect}
            onHover={onHover}
            onUpdatePosition={onUpdatePosition}
            onToggleOcclusion={onToggleOcclusion}
            isSimulationMode={payload.mode === 'simulation'}
            heightClass="h-full"
          />
        </div>

        {/* Colonne droite dédiée fixe (320px) : Toujours visible sur le même écran */}
        <div className="h-full min-h-0 w-full lg:w-[320px] flex flex-col overflow-hidden">
          {selectedItem ? (
            <InstrumentInspector
              detection={selectedItem}
              onClose={() => onSelect(null)}
              onUpdatePosition={onUpdatePosition}
              onToggleOcclusion={onToggleOcclusion}
              isSimulationMode={payload.mode === 'simulation'}
            />
          ) : (
            <AIVisionPanel
              detections={payload.detections}
              selectedInstanceId={selectedInstanceId}
              onSelect={onSelect}
              isSimulationMode={payload.mode === 'simulation'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
