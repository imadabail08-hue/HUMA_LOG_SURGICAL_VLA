import { memo } from 'react';
import {
  Boxes,
  CheckCircle2,
  Cpu,
  Clock,
  Radio,
  Timer
} from 'lucide-react';

interface KPICardsProps {
  totalInstruments: number;
  detectedCount: number;
  classesCount: number;
  mode: 'simulation' | 'connected';
  isConnected: boolean;
  processingTimeMs: number;
  lastUpdated: string;
}

export const KPICards = memo(function KPICards({
  totalInstruments,
  detectedCount,
  classesCount,
  mode,
  isConnected,
  processingTimeMs,
  lastUpdated
}: KPICardsProps) {
  const isSimulation = mode === 'simulation';
  const detectionRate = totalInstruments > 0 ? Math.round((detectedCount / totalInstruments) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Instruments Totaux */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Total Scène</span>
          <Boxes className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-white">{totalInstruments}</span>
          <span className="text-xs text-slate-500 font-mono">instances</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Kit chirurgical complet</div>
      </div>

      {/* 2. Instruments Détectés */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Détectés</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-emerald-400">{detectedCount}</span>
          <span className="text-xs text-emerald-500/80 font-mono font-bold">({detectionRate}%)</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Visibilité active</div>
      </div>

      {/* 3. Classes Représentées */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Classes Actives</span>
          <Cpu className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-white">{classesCount}</span>
          <span className="text-xs text-slate-500 font-mono">/ 8</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Nomenclature officielle</div>
      </div>

      {/* 4. Mode Actuel */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Mode Système</span>
          <Radio className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isSimulation ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`text-sm font-extrabold font-mono ${
              isSimulation ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isSimulation ? 'SIMULATION' : 'CONNECTÉ'}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5 truncate">
          {isConnected ? 'Moteur opérationnel' : 'En attente serveur'}
        </div>
      </div>

      {/* 5. Latence Inférence Simulée */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Temps Inférence</span>
          <Timer className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black font-mono text-cyan-300">
            {processingTimeMs}
          </span>
          <span className="text-xs text-slate-500 font-mono">ms</span>
        </div>
        <div className="text-[10px] text-amber-400/90 font-mono mt-1 font-semibold">
          ★ Valeur de démonstration
        </div>
      </div>

      {/* 6. Horodatage Dernière Trame */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider">Dernière Trame</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-sm font-bold font-mono text-slate-200 mt-1 truncate">
          {new Date(lastUpdated).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
        <div className="text-[10px] text-slate-500 mt-1 truncate">Fréquence ~30 Hz</div>
      </div>
    </div>
  );
});

