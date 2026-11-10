import { memo } from 'react';
import {
  Network,
  Code2,
  FileCode,
  Award,
  Bot
} from 'lucide-react';

export const AboutPage = memo(function AboutPage() {
  const pythonServerCode = `# Exécution côté module IA (par vos collègues) :
import asyncio
import websockets
import json
from ultralytics import YOLO

# Chargement du modèle de segmentation
model = YOLO("yolo26s-seg.pt")

async def handler(websocket):
    print("Digital Twin connecté !")
    while True:
        # 1. Inférence sur le flux caméra
        # results = model("surgical_tray_cam.jpg")
        
        # 2. Construction du payload normalisé
        payload = {
            "mode": "connected",
            "timestamp": "2026-11-04T12:00:00Z",
            "frame_id": 1042,
            "processing_time_ms": 18.4,
            "detections": [
                {
                    "class_id": 0,
                    "class_name": "surgical_scissors",
                    "instance_id": 101,
                    "confidence": 0.96,
                    "center_x": 360,
                    "center_y": 140,
                    "bbox": [60, 65, 620, 160],
                    "position_3d": { "x": 0.005, "y": 0.140, "z": 0.012 }
                }
            ]
        }
        await websocket.send(json.dumps(payload))
        await asyncio.sleep(0.033) # 30 FPS

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())`;

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6 text-slate-200">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Projet Académique de Fin d'Études
          </div>
          <h2 className="text-xl font-black text-white font-mono mt-1">
            HUMA-LOG SURGICAL-VLA
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture d'un Jumeau Numérique pour la Vision IA Chirurgicale et la Robotique d'Assistance
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
          Parcours Vision IA & Jumeaux Numériques 3D
        </div>
      </div>

      {/* 1. Schéma d'Architecture Globale du Pipeline (Imposé par le cahier des charges) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            SCHÉMA DU PIPELINE GLOBAL DE TRAITEMENT
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            De l'acquisition optique à l'actionnement robotique VLA
          </span>
        </div>

        {/* Pipeline Flowchart Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 pt-2">
          {/* Étape 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">01 • ACQUISITION</span>
            </div>
            <div className="font-bold text-white text-xs">Caméra / Image</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Capteur optique zénithal au-dessus du plateau chirurgical.
            </p>
          </div>

          {/* Étape 2 */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-indigo-400 font-bold">02 • MODÈLE IA</span>
            </div>
            <div className="font-bold text-white text-xs">YOLO26s-seg</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Réseau de neurones convolutif & attention pour la segmentation d'instruments.
            </p>
          </div>

          {/* Étape 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">03 • SEGMENTATION</span>
            </div>
            <div className="font-bold text-white text-xs">Masques & BBoxes</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Extraction des 8 classes officielles, contours polygonaux et centroïdes 2D.
            </p>
          </div>

          {/* Étape 4 */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold">04 • CALIBRATION</span>
            </div>
            <div className="font-bold text-white text-xs">Localisation 3D</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Transformation repère caméra vers repère plateau [X, Y, Z].
            </p>
          </div>

          {/* Étape 5 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">05 • TRANSPORT</span>
            </div>
            <div className="font-bold text-white text-xs">WebSocket JSON</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Flux asynchrone bidirectionnel basse latence (port 8765).
            </p>
          </div>

          {/* Étape 6 */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex flex-col justify-between ring-1 ring-cyan-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-300 font-bold">06 • JUMEAU 3D</span>
            </div>
            <div className="font-bold text-cyan-200 text-xs">Three.js Digital Twin</div>
            <p className="text-[11px] text-slate-300 mt-1">
              Rendu interactif 60 FPS, sélection, inspection et télémétrie.
            </p>
          </div>

          {/* Étape 7 */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold">07 • VLA / ROBOT</span>
            </div>
            <div className="font-bold text-white text-xs">ROS 2 & Robotique</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Préhension automatisée, guidage d'effecteur et modèle Vision-Language-Action.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Guide de Démonstration pour la Soutenance devant le Jury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scénario de Présentation */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
            <FileCode className="w-4 h-4" />
            Guide Pas-à-Pas pour la Soutenance devant le Jury
          </div>
          <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside font-mono">
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Présentation du Projet :</strong> Expliquer le rôle du jumeau numérique dans le contexte de la chirurgie assistée par ordinateur.
            </li>
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Exploration 3D :</strong> Manipuler la caméra (orbite, zoom, zénithale) pour inspecter le plateau métallique et le kit de dissection.
            </li>
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Les 8 Instruments :</strong> Montrer la fidélité des formes procédurales (anneaux des ciseaux, tête papillon de la sonde).
            </li>
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Sélection Synchronisée :</strong> Cliquer sur un instrument dans le tableau synoptique ou dans la 3D pour afficher ses coordonnées [X, Y, Z].
            </li>
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Segmentation & Vérité Terrain :</strong> Aller sur la page <em>Instrument Detection</em> pour visualiser les masques superposés au cliché réel.
            </li>
            <li className="p-2 rounded bg-slate-950/60 border border-slate-800">
              <strong className="text-white">Honnêteté Scientifique :</strong> Souligner la présence du badge <em>DEMO MODE</em> et la dissociation stricte entre modèle IA et jumeau 3D.
            </li>
          </ol>
        </div>

        {/* Rôle exclusif du robot et évolution vers ROS 2 */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase">
            <Bot className="w-4 h-4" />
            Rôle Exclusif du Robot : Plateforme Mobile de Vision IA (AGV)
          </div>

          <div className="text-xs text-slate-300 space-y-3">
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 leading-relaxed font-mono text-[11.5px]">
              <strong className="text-cyan-300">RÈGLE ACADÉMIQUE CRITIQUE :</strong> Le robot HUMA-LOG SURGICAL-VLA est <strong>strictement un système de vision par ordinateur et de reconnaissance d'instruments</strong>. Il n'effectue <em>aucune chirurgie</em>, ne manipule <em>aucun outil</em>, ne saisit rien et ne touche <em>jamais le patient</em>. Ses deux bras articulés forment un portique d'orientation et de stabilisation pour le capteur stéréoscopique RGB-D observant la boîte médicale.
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="font-mono font-bold text-cyan-300 text-xs">
                Spécifications de la passerelle ROS 2 (Flux de Vision & TF2) :
              </div>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-400">
                <li>Publication sur le topic <code className="text-white">/surgical_tray/detections</code> (Message type <code className="text-cyan-400">vision_msgs/Detection3DArray</code>).</li>
                <li>Arbre de transformations TF2 : repère caméra robot <code className="text-white">camera_optical_frame</code> vers repère plateau <code className="text-white">box_origin</code> et repère odométrie AGV <code className="text-white">odom</code>.</li>
                <li>Génération des bounding boxes 2D/3D, centroïdes et masques de segmentation pour les 8 classes chirurgicales officielles.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Code Python Backend Prêt à l'Emploi */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
            <Code2 className="w-4 h-4" />
            Script Python Serveur pour vos collègues (Module YOLO26s-seg)
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Fichier : backend_yolo_streamer.py
          </span>
        </div>

        <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300/90 overflow-x-auto leading-relaxed">
          {pythonServerCode}
        </pre>
      </div>
    </div>
  );
});
