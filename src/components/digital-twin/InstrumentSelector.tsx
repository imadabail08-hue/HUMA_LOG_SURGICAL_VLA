import { memo } from 'react';
import { DetectionItem } from '../../types/detection';
import { getInstrumentClassById } from '../../data/instruments';

interface InstrumentSelectorProps {
  detections: DetectionItem[];
  selectedInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  onHover?: (instanceId: number | null) => void;
}

// Ordre physique strict de gauche à droite dans la boîte avec libellés courts
const PHYSICAL_ORDER_SHORT_NAMES: Record<number, string> = {
  3: '03 Aiguille',
  7: '07 Manche',
  1: '01 Pince',
  4: '04 Sonde',
  0: '00 Ciseaux',
  2: '02 Bistouri',
  6: '06 Stylet',
  5: '05 Pince'
};

export const InstrumentSelector = memo(function InstrumentSelector({
  detections,
  selectedInstanceId,
  onSelect,
  onHover
}: InstrumentSelectorProps) {
  // Tri selon la position X réelle de gauche à droite
  const sortedDetections = [...detections].sort(
    (a, b) => a.position_3d.x - b.position_3d.x
  );

  return (
    <div className="w-full grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5 select-none">
      {sortedDetections.map((d) => {
        const classDef = getInstrumentClassById(d.class_id);
        const isSelected = d.instance_id === selectedInstanceId;
        const shortName = PHYSICAL_ORDER_SHORT_NAMES[d.class_id] ?? `0${d.class_id} ${classDef.french_name.split(' ')[0]}`;

        return (
          <button
            key={d.instance_id}
            onClick={() => onSelect(isSelected ? null : d.instance_id)}
            onMouseEnter={() => onHover?.(d.instance_id)}
            onMouseLeave={() => onHover?.(null)}
            className={`px-1.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition border whitespace-nowrap min-w-0 w-full ${
              isSelected
                ? 'bg-slate-800 text-white ring-2 shadow-md'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-850 hover:text-white border-slate-800'
            }`}
            style={{
              borderColor: isSelected ? classDef.color : undefined,
              boxShadow: isSelected ? `0 0 10px ${classDef.color}60` : undefined
            }}
            title={`#0${d.class_id} : ${classDef.french_name} (${d.class_name})`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: classDef.color,
                boxShadow: isSelected ? `0 0 6px ${classDef.color}` : undefined
              }}
            />
            <span className="whitespace-nowrap">{shortName}</span>
          </button>
        );
      })}
    </div>
  );
});
