import { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ContactShadows } from '@react-three/drei';
import { SurgicalRoom } from '../../scene/SurgicalRoom';
import { SurgicalTable } from '../../scene/SurgicalTable';
import { MedicalInstrumentBox, BoxInteriorStyle } from '../../scene/MedicalInstrumentBox';
import { InstrumentModel } from '../../scene/InstrumentModel';
import { VisionRobotAGV } from '../../scene/VisionRobotAGV';
import { MedicalPersonnel } from '../../scene/MedicalPersonnel';
import { SceneLighting, LightingMode } from '../../scene/SceneLighting';
import { SceneCamera, CameraPreset } from '../../scene/SceneCamera';
import { SceneControls } from '../../scene/SceneControls';
import { RoboticGripper } from '../../scene/RoboticGripper';
import { CameraToolbar } from './CameraToolbar';
import { InstrumentSelector } from './InstrumentSelector';
import { DetectionItem, Position3D } from '../../types/detection';
import { NOMINAL_POSITIONS } from '../../data/mockDetections';

interface DigitalTwinCanvasProps {
  detections: DetectionItem[];
  selectedInstanceId: number | null;
  hoveredInstanceId: number | null;
  onSelect: (instanceId: number | null) => void;
  onHover: (instanceId: number | null) => void;
  onUpdatePosition?: (instanceId: number, pos: Position3D) => void;
  onToggleOcclusion?: (instanceId: number) => void;
  isSimulationMode?: boolean;
  heightClass?: string;
}

