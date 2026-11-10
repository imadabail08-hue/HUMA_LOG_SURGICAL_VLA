import { memo } from 'react';
import { DetectionItem } from '../../types/detection';
import { getInstrumentClassById } from '../../data/instruments';
import { formatCoordinatesMm } from '../../utils/coordinateTransforms';
import { getStatusBadgeColor } from '../../utils/colors';
import { Sparkles, Eye, Target } from 'lucide-react';

interface InstrumentsTableProps {
  detections: DetectionItem[];
  selectedInstanceId: number | null;
  hoveredInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  onHover: (instanceId: number | null) => void;
}

export const InstrumentsTable = memo(function InstrumentsTable({
  detections,
  selectedInstanceId,
  hoveredInstanceId,
  onSelect,
  onHover
}: InstrumentsTableProps) {
  return (
    <div className="w-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* En-tête du tableau */}
      <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white font-mono tracking-wide">
            SYNOPTIQUE DES INSTRUMENTS DÉTECTÉS
          </h2>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            {detections.length} instances
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cliquer sur une ligne synchronise la sélection 3D</span>
        </div>
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0b121e] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Couleur</th>
              <th className="py-2.5 px-3">Class ID</th>
              <th className="py-2.5 px-3">Instance ID</th>
              <th className="py-2.5 px-3">Nom de classe (IA)</th>
              <th className="py-2.5 px-3">Nom Clinique (FR)</th>
              <th className="py-2.5 px-3 text-right">X (mm)</th>
              <th className="py-2.5 px-3 text-right">Y (mm)</th>
              <th className="py-2.5 px-3 text-right">Z (mm)</th>
              <th className="py-2.5 px-3 text-center">Confiance</th>
              <th className="py-2.5 px-3 text-center">État Détection</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {detections.map((item) => {
              const classDef = getInstrumentClassById(item.class_id);
              const coordsMm = formatCoordinatesMm(item.position_3d);
              const isSelected = item.instance_id === selectedInstanceId;
              const isHovered = item.instance_id === hoveredInstanceId;
              const statusBadge = getStatusBadgeColor(item.status);

              return (
                <tr
                  key={item.instance_id}
                  onClick={() => onSelect(isSelected ? null : item.instance_id)}
                  onMouseEnter={() => onHover(item.instance_id)}
                  onMouseLeave={() => onHover(null)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-200 border-l-4'
                      : isHovered
                      ? 'bg-slate-800/50 text-slate-200'
                      : 'hover:bg-slate-800/30 text-slate-300'
                  }`}
                  style={{
                    borderLeftColor: isSelected ? classDef.color : undefined
                  }}
                >
                  {/* Pastille de couleur imposée */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block shadow-sm transition-transform"
                        style={{
                          backgroundColor: classDef.color,
                          boxShadow: isSelected ? `0 0 10px ${classDef.color}` : undefined,
                          transform: isSelected ? 'scale(1.25)' : 'scale(1)'
                        }}
                      />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {classDef.color}
                      </span>
                    </div>
                  </td>

                  {/* Class ID */}
                  <td className="py-2.5 px-3 font-bold text-white">
                    0{item.class_id}
                  </td>

                  {/* Instance ID */}
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">
                    #{item.instance_id}
                  </td>

                  {/* Nom de classe technique */}
                  <td className="py-2.5 px-3 font-medium text-slate-200">
                    {item.class_name}
                  </td>

                  {/* Nom en français */}
                  <td className="py-2.5 px-3 text-slate-400 italic font-sans text-[11px]">
                    {classDef.french_name}
                  </td>

                  {/* X (mm) */}
                  <td className="py-2.5 px-3 text-right font-bold text-red-400/90">
                    {coordsMm.xMm}
                  </td>

                  {/* Y (mm) */}
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-400/90">
                    {coordsMm.yMm}
                  </td>

                  {/* Z (mm) */}
                  <td className="py-2.5 px-3 text-right font-bold text-blue-400/90">
                    {coordsMm.zMm}
                  </td>

                  {/* Confiance */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-emerald-400 font-bold">
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* État de détection */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                    >
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(isSelected ? null : item.instance_id);
                      }}
                      className={`p-1 rounded text-xs transition ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Inspecter dans la scène 3D"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

