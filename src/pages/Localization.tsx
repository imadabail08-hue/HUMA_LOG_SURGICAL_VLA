import { useMemo } from 'react';
import { DetectionPayload, Position3D } from '../types/detection';
import { getInstrumentClassById } from '../data/instruments';
import { formatCoordinatesMm } from '../utils/coordinateTransforms';
import { DigitalTwinCanvas } from '../components/digital-twin/DigitalTwinCanvas';
import { InstrumentInspector } from '../components/digital-twin/InstrumentInspector';
import {
  Crosshair,
  Compass,
  AlertCircle,
  Layers,
  MapPin,
  Move
} from 'lucide-react';

interface LocalizationPageProps {
  payload: DetectionPayload;
  selectedInstanceId: number | null;
  hoveredInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  onHover: (instanceId: number | null) => void;
  onUpdatePosition: (instanceId: number, pos: Position3D) => void;
  onToggleOcclusion: (instanceId: number) => void;
}

export function LocalizationPage({
  payload,
  selectedInstanceId,
  hoveredInstanceId,
  onSelect,
  onHover,
  onUpdatePosition,
  onToggleOcclusion
}: LocalizationPageProps) {
  const selectedItem = useMemo(() => {
    return payload.detections.find((d) => d.instance_id === selectedInstanceId);
  }, [payload.detections, selectedInstanceId]);

  return (
    <div className="p-4 lg:p-6 max-w-[1700px] mx-auto space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            LOCALISATION SPATIALE & REPÈRE PLATEAU [X, Y, Z]
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Estimation métrique des coordonnées dans le repère cartésien direct du plateau chirurgical
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-mono">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>ORIGINE DU REPÈRE : CENTRE GÉOMÉTRIQUE DU PLATEAU [0, 0, 0]</span>
        </div>
      </div>

      {/* Note d'intégrité scientifique obligatoire */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold font-mono">
            RÉSERVE MÉTHODOLOGIQUE SUR LA POSE SPATIALE (SOUTENANCE ACADÉMIQUE)
          </div>
          <p className="text-amber-300/90 leading-relaxed text-[11px]">
            Les coordonnées 3D présentées ci-dessous sont issues du moteur de simulation couplé à une projection cartésienne plane (modèle homographique sténopé). 
            <strong> Le système ne revendique pas une estimation de pose 6D complète (Euler/quaternions réels)</strong> sans l'adjonction d'un capteur RGB-D stéréoscopique ou d'un solveur PnP calibré sur mires ArUco/ChArUco.
          </p>
        </div>
      </div>

      {/* Section 1 : Carte de localisation 2D (Radar Orthographique) + Scène 3D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Vue 3D du plateau avec étiquettes */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Move className="w-4 h-4 text-cyan-400" />
              VISUALISATION INTERACTIVE DU REPÈRE 3D
            </span>
            <span className="text-[11px] text-slate-500">
              Axes X (rouge), Y (vert), Z (bleu)
            </span>
          </div>

          <DigitalTwinCanvas
            detections={payload.detections}
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

        {/* Radar / Plan Orthographique 2D du plateau */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                RADAR ORTHOGRAPHIQUE DU PLATEAU (VUE DU DESSUS)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">380 x 280 mm</span>
            </div>

            {/* Représentation graphique 2D du plateau avec les 8 instruments */}
            <div className="relative w-full h-[320px] bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Grille cartésienne */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 divide-x divide-y divide-slate-800/40 pointer-events-none" />

              {/* Lignes d'axes d'origine */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-green-500/40 pointer-events-none" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-red-500/40 pointer-events-none" />

              {/* Marqueur d'origine */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20 pointer-events-none" />

              {/* Projection des 8 instruments sur le plan 2D */}
              {payload.detections.map((item) => {
                const classDef = getInstrumentClassById(item.class_id);
                // Convertir position métrique [-0.19, 0.19] vers %
                // Largeur plateau = 380 mm (-190 à +190 mm)
                // Profondeur plateau = 280 mm (-140 à +140 mm)
                const leftPercent = 50 + (item.position_3d.x / 0.38) * 100;
                const topPercent = 50 - (item.position_3d.y / 0.28) * 100;
                const isSelected = item.instance_id === selectedInstanceId;

                return (
                  <button
                    key={item.instance_id}
                    onClick={() => onSelect(isSelected ? null : item.instance_id)}
                    onMouseEnter={() => onHover(item.instance_id)}
                    onMouseLeave={() => onHover(null)}
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white ring-2 ring-cyan-400 z-20 scale-110 shadow-lg'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:scale-105 z-10'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: classDef.color }}
                    />
                    <span className="font-bold">0{item.class_id}</span>
                  </button>
                );
              })}

              {/* Légende des axes */}
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500">
                X: [-190, +190] mm • Y: [-140, +140] mm
              </div>
            </div>

            {/* Inspecteur de coordonnées si sélectionné */}
            {selectedItem && (
              <InstrumentInspector
                detection={selectedItem}
                onClose={() => onSelect(null)}
                onUpdatePosition={onUpdatePosition}
                onToggleOcclusion={onToggleOcclusion}
                isSimulationMode={payload.mode === 'simulation'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Section 2 : Tableau métrique détaillé et convention ROS 2 */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              MATRICE DES POSITIONS MÉTRIQUES ET LIENS TRANSFORMS (TF2)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Arbre TF2 ROS 2 : <code className="text-cyan-300">tray_link → instrument_id</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b121e] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Class ID</th>
                <th className="py-2.5 px-3">Nom Instrument</th>
                <th className="py-2.5 px-3 text-right">X (m)</th>
                <th className="py-2.5 px-3 text-right">Y (m)</th>
                <th className="py-2.5 px-3 text-right">Z (m)</th>
                <th className="py-2.5 px-3 text-right">X (mm)</th>
                <th className="py-2.5 px-3 text-right">Y (mm)</th>
                <th className="py-2.5 px-3 text-right">Z (mm)</th>
                <th className="py-2.5 px-3 text-center">Yaw (rad)</th>
                <th className="py-2.5 px-3 text-center">Trame Cible ROS 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payload.detections.map((d) => {
                const classDef = getInstrumentClassById(d.class_id);
                const coordsMm = formatCoordinatesMm(d.position_3d, d.class_id);
                const isSelected = d.instance_id === selectedInstanceId;

                return (
                  <tr
                    key={d.instance_id}
                    onClick={() => onSelect(isSelected ? null : d.instance_id)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 text-cyan-200'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-white">0{d.class_id}</td>
                    <td className="py-2 px-3 flex items-center gap-1.5 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: classDef.color }}
                      />
                      <span>{d.class_name}</span>
                    </td>
                    <td className="py-2 px-3 text-right text-red-400">{d.position_3d.x.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right text-green-400">{d.position_3d.y.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right text-blue-400">{d.position_3d.z.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right font-bold text-red-400">{coordsMm.xMm}</td>
                    <td className="py-2 px-3 text-right font-bold text-green-400">{coordsMm.yMm}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-400">{coordsMm.zMm}</td>
                    <td className="py-2 px-3 text-center text-slate-400">
                      {d.rotation_3d?.yaw?.toFixed(3) ?? '0.000'}
                    </td>
                    <td className="py-2 px-3 text-center text-cyan-400 font-mono text-[11px]">
                      /surgical_tool_{d.instance_id}_frame
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