export function DigitalTwinCanvas({
  detections,
  selectedInstanceId,
  hoveredInstanceId,
  onSelect,
  onHover,
  heightClass = 'h-full'
}: DigitalTwinCanvasProps) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('box');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFOV, setShowFOV] = useState<boolean>(true);
  const [showRobot, setShowRobot] = useState<boolean>(true);
  const [show3DBBox, setShow3DBBox] = useState<boolean>(false);
  const [showGraspPose, setShowGraspPose] = useState<boolean>(false);
  const [interiorStyle, setInteriorStyle] = useState<BoxInteriorStyle>('red_velvet');
  const [lightingMode, setLightingMode] = useState<LightingMode>('surgery');
  const [isFarView, setIsFarView] = useState<boolean>(false);
  const [isGrasping, setIsGrasping] = useState<boolean>(false);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Position cible de préhension robotique pour l'instrument sélectionné
  const gripperTargetPos = useMemo<[number, number, number] | null>(() => {
    if (selectedInstanceId === null) return null;
    const item = detections.find((d) => d.instance_id === selectedInstanceId);
    if (!item) return null;
    const nominal = NOMINAL_POSITIONS[item.class_id];
    return nominal ? [nominal.x, 0.88, nominal.z] : null;
  }, [selectedInstanceId, detections]);

  const handleCycleInteriorStyle = () => {
    setInteriorStyle((prev) => {
      if (prev === 'red_velvet') return 'eva_foam';
      if (prev === 'eva_foam') return 'elastic_bands';
      return 'red_velvet';
    });
  };

  const handleCycleLightingMode = () => {
    setLightingMode((prev) => {
      if (prev === 'surgery') return 'ambient';
      if (prev === 'ambient') return 'uv_sterile';
      return 'surgery';
    });
  };

  const handleSimulateGrasp = (instanceId?: number) => {
    if (instanceId !== undefined && instanceId !== selectedInstanceId) {
      onSelect(instanceId);
    }
    setIsGrasping(true);
  };

  return (
    <div
      className={`relative w-full ${heightClass} bg-gradient-to-b from-[#060b14] via-[#09111e] to-[#040810] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col`}
    >
      {/* 1. BARRE DE CONTRÔLE HORIZONTALE COMPACTE EN HAUT DU CANVAS */}
      <CameraToolbar
        currentPreset={cameraPreset}
        onSelectPreset={setCameraPreset}
        showFOV={showFOV}
        onToggleFOV={() => setShowFOV((prev) => !prev)}
        showRobot={showRobot}
        onToggleRobot={() => setShowRobot((prev) => !prev)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        show3DBBox={show3DBBox}
        onToggle3DBBox={() => setShow3DBBox((prev) => !prev)}
        showGraspPose={showGraspPose}
        onToggleGraspPose={() => setShowGraspPose((prev) => !prev)}
        interiorStyle={interiorStyle}
        onToggleInteriorStyle={handleCycleInteriorStyle}
        lightingMode={lightingMode}
        onCycleLightingMode={handleCycleLightingMode}
        hasSelection={selectedInstanceId !== null}
        onClearSelection={() => onSelect(null)}
        onSimulateGrasp={() => handleSimulateGrasp()}
        isGrasping={isGrasping}
      />

      {/* 2. MOTEUR 3D CANVAS THREE.JS / R3F (CADRAGE BOÎTE SERRÉ IMMÉDIAT FOV 42) */}
      <div className="relative flex-1 min-h-0 w-full h-full">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: [0, 1.22, 0.28],
            fov: 42,
            near: 0.05,
            far: 50
          }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05
          }}
          onPointerMissed={() => onSelect(null)}
        >
          {/* Couleur d'ambiance et brouillard clinique */}
          <color attach="background" args={['#070e1b']} />
          <fog attach="fog" args={['#070e1b', 3.5, 9.0]} />

          {/* Caméra avec cadrage initial immédiat et transition fluide 600 ms */}
          <SceneCamera
            preset={cameraPreset}
            selectedInstanceId={selectedInstanceId}
            controlsRef={controlsRef}
            onDistanceChange={setIsFarView}
          />

          {/* Éclairage réaliste de bloc opératoire avec Lightformers PBR */}
          <SceneLighting mode={lightingMode} />

          {/* Contrôles OrbitControls sans damping conflictuel */}
          <SceneControls ref={controlsRef} />

          {/* Environnement de salle opératoire Y-UP */}
          <SurgicalRoom />

          {/* Table à instruments de vision chirurgicale centrée en [0, 0, 0], plateau Y = 0.85 */}
          <SurgicalTable showDrape={true} />

          {/* Zone patient et chirurgiens en arrière-plan séparé en [-1.5, 0, -2.8] */}
          {showRobot && <MedicalPersonnel />}

          {/* Robot AGV HUMA-LOG en [0, 0, -1.15] avec tête caméra en [0, 1.48, -0.35] */}
          {showRobot && <VisionRobotAGV showFOV={showFOV} />}

          {/* Valise / Trousse zippée velours rouge ouverte posée sur la table en [0, 0.85, 0] */}
          <MedicalInstrumentBox
            interiorStyle={interiorStyle}
          />

          {/* Ombres de contact douces réalistes sous les instruments dans le boîtier */}
          <ContactShadows
            position={[0, 0.852, 0]}
            opacity={0.7}
            scale={0.42}
            blur={1.6}
            far={0.06}
            color="#000000"
          />

          {/* Ombres de contact douces sous la table opératoire */}
          <ContactShadows
            position={[0, 0.005, 0]}
            opacity={0.5}
            scale={4}
            blur={2.4}
            far={0.4}
            color="#000000"
          />

          {/* Préhenseur robotique VLA animé pour simulation de saisie */}
          <RoboticGripper
            targetPosition={gripperTargetPos}
            isGrasping={isGrasping}
            onAnimationComplete={() => setIsGrasping(false)}
          />

          {/* 8 instruments chirurgicaux aux coordonnées nominales statiques immuables */}
          {detections.map((detection, idx) => (
            <InstrumentModel
              key={detection.instance_id}
              detection={detection}
              index={idx}
              isSelected={detection.instance_id === selectedInstanceId}
              isHovered={detection.instance_id === hoveredInstanceId}
              showLabel={showLabels}
              hasAnySelection={selectedInstanceId !== null}
              cameraPreset={cameraPreset}
              isFarView={isFarView}
              show3DBBox={show3DBBox}
              showGraspPose={showGraspPose}
              onSimulateGrasp={handleSimulateGrasp}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </Canvas>

        {/* Repère d'axes compact discret au bas-gauche du canvas */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-[10px] font-mono text-slate-300 flex items-center gap-2.5 pointer-events-none z-10">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>X (Latéral)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Y (Hauteur)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Z (Profondeur)</span>
          </span>
        </div>
      </div>

      {/* 3. BARRE INFÉRIEURE : SÉLECTEUR RAPIDE DES 8 INSTRUMENTS */}
      <div className="p-2 bg-slate-950/95 border-t border-slate-800 z-10">
        <InstrumentSelector
          detections={detections}
          selectedInstanceId={selectedInstanceId}
          onSelect={onSelect}
          onHover={onHover}
        />
      </div>
    </div>
  );
}
