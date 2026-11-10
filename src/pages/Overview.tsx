import { useState, useMemo } from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { SimulationControls } from '../components/dashboard/SimulationControls';
import { DigitalTwinCanvas } from '../components/digital-twin/DigitalTwinCanvas';
import { InstrumentInspector } from '../components/digital-twin/InstrumentInspector';
import { InstrumentsTable } from '../components/dashboard/InstrumentsTable';
import { DetectionPayload, Position3D } from '../types/detection';
import { INSTRUMENT_CLASSES_LIST } from '../data/instruments';
import { INITIAL_MOCK_DETECTIONS } from '../data/mockDetections';
import { Sparkles, Layers, ShieldCheck, Compass } from 'lucide-react';

interface OverviewPageProps {
  payload: DetectionPayload;
  selectedInstanceId: number | null;
  hoveredInstanceId: number | null;
  isPlaying: boolean;
  onSelect: (instanceId: number | null) => void;
  onHover: (instanceId: number | null) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onUpdatePosition: (instanceId: number, pos: Position3D) => void;
  onToggleOcclusion: (instanceId: number) => void;
  onNavigateToDigitalTwin: () => void;
}

export function OverviewPage({
  payload,
  selectedInstanceId,
  hoveredInstanceId,
  isPlaying,
  onSelect,
  onHover,
  onTogglePlay,
  onReset,
  onUpdatePosition,
  onToggleOcclusion,
  onNavigateToDigitalTwin
}: OverviewPageProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | null>(null);

  // Filtrage selon sélection de classe si actif
  const displayedDetections = useMemo(() => {
    if (selectedClassFilter === null) return payload.detections;
    return payload.detections.filter((d) => d.class_id === selectedClassFilter);
  }, [payload.detections, selectedClassFilter]);

  // Instrument sélectionné avec coordonnées figées sans micro-variations pendant l'inspection
  const selectedItem = useMemo(() => {
    if (selectedInstanceId === null) return null;
    const base = INITIAL_MOCK_DETECTIONS.find((b) => b.instance_id === selectedInstanceId);
    const item = payload.detections.find((d) => d.instance_id === selectedInstanceId);
    if (!item) return null;
    if (base) {
      return {
        ...item,
        position_3d: { ...base.position_3d }
      };
    }
    return item;
  }, [payload.detections, selectedInstanceId]);

  const detectedCount = payload.detections.filter((d) => d.status === 'detected' || d.status === 'tracking').length;
  const uniqueClassesCount = new Set(payload.detections.map((d) => d.class_id)).size;

  return (
    <div className="space-y-4 p-4 lg:p-6 max-w-[1700px] mx-auto">
      {/* 1. KPI Cards */}
      <KPICards
        totalInstruments={payload.detections.length}
        detectedCount={detectedCount}
        classesCount={uniqueClassesCount}
        mode={payload.mode}
        isConnected={payload.system_status?.yolo_connected ?? true}
        processingTimeMs={payload.processing_time_ms}
        lastUpdated={payload.timestamp}
      />

      {/* 2. Barre d'outils de simulation */}
      <SimulationControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onReset={onReset}
        selectedClassId={selectedClassFilter}
        onSelectClassFilter={setSelectedClassFilter}
      />

      {/* 3. Section Principale : 3D Scene + Volet Latéral d'Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vue 3D interactive */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between pb-2 px-1 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Compass className="w-4 h-4 text-cyan-400" />
              JUMEAU NUMÉRIQUE 3D DU PLATEAU CHIRURGICAL
            </span>
            <button
              onClick={onNavigateToDigitalTwin}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
            >
              <span>Mode Plein Écran & Calibration →</span>
            </button>
          </div>

          <DigitalTwinCanvas
            detections={displayedDetections}
            selectedInstanceId={selectedInstanceId}
            hoveredInstanceId={hoveredInstanceId}
            onSelect={onSelect}
            onHover={onHover}
            onUpdatePosition={onUpdatePosition}
            onToggleOcclusion={onToggleOcclusion}
            isSimulationMode={payload.mode === 'simulation'}
            heightClass="h-[560px]"
          />
        </div>

        {/* Volet droit : Inspecteur d'instrument ou Synthèse */}
        <div className="lg:col-span-4 flex flex-col justify-start space-y-4">
          {selectedItem ? (
            <InstrumentInspector
              detection={selectedItem}
              onClose={() => onSelect(null)}
              onUpdatePosition={onUpdatePosition}
              onToggleOcclusion={onToggleOcclusion}
              isSimulationMode={payload.mode === 'simulation'}
            />
          ) : (
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
                  <Sparkles className="w-4 h-4" />
                  Guide d'Inspection Interactive
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Sélectionnez un instrument
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cliquez sur n'importe quel instrument dans la scène 3D ou dans le tableau ci-dessous pour afficher sa fiche d'inspection, ses coordonnées [X, Y, Z] et son statut de détection.
                </p>
              </div>

              {/* Répertoire des 8 classes avec codes hex officiels */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Nomenclature Officielle (8 Classes)
                </div>

                <div className="flex flex-col gap-1 font-mono text-[11px]">
                  {INSTRUMENT_CLASSES_LIST.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => {
                        const inst = payload.detections.find((d) => d.class_id === cls.id);
                        if (inst) onSelect(inst.instance_id);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/80 cursor-pointer flex items-center justify-between transition group"
                      title={`Sélectionner et zoomer sur ${cls.name} (${cls.french_name})`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-white/20"
                          style={{ backgroundColor: cls.color }}
                        />
                        <span className="text-cyan-400 font-bold">0{cls.id}</span>
                        <span className="text-slate-200 font-semibold group-hover:text-white transition">
                          {cls.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans italic ml-2 text-right whitespace-nowrap">
                        {cls.french_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rôle académique et VLA */}
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Note Soutenance Jury
                </div>
                <p className="text-[11px] leading-relaxed">
                  Les 8 instruments sont modélisés selon leurs géométries chirurgicales réelles (lames, anneaux, cannelures). Les données sont générées par le moteur de simulation en attendant le flux du modèle YOLO26s-seg.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Tableau synoptique des instruments */}
      <InstrumentsTable
        detections={displayedDetections}
        selectedInstanceId={selectedInstanceId}
        hoveredInstanceId={hoveredInstanceId}
        onSelect={onSelect}
        onHover={onHover}
      />
    </div>
  );
}

