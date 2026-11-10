import { memo, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { DetectionItem } from '../types/detection';
import { getInstrumentClassById } from '../data/instruments';
import { NOMINAL_POSITIONS } from '../data/mockDetections';
import { CameraPreset } from './SceneCamera';

interface InstrumentModelProps {
  detection: DetectionItem;
  index?: number;
  isSelected?: boolean;
  isHovered?: boolean;
  showLabel?: boolean;
  hasAnySelection?: boolean;
  cameraPreset?: CameraPreset;
  isFarView?: boolean;
  show3DBBox?: boolean;
  showGraspPose?: boolean;
  onSimulateGrasp?: (instanceId: number) => void;
  onSelect?: (instanceId: number) => void;
  onHover?: (instanceId: number | null) => void;
}

export const InstrumentModel = memo(function InstrumentModel({
  detection,
  index = 0,
  isSelected = false,
  isHovered = false,
  showLabel = true,
  hasAnySelection = false,
  cameraPreset = 'box',
  isFarView = false,
  show3DBBox = false,
  showGraspPose = false,
  onSimulateGrasp,
  onSelect,
  onHover
}: InstrumentModelProps) {
  const classDef = getInstrumentClassById(detection.class_id);

  // RÈGLE CRITIQUE (ZÉRO JITTER) : Utilisation EXCLUSIVE des constantes statiques nominales immuables
  const nominal = NOMINAL_POSITIONS[detection.class_id] ?? { x: 0, y: 0.88, z: 0, yaw: 0 };
  const { x, y, z } = nominal;
  const isOccluded = detection.status === 'occluded';

  // Matériau en acier chirurgical inoxydable poli satiné PBR haute définition
  const surgicalSteelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isOccluded ? '#475569' : '#f1f5f9',
      metalness: 0.94,
      roughness: 0.16,
      emissive: isSelected ? classDef.color : isHovered ? classDef.color : '#000000',
      emissiveIntensity: isSelected ? 0.40 : isHovered ? 0.18 : 0.0
    });
  }, [isSelected, isHovered, isOccluded, classDef.color]);

  // Matériaux haute précision dédiés pour la pince coupante (#01)
  const nipperJawsMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isOccluded ? '#475569' : '#ffffff',
      metalness: 0.95,
      roughness: 0.12,
      emissive: isSelected ? classDef.color : isHovered ? classDef.color : '#000000',
      emissiveIntensity: isSelected ? 0.35 : 0.0
    });
  }, [isSelected, isHovered, isOccluded, classDef.color]);

  const nipperHandlesMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isOccluded ? '#334155' : '#e2e8f0',
      metalness: 0.90,
      roughness: 0.24,
      emissive: isSelected ? classDef.color : isHovered ? classDef.color : '#000000',
      emissiveIntensity: isSelected ? 0.35 : 0.0
    });
  }, [isSelected, isHovered, isOccluded, classDef.color]);

  const nipperRivetMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#3a404d',
      metalness: 0.85,
      roughness: 0.35
    });
  }, []);

  const nipperSpringMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      metalness: 0.90,
      roughness: 0.25
    });
  }, []);

  // Forme de la palette papillon échancrée (sonde cannelée)
  const butterflyWingShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.012, 0);
    s.quadraticCurveTo(-0.013, 0.013, -0.005, 0.018);
    s.lineTo(0, 0.011);
    s.lineTo(0.005, 0.018);
    s.quadraticCurveTo(0.013, 0.013, 0.012, 0);
    s.lineTo(0.003, -0.008);
    s.lineTo(-0.003, -0.008);
    s.closePath();
    return s;
  }, []);

  // Bounding box 3D nette et volume de segmentation YOLO calibré
  const bboxDimensions = useMemo(() => {
    const w = Math.max(classDef.width_mm / 1000 + 0.010, 0.022);
    const h = 0.024; // 24 mm de hauteur au-dessus de la mousse
    const d = classDef.length_mm / 1000 + 0.012;
    return { w, h, d };
  }, [classDef.width_mm, classDef.length_mm]);

  const boxEdgesGeo = useMemo(() => {
    return new THREE.EdgesGeometry(
      new THREE.BoxGeometry(bboxDimensions.w, bboxDimensions.h, bboxDimensions.d)
    );
  }, [bboxDimensions]);

  // Décalage en quinconce (hauteurs Y et décalages Z alternés pour zéro chevauchement)
  const labelOffsetY = (index % 2 === 0) ? 0.026 : 0.014;
  const labelOffsetZ = (index % 2 === 0) ? 0.052 : 0.036;

  // Masquer les étiquettes en vue d'ensemble large (> 1.2m) ou en vue Salle Complète
  const shouldShow3DBadge = showLabel && !isFarView && cameraPreset !== 'overview';

  return (
    <group
      position={[x, y, z]}
      rotation={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(detection.instance_id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(detection.instance_id);
      }}
      onPointerOut={() => {
        onHover?.(null);
      }}
    >
      {/* ========================================================================= */}
      {/* 8 GÉOMÉTRIES CHIRURGICALES ANATOMIQUES (DISPOSITION EN XZ, Y-UP)           */}
      {/* ========================================================================= */}

      {/* CLASSE 0 : SURGICAL_SCISSORS (Ciseaux chirurgicaux droits) */}
      {detection.class_id === 0 && (
        <group>
          {/* Anneau digital inférieur gauche (+Z) */}
          <mesh castShadow position={[-0.014, 0, 0.054]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <torusGeometry args={[0.011, 0.0024, 16, 24]} />
          </mesh>
          {/* Anneau digital inférieur droit (+Z) */}
          <mesh castShadow position={[0.014, 0, 0.054]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <torusGeometry args={[0.011, 0.0024, 16, 24]} />
          </mesh>
          {/* Branches de transmission */}
          <mesh castShadow position={[-0.007, 0, 0.024]} rotation={[0, -0.12, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0035, 0.0028, 0.045]} />
          </mesh>
          <mesh castShadow position={[0.007, 0, 0.024]} rotation={[0, 0.12, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0035, 0.0028, 0.045]} />
          </mesh>
          {/* Vis de pivotement centrale */}
          <mesh castShadow position={[0, 0.001, -0.002]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0038, 0.0038, 0.0045, 16]} />
          </mesh>
          {/* Lames droites supérieures pointant vers -Z */}
          <mesh castShadow position={[-0.003, 0, -0.038]} rotation={[0, 0.04, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0034, 0.002, 0.065]} />
          </mesh>
          <mesh castShadow position={[0.003, 0, -0.038]} rotation={[0, -0.04, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0034, 0.002, 0.065]} />
          </mesh>
        </group>
      )}

      {/* CLASSE 1 : CUTTING_NIPPER (Pince coupante / rongeur articulée - Modélisation haute fidélité) */}
      {detection.class_id === 1 && (
        <group>
          {/* 1. BLOC D'ARTICULATION CENTRAL (BOX LOCK & PIVOT) */}
          <mesh castShadow position={[0, 0, -0.012]} material={nipperHandlesMaterial}>
            <boxGeometry args={[0.016, 0.007, 0.014]} />
          </mesh>
          {/* Épaulement circulaire du pivot */}
          <mesh position={[0, 0.001, -0.012]}>
            <cylinderGeometry args={[0.0065, 0.0065, 0.0075, 18]} />
            <primitive object={nipperHandlesMaterial} />
          </mesh>
          {/* Rivet central cylindrique bombé en acier sombre (#3a404d) */}
          <mesh position={[0, 0.004, -0.012]}>
            <cylinderGeometry args={[0.0032, 0.0032, 0.003, 16]} />
            <primitive object={nipperRivetMaterial} />
          </mesh>
          <mesh position={[0, 0.0052, -0.012]}>
            <sphereGeometry args={[0.0032, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={nipperRivetMaterial} />
          </mesh>

          {/* 2. MORS DE COUPE TRAPÉZOÏDAUX ÉPAIS (JAWS) EN ACIER BRILLANT */}
          {/* Mors gauche */}
          <group position={[-0.0042, 0, -0.028]} rotation={[0, 0.14, 0]}>
            <mesh castShadow material={nipperJawsMaterial}>
              <boxGeometry args={[0.0055, 0.0065, 0.022]} />
            </mesh>
            <mesh position={[0.002, 0, -0.002]} rotation={[0, 0.22, 0]} material={nipperJawsMaterial}>
              <boxGeometry args={[0.0022, 0.0058, 0.020]} />
            </mesh>
            <mesh position={[0.001, 0, -0.012]} rotation={[0, 0.4, 0]} material={nipperJawsMaterial}>
              <coneGeometry args={[0.0032, 0.008, 4]} />
            </mesh>
          </group>
          {/* Mors droit (symétrique) */}
          <group position={[0.0042, 0, -0.028]} rotation={[0, -0.14, 0]}>
            <mesh castShadow material={nipperJawsMaterial}>
              <boxGeometry args={[0.0055, 0.0065, 0.022]} />
            </mesh>
            <mesh position={[-0.002, 0, -0.002]} rotation={[0, -0.22, 0]} material={nipperJawsMaterial}>
              <boxGeometry args={[0.0022, 0.0058, 0.020]} />
            </mesh>
            <mesh position={[-0.001, 0, -0.012]} rotation={[0, -0.4, 0]} material={nipperJawsMaterial}>
              <coneGeometry args={[0.0032, 0.008, 4]} />
            </mesh>
          </group>

          {/* 3. BRANCHES ERGONOMIQUES GALBÉES AVEC STRIES ANTIDÉRAPANTES */}
          {/* Branche gauche */}
          <group>
            <mesh castShadow position={[-0.014, 0, 0.006]} rotation={[0, -0.32, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0052, 0.0058, 0.026]} />
            </mesh>
            <mesh castShadow position={[-0.021, 0, 0.030]} rotation={[0, -0.08, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0055, 0.0056, 0.028]} />
            </mesh>
            <mesh castShadow position={[-0.017, 0, 0.052]} rotation={[0, 0.22, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0048, 0.0054, 0.024]} />
            </mesh>
            <mesh castShadow position={[-0.013, 0, 0.064]} material={nipperHandlesMaterial}>
              <sphereGeometry args={[0.0028, 12, 12]} />
            </mesh>
            {[0.018, 0.024, 0.030, 0.036, 0.042].map((sz) => (
              <mesh key={`grip-l-${sz}`} position={[-0.024, 0, sz]}>
                <boxGeometry args={[0.0016, 0.0048, 0.0018]} />
                <primitive object={nipperRivetMaterial} />
              </mesh>
            ))}
          </group>

          {/* Branche droite */}
          <group>
            <mesh castShadow position={[0.014, 0, 0.006]} rotation={[0, 0.32, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0052, 0.0058, 0.026]} />
            </mesh>
            <mesh castShadow position={[0.021, 0, 0.030]} rotation={[0, 0.08, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0055, 0.0056, 0.028]} />
            </mesh>
            <mesh castShadow position={[0.017, 0, 0.052]} rotation={[0, -0.22, 0]} material={nipperHandlesMaterial}>
              <boxGeometry args={[0.0048, 0.0054, 0.024]} />
            </mesh>
            <mesh castShadow position={[0.013, 0, 0.064]} material={nipperHandlesMaterial}>
              <sphereGeometry args={[0.0028, 12, 12]} />
            </mesh>
            {[0.018, 0.024, 0.030, 0.036, 0.042].map((sz) => (
              <mesh key={`grip-r-${sz}`} position={[0.024, 0, sz]}>
                <boxGeometry args={[0.0016, 0.0048, 0.0018]} />
                <primitive object={nipperRivetMaterial} />
              </mesh>
            ))}
          </group>

          {/* 4. RESSORT À LAMES CENTRAL (DOUBLE LEAF SPRING) - SIGNATURE VISUELLE */}
          <mesh position={[-0.0065, 0, 0.022]} rotation={[0, 0.28, 0]} material={nipperSpringMaterial}>
            <boxGeometry args={[0.0012, 0.0035, 0.024]} />
          </mesh>
          <mesh position={[-0.0022, 0, 0.012]} rotation={[0, -0.35, 0]} material={nipperSpringMaterial}>
            <boxGeometry args={[0.0012, 0.0035, 0.014]} />
          </mesh>
          <mesh position={[0.0065, 0, 0.022]} rotation={[0, -0.28, 0]} material={nipperSpringMaterial}>
            <boxGeometry args={[0.0012, 0.0035, 0.024]} />
          </mesh>
          <mesh position={[0.0022, 0, 0.012]} rotation={[0, 0.35, 0]} material={nipperSpringMaterial}>
            <boxGeometry args={[0.0012, 0.0035, 0.014]} />
          </mesh>
          <mesh position={[-0.012, 0, 0.030]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0014, 0.0014, 0.002, 10]} />
            <primitive object={nipperRivetMaterial} />
          </mesh>
          <mesh position={[0.012, 0, 0.030]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0014, 0.0014, 0.002, 10]} />
            <primitive object={nipperRivetMaterial} />
          </mesh>
        </group>
      )}

      {/* CLASSE 2 : DISSECTING_SCALPEL (Bistouri fixe monobloc) */}
      {detection.class_id === 2 && (
        <group>
          {/* Manche plat monobloc (+Z) */}
          <mesh castShadow position={[0, 0, 0.025]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.011, 0.0024, 0.09]} />
          </mesh>
          {/* Épaulement */}
          <mesh castShadow position={[0, 0, -0.025]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0075, 0.002, 0.018]} />
          </mesh>
          {/* Lame fixe monobloc courbe affûtée (-Z) */}
          <mesh castShadow position={[0.001, 0, -0.052]} rotation={[0, -0.05, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0085, 0.0014, 0.035]} />
          </mesh>
        </group>
      )}

      {/* CLASSE 3 : DISSECTING_NEEDLE (Aiguille droite de dissection) */}
      {detection.class_id === 3 && (
        <group>
          {/* Manche prismatique hexagonal central */}
          <mesh castShadow position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0036, 0.0036, 0.08, 6]} />
          </mesh>
          {/* Tige effilée et pointe droite (-Z) */}
          <mesh castShadow position={[0, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0008, 0.0014, 0.04, 12]} />
          </mesh>
          <mesh castShadow position={[0, 0, -0.068]} rotation={[-Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <coneGeometry args={[0.0008, 0.008, 12]} />
          </mesh>
          {/* Pointe inférieure (+Z) */}
          <mesh castShadow position={[0, 0, 0.058]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0009, 0.0016, 0.025, 12]} />
          </mesh>
        </group>
      )}

      {/* CLASSE 4 : GROOVED_DIRECTOR (Sonde cannelée à double palette papillon) */}
      {detection.class_id === 4 && (
        <group>
          {/* Tige cannelée longue */}
          <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0026, 0.0026, 0.11, 14]} />
          </mesh>
          {/* Palette papillon arrière (-Z) */}
          <mesh castShadow position={[0, 0, -0.058]} rotation={[-Math.PI / 2, 0, 0]}>
            <extrudeGeometry args={[butterflyWingShape, { depth: 0.0018, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004 }]} />
            <primitive object={surgicalSteelMaterial} />
          </mesh>
          {/* Palette papillon avant (+Z, symétrique) */}
          <mesh castShadow position={[0, 0, 0.058]} rotation={[Math.PI / 2, 0, 0]}>
            <extrudeGeometry args={[butterflyWingShape, { depth: 0.0018, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004 }]} />
            <primitive object={surgicalSteelMaterial} />
          </mesh>
        </group>
      )}

      {/* CLASSE 5 : DISSECTING_FORCEPS (Pince à disséquer dentelée) */}
      {detection.class_id === 5 && (
        <group>
          {/* Talon élastique soudé (+Z) */}
          <mesh castShadow position={[0, 0, 0.065]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.004, 0.0032, 0.015]} />
          </mesh>
          {/* Branches élastiques */}
          <mesh castShadow position={[-0.0035, 0, 0.01]} rotation={[0, 0.04, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0032, 0.002, 0.09]} />
          </mesh>
          <mesh castShadow position={[0.0035, 0, 0.01]} rotation={[0, -0.04, 0]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0032, 0.002, 0.09]} />
          </mesh>
          {/* Mors striés (-Z) */}
          <mesh castShadow position={[-0.001, 0, -0.048]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0022, 0.0018, 0.03]} />
          </mesh>
          <mesh castShadow position={[0.001, 0, -0.048]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0022, 0.0018, 0.03]} />
          </mesh>
        </group>
      )}

      {/* CLASSE 6 : BLUNT_PROBE (Stylet à pointe mousse) */}
      {detection.class_id === 6 && (
        <group>
          {/* Tige cylindrique centrale */}
          <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0014, 0.0014, 0.138, 14]} />
          </mesh>
          {/* Embouts sphériques mousses */}
          <mesh castShadow position={[0, 0, -0.069]} material={surgicalSteelMaterial}>
            <sphereGeometry args={[0.0027, 16, 16]} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.069]} material={surgicalSteelMaterial}>
            <sphereGeometry args={[0.0027, 16, 16]} />
          </mesh>
        </group>
      )}

      {/* CLASSE 7 : SCALPEL_HANDLE (Manche de bistouri n°3/4) */}
      {detection.class_id === 7 && (
        <group>
          {/* Manche principal plat (+Z) */}
          <mesh castShadow position={[0, 0, 0.02]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0135, 0.0028, 0.095]} />
          </mesh>
          {/* Extrémité spatulée inférieure arrondie */}
          <mesh castShadow position={[0, 0, 0.068]} material={surgicalSteelMaterial}>
            <cylinderGeometry args={[0.0068, 0.0068, 0.0028, 16]} />
          </mesh>
          {/* Rainures de grip pour le pouce */}
          {[-0.016, -0.009, -0.002, 0.005].map((oz) => (
            <mesh key={`grip-handle-${oz}`} position={[0, 0.0015, oz]}>
              <boxGeometry args={[0.0095, 0.0006, 0.002]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          ))}
          {/* Glissière à baïonnette pour lame (-Z) */}
          <mesh castShadow position={[0, 0, -0.046]} material={surgicalSteelMaterial}>
            <boxGeometry args={[0.0042, 0.0016, 0.035]} />
          </mesh>
        </group>
      )}

      {/* ========================================================================= */}
      {/* 1. CADRE LUMINEUX & 3D BOUNDING BOX (VLA ORIENTED BOUNDING BOX)           */}
      {/* ========================================================================= */}
      {(isSelected || isHovered || show3DBBox) && (
        <group position={[0, bboxDimensions.h / 2, 0]}>
          {/* Boîte englobante 3D filaire nette sans diagonales (EdgesGeometry) */}
          <lineSegments geometry={boxEdgesGeo}>
            <lineBasicMaterial
              color={classDef.color}
              linewidth={2}
              transparent
              opacity={isSelected ? 1.0 : show3DBBox ? 0.45 : 0.65}
            />
          </lineSegments>

          {/* Masque volumétrique semi-transparent de segmentation d'instance YOLO */}
          <mesh>
            <boxGeometry args={[bboxDimensions.w, bboxDimensions.h, bboxDimensions.d]} />
            <meshStandardMaterial
              color={classDef.color}
              transparent
              opacity={isSelected ? 0.22 : show3DBBox ? 0.05 : 0.08}
              depthWrite={false}
              emissive={classDef.color}
              emissiveIntensity={isSelected ? 0.35 : 0.12}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Halo lumineux focalisé projetant la teinte de classe sur la surface */}
          <pointLight
            position={[0, 0.03, 0]}
            color={classDef.color}
            intensity={isSelected ? 1.4 : isHovered ? 0.5 : 0.2}
            distance={0.25}
          />
        </group>
      )}

      {/* ========================================================================= */}
      {/* 2. VECTEUR & POINT DE PRÉHENSION ROBOTIQUE VLA (GRASP POSE & NORMAL)       */}
      {/* ========================================================================= */}
      {(isSelected || isHovered || showGraspPose) && (
        <group position={[0, 0.012, 0]}>
          {/* Point central de saisie (Center of Mass) */}
          <mesh>
            <sphereGeometry args={[0.0035, 16, 16]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
          {/* Flèche d'approche descendante -Y (Vecteur d'approche pince) */}
          <group position={[0, 0.024, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.0008, 0.0008, 0.030, 8]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
            <mesh position={[0, -0.016, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.0028, 0.006, 12]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          </group>
          {/* Gabarit d'ouverture des mors (Grasp Width) */}
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[Math.min(classDef.width_mm / 1000 + 0.006, 0.025), 0.0012, 0.002]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      )}

      {/* ========================================================================= */}
      {/* 3. FICHE D'INSPECTION HOLOGRAPHIQUE 3D FLOTTANTE (SÉLECTION ACTIVE)        */}
      {/* ========================================================================= */}
      {isSelected && (
        <Html
          position={[0, bboxDimensions.h + 0.045, 0]}
          center
          zIndexRange={[40, 0]}
        >
          <div className="px-3 py-2 rounded-xl bg-slate-950/92 backdrop-blur-md border border-slate-700/80 shadow-2xl text-[10px] font-mono text-slate-200 pointer-events-auto select-none min-w-[210px] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: classDef.color }} />
                <span className="text-white text-[11px]">{classDef.name}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/90 text-cyan-300 font-bold border border-slate-700">
                ID: 0{detection.class_id}
              </span>
            </div>
            <div className="space-y-1 text-[9px] text-slate-400">
              <div className="flex justify-between">
                <span>Nom clinique :</span>
                <span className="text-slate-100 font-sans font-medium">{classDef.french_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Pose 3D (X, Y, Z) :</span>
                <span className="text-emerald-400 font-bold">
                  [{Math.round(x * 1000)}, {Math.round(y * 1000)}, {Math.round(z * 1000)}] mm
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confiance IA :</span>
                <span className="text-cyan-400 font-bold">{(detection.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Grasp Pose :</span>
                <span className="text-indigo-300">Normale -Y · Yaw 0°</span>
              </div>
            </div>
            {onSimulateGrasp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSimulateGrasp(detection.instance_id);
                }}
                className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[9.5px] transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>⚡ Simuler Saisie Robot VLA</span>
              </button>
            )}
          </div>
        </Html>
      )}

      {/* ========================================================================= */}
      {/* 4. PASTILLE 3D ÉTAGÉE DISCRÈTE (VISIBLE SANS SÉLECTION & PRÈS)             */}
      {/* ========================================================================= */}
      {shouldShow3DBadge && !hasAnySelection && (
        <Html
          position={[0, labelOffsetY, labelOffsetZ]}
          center
          zIndexRange={[10, 0]}
        >
          <div
            className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold transition-all pointer-events-none select-none whitespace-nowrap flex items-center gap-1 border shadow-sm ${
              isHovered
                ? 'bg-slate-900 text-white border-cyan-400 scale-110 shadow-cyan-500/30'
                : 'bg-slate-950/85 text-slate-300 border-slate-700/80 opacity-90'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: classDef.color }}
            />
            <span>0{detection.class_id}</span>
          </div>
        </Html>
      )}
    </group>
  );
});
