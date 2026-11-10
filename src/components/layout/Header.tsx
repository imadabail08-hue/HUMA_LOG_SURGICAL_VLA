import { memo } from 'react';
import {
  Activity,
  Cpu,
  Radio,
  Clock,
  FlaskConical,
  Zap
} from 'lucide-react';

interface HeaderProps {
  mode: 'simulation' | 'connected';
  isConnected: boolean;
  timestamp: string;
  processingTimeMs: number;
  onModeSwitch: (mode: 'simulation' | 'connected') => void;
}

export const Header = memo(function Header({
  mode,
  isConnected,
  timestamp,
  processingTimeMs,
  onModeSwitch
}: HeaderProps) {
  const isSimulation = mode === 'simulation';
  const formattedTime = new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080d17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Titre et Sous-titre officiels */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white font-mono">
                HUMA-LOG SURGICAL-VLA
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                v1.0-RC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI Surgical Instrument Recognition & Digital Twin
            </p>
          </div>
        </div>

        {/* Indicateurs d'état et bannières scientifiques */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* BANNIÈRE PERMANENTE DE DÉMONSTRATION */}
          <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm animate-pulse-subtle">
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span>DEMO MODE — SIMULATED DATA</span>
          </div>

          {/* Statut du mode de fonctionnement */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => onModeSwitch('simulation')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                isSimulation
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>SIMULATION</span>
            </button>
            <button
              onClick={() => onModeSwitch('connected')}
              className={`px-2 py-1 rounded-md flex items-center gap-1 transition ${
                !isSimulation
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>IA CONNECTÉE</span>
            </button>
          </div>

          {/* Statut connexion */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] text-slate-400">Flux :</span>
            <span className="font-semibold text-slate-200">
              {isConnected ? 'EN LIGNE' : 'ATTENTE'}
            </span>
          </div>

          {/* Horodatage */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formattedTime}</span>
          </div>

          {/* Latence estimée */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300"
            title="Temps de traitement simulé à titre de démonstration pour le jury"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-bold">{processingTimeMs} ms</span>
            <span className="text-[10px] text-slate-500">(démo)</span>
          </div>
        </div>
      </div>
    </header>
  );
});

