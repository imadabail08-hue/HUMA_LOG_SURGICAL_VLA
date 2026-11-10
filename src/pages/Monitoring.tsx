import { useState, useEffect } from 'react';
import { DetectionPayload } from '../types/detection';
import { webSocketDetectionService } from '../services/websocketDetectionService';
import {
  ServerCrash,
  Cpu,
  Camera,
  Box,
  Radio,
  Terminal,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface MonitoringPageProps {
  payload: DetectionPayload;
  onModeSwitch: (mode: 'simulation' | 'connected') => void;
}

interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  source: string;
  message: string;
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    time: new Date(Date.now() - 12000).toLocaleTimeString('fr-FR'),
    level: 'info',
    source: 'CORE',
    message: 'Démarrage du sous-système HUMA-LOG SURGICAL-VLA'
  },
  {
    id: '2',
    time: new Date(Date.now() - 9000).toLocaleTimeString('fr-FR'),
    level: 'info',
    source: 'THREE_JS',
    message: 'Contexte WebGL 2.0 instancié avec succès (R3F Scene)'
  },
  {
    id: '3',
    time: new Date(Date.now() - 6000).toLocaleTimeString('fr-FR'),
    level: 'warn',
    source: 'YOLO_INFERENCE',
    message: 'Modèle physique non détecté sur le port local — Bascule automatique vers le moteur de simulation'
  },
  {
    id: '4',
    time: new Date(Date.now() - 3000).toLocaleTimeString('fr-FR'),
    level: 'success',
    source: 'MOCK_ENGINE',
    message: 'Émission continue du flux nominal à 2.0 Hz (8 instances actives)'
  }
];

export function MonitoringPage({ payload, onModeSwitch }: MonitoringPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8765');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('fr-FR');
      const randomLog: LogEntry = {
        id: Math.random().toString(),
        time: now,
        level: 'info',
        source: 'HEARTBEAT',
        message: `Trame #${payload.frame_id} synchronisée — Latence démo ${payload.processing_time_ms} ms`
      };
      setLogs((prev) => [randomLog, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [payload.frame_id, payload.processing_time_ms]);

  const copyJsonPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectWs = () => {
    webSocketDetectionService.setUrl(wsUrl);
    webSocketDetectionService.connect();
    onModeSwitch('connected');
  };

  const isSim = payload.mode === 'simulation';

  return (
    <div className="p-4 lg:p-6 max-w-[1700px] mx-auto space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
            <ServerCrash className="w-5 h-5 text-cyan-400" />
            SUPERVISION SYSTÈME & SANTÉ DE LA PASSERELLE
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic transparent des sous-systèmes d'inférence, flux vidéo, WebGL et connecteur WebSocket
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">
            DIAGNOSTIC TEMPS RÉEL
          </span>
        </div>
      </div>

      {/* Grille des 4 sous-systèmes majeurs avec statuts honnêtes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Inférence YOLO26s-seg */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" /> IA INFERENCE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SIMULATION
            </span>
          </div>

          <div className="text-sm font-bold text-white">YOLO26s-seg Engine</div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Backend réel :</span>
              <span className="text-amber-400">Non connecté</span>
            </div>
            <div className="flex justify-between">
              <span>Générateur :</span>
              <span className="text-emerald-400">Mock Service</span>
            </div>
            <div className="flex justify-between">
              <span>Temps estimé :</span>
              <span className="text-cyan-300">{payload.processing_time_ms} ms</span>
            </div>
          </div>
        </div>

        {/* 2. Flux Vidéo / Caméra */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" /> FLUX VIDÉO
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ÉCHANTILLON TEST
            </span>
          </div>

          <div className="text-sm font-bold text-white">Capture Plateau</div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Caméra physique :</span>
              <span className="text-slate-500">Non raccordée</span>
            </div>
            <div className="flex justify-between">
              <span>Source active :</span>
              <span className="text-cyan-300">Ground Truth HD</span>
            </div>
            <div className="flex justify-between">
              <span>Cadence :</span>
              <span className="text-slate-300">30 FPS (simulé)</span>
            </div>
          </div>
        </div>

        {/* 3. Jumeau Numérique Three.js */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-400" /> JUMEAU 3D
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              OPÉRATIONNEL
            </span>
          </div>

          <div className="text-sm font-bold text-white">Three.js / WebGL 2</div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Moteur de rendu :</span>
              <span className="text-emerald-400">Actif (60 FPS)</span>
            </div>
            <div className="flex justify-between">
              <span>Modèles chargés :</span>
              <span className="text-white">8 procéduraux</span>
            </div>
            <div className="flex justify-between">
              <span>Scène éclairage :</span>
              <span className="text-slate-300">Scialytique PBR</span>
            </div>
          </div>
        </div>

        {/* 4. Passerelle WebSocket */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-blue-400" /> WEBSOCKET
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isSim
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isSim ? 'STANDBY' : 'EN LIGNE'}
            </span>
          </div>

          <div className="text-sm font-bold text-white">Passerelle Python/ROS 2</div>
          <div className="text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Port d'écoute :</span>
              <span className="text-cyan-300">8765</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-reconnect :</span>
              <span className="text-slate-300">Actif (4s)</span>
            </div>
            <div className="flex justify-between">
              <span>Mode actif :</span>
              <span className="text-white font-bold">{payload.mode.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Connexion WebSocket personnalisée */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Configuration du Endpoint WebSocket pour le modèle réel YOLO26s-seg
        </h3>
        <p className="text-xs text-slate-400">
          Lorsque vos collègues lanceront le script d'inférence Python YOLO26s-seg avec le serveur WebSocket intégré, vous pourrez connecter le flux en direct ici.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            placeholder="ws://localhost:8765"
            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleConnectWs}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tenter la Connexion Réelle</span>
          </button>
        </div>
      </div>

      {/* Double console : Logs système & Inspecteur JSON de payload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Console de logs */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              CONSOLE D'ÉVÉNEMENTS SYSTÈME (LIVE)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Buffer: 20 entrées</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-1.5 rounded bg-slate-950/70 border border-slate-900 flex items-start gap-2"
              >
                <span className="text-slate-500">{log.time}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                    log.level === 'warn'
                      ? 'bg-amber-500/20 text-amber-300'
                      : log.level === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : log.level === 'error'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {log.source}
                </span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inspecteur de payload JSON formaté */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              PAYLOAD JSON ENTRANT (STRUCTURE OFFICIELLE)
            </h3>

            <button
              onClick={copyJsonPayload}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
            </button>
          </div>

          <pre className="h-64 overflow-y-auto p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-cyan-300/90 leading-tight">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
