import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NOMINAL_POSITIONS, INITIAL_MOCK_DETECTIONS } from '../data/mockDetections';

export type CameraPreset =
  | 'box'          // Preset 1 : Boîte 3D (VUE PAR DÉFAUT AU CHARGEMENT - 80% largeur)
  | 'robot_pov'    // Preset 2 : Caméra RGB-D (plongeante depuis le capteur stéréo)
  | 'top_down'     // Preset 3 : Zénithale (90° verticale stricte)
  | 'isometric'    // Preset 4 : Iso 45° (¾ serrée)
  | 'overview';    // Preset 5 : Salle Complète (vue large d'ensemble)

interface SceneCameraProps {
  preset?: CameraPreset;
  selectedInstanceId?: number | null;
  controlsRef?: React.RefObject<any>;
  onResetComplete?: () => void;
  onDistanceChange?: (isFar: boolean) => void;
}

export const SceneCamera = function SceneCamera({
  preset = 'box',
  selectedInstanceId = null,
  controlsRef,
  onResetComplete,
  onDistanceChange
}: SceneCameraProps) {
  const { camera } = useThree();

  const isInitialMount = useRef(true);
  const startCameraPos = useRef(new THREE.Vector3(0, 1.22, 0.28));
  const endCameraPos = useRef(new THREE.Vector3(0, 1.22, 0.28));
  const startTarget = useRef(new THREE.Vector3(0, 0.88, 0));
  const endTarget = useRef(new THREE.Vector3(0, 0.88, 0));

  const transitionStartTime = useRef<number>(0);
  const isTransitioning = useRef<boolean>(false);
  const transitionDuration = 600; // Durée fixe de 600 ms

  const isFarRef = useRef<boolean>(false);

  // Initialisation immédiate au premier rendu & gestion des transitions suivantes
  useEffect(() => {
    // 1. AU PREMIER MONTAGE : FORCER LE CADRAGE SERRÉ IMMÉDIAT SANS ATTENDRE
    if (isInitialMount.current) {
      camera.position.set(0, 1.22, 0.28);
      camera.up.set(0, 1, 0);
      endTarget.current.set(0, 0.88, 0);
      endCameraPos.current.set(0, 1.22, 0.28);

      if (controlsRef?.current) {
        controlsRef.current.target.set(0, 0.88, 0);
        controlsRef.current.update();
      } else {
        camera.lookAt(0, 0.88, 0);
      }

      isInitialMount.current = false;
      isTransitioning.current = false;
      return;
    }

    // 2. LORS D'UN CLIC UTILISATEUR : LANCER UNE TRANSITION FLUIDE DE 600 MS
    startCameraPos.current.copy(camera.position);
    if (controlsRef?.current) {
      startTarget.current.copy(controlsRef.current.target);
    } else {
      startTarget.current.set(0, 0.88, 0);
    }

    if (selectedInstanceId !== null && selectedInstanceId !== undefined) {
      // Zoom net et fixe à 20 cm de l'instrument sélectionné
      const detection = INITIAL_MOCK_DETECTIONS.find((b) => b.instance_id === selectedInstanceId);
      const nominal = detection ? NOMINAL_POSITIONS[detection.class_id] : null;
      const targetPos = nominal ?? { x: 0, y: 0.88, z: 0 };

      endTarget.current.set(targetPos.x, 0.88, targetPos.z);
      endCameraPos.current.set(targetPos.x, 1.08, targetPos.z + 0.14);
      camera.up.set(0, 1, 0);
    } else {
      switch (preset) {
        case 'box':
        default:
          // Preset 1 : Boîte 3D (valise occupant 80% du champ)
          endTarget.current.set(0, 0.88, 0);
          endCameraPos.current.set(0, 1.22, 0.28);
          camera.up.set(0, 1, 0);
          break;

        case 'robot_pov':
          // Preset 2 : Caméra RGB-D (plongeante depuis le capteur stéréo en [0, 1.48, -0.35])
          endTarget.current.set(0, 0.88, 0);
          endCameraPos.current.set(0, 1.48, -0.35);
          camera.up.set(0, 1, 0);
          break;

        case 'top_down':
          // Preset 3 : Zénithale (90° verticale stricte)
          endTarget.current.set(0, 0.88, 0);
          endCameraPos.current.set(0, 1.25, 0.001);
          camera.up.set(0, 0, -1);
          break;

        case 'isometric':
          // Preset 4 : Iso 45°
          endTarget.current.set(0, 0.88, 0);
          endCameraPos.current.set(0.32, 1.20, 0.32);
          camera.up.set(0, 1, 0);
          break;

        case 'overview':
          // Preset 5 : Salle Complète (seule vue large d'ensemble)
          endTarget.current.set(-0.4, 0.9, -0.8);
          endCameraPos.current.set(1.8, 2.1, 2.2);
          camera.up.set(0, 1, 0);
          break;
      }
    }

    transitionStartTime.current = performance.now();
    isTransitioning.current = true;

    if (onResetComplete) {
      setTimeout(onResetComplete, transitionDuration);
    }
  }, [preset, selectedInstanceId, camera, controlsRef, onResetComplete]);

  // Surveillance de la distance et transition caméra 600 ms
  useFrame(() => {
    // 1. Détection de la distance à la valise pour le masquage automatique des badges
    const currentTarget = controlsRef?.current ? controlsRef.current.target : endTarget.current;
    const dist = camera.position.distanceTo(currentTarget);
    const isFar = dist > 1.2 || preset === 'overview';
    if (isFar !== isFarRef.current) {
      isFarRef.current = isFar;
      onDistanceChange?.(isFar);
    }

    // 2. Interpolation fluide si en transition
    if (!isTransitioning.current) return;

    const elapsed = performance.now() - transitionStartTime.current;
    const progress = Math.min(1.0, elapsed / transitionDuration);

    const t = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.position.lerpVectors(startCameraPos.current, endCameraPos.current, t);

    if (controlsRef?.current) {
      controlsRef.current.target.lerpVectors(startTarget.current, endTarget.current, t);
      controlsRef.current.update();
    } else {
      camera.lookAt(endTarget.current);
    }

    // Arrêt strict dès que les 600 ms sont écoulées (OrbitControls reprend la main)
    if (progress >= 1.0) {
      camera.position.copy(endCameraPos.current);
      if (controlsRef?.current) {
        controlsRef.current.target.copy(endTarget.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
};
