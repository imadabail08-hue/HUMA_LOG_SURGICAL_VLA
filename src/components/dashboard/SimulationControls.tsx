import { memo } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Filter } from 'lucide-react';
import { INSTRUMENT_CLASSES_LIST } from '../../data/instruments';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  selectedClassId: number | null;
  onSelectClassFilter: (classId: number | null) => void;
}

export const SimulationControls = memo(function SimulationControls({
  isPlaying,
  onTogglePlay,
  onReset,
  selectedClassId,
  onSelectClassFilter
}: SimulationControlsProps) {
  return (
    <div className="w-full bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Contrôles du moteur de simulation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'PAUSE FLUX' : 'REPRENDRE FLUX'}</span>
        </button>

        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
          title="Réinitialiser les coordonnées à l'état nominal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET SCÈNE</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Micro-variations submillimétriques : Actives</span>
        </div>
      </div>

      {/* Sélecteur rapide de mise en évidence de classe */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-cyan-400" />
          <span>Isoler classe :</span>
        </span>

        <button
          onClick={() => onSelectClassFilter(null)}
          className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition ${
            selectedClassId === null
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          TOUTES (8)
        </button>

        {INSTRUMENT_CLASSES_LIST.map((cls) => {
          const isCurrent = selectedClassId === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => onSelectClassFilter(isCurrent ? null : cls.id)}
              className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition ${
                isCurrent
                  ? 'ring-2 text-white font-bold bg-slate-800'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
              style={{
                borderColor: isCurrent ? cls.color : undefined,
                boxShadow: isCurrent ? `0 0 8px ${cls.color}60` : undefined
              }}
              title={cls.french_name}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cls.color }}
              />
              <span>{cls.id}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
