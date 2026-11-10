import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RoboticGripperProps {
  targetPosition: [number, number, number] | null;
  isGrasping: boolean;
  onAnimationComplete?: () => void;
}

/**
 * Pince robotique chirurgicale VLA articulée haute précision (End-Effector 2 doigts)
 * Anime une descente, préhension et remontée douce lors de la simulation de saisie
 */
export function RoboticGripper({
  targetPosition,
  isGrasping,
  onAnimationComplete
}: RoboticGripperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftFingerRef = useRef<THREE.Group>(null);
  const rightFingerRef = useRef<THREE.Group>(null);
  const progressRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);

  // Matériau titane brossé PBR
  const titaniumMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.9,
      roughness: 0.25
    });
  }, []);

  // Matériau carbone composite noir
  const carbonMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.3,
      roughness: 0.6
    });
  }, []);

  // Matériau mors en silicone stérile bleu médical
  const siliconePadMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      metalness: 0.1,
      roughness: 0.7
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isGrasping && targetPosition) {
      if (!isExecutingRef.current) {
        isExecutingRef.current = true;
        progressRef.current = 0;
      }

      // Vitesse d'animation (cycle complet en ~3.5 secondes)
      progressRef.current += delta * 0.75;
      const t = progressRef.current;

      const [tx, ty, tz] = targetPosition;
      const restY = ty + 0.32;   // Position haute de repos
      const graspY = ty + 0.038; // Position basse de saisie

      let currentY = restY;
      let fingerOpen = 0.018; // Écartement des doigts en mètres

      if (t < 1.0) {
        // Phase 1 : Descente vers l'instrument (0 -> 1)
        const ease = THREE.MathUtils.smoothstep(t, 0, 1);
        currentY = THREE.MathUtils.lerp(restY, graspY, ease);
        fingerOpen = 0.022;
      } else if (t < 1.5) {
        // Phase 2 : Fermeture des doigts sur l'outil (1 -> 1.5)
        currentY = graspY;
        const closeEase = THREE.MathUtils.smoothstep(t, 1.0, 1.5);
        fingerOpen = THREE.MathUtils.lerp(0.022, 0.007, closeEase);
      } else if (t < 2.5) {
        // Phase 3 : Légère élévation pour présentation (1.5 -> 2.5)
        const liftEase = Math.sin((t - 1.5) * Math.PI);
        currentY = graspY + liftEase * 0.035;
        fingerOpen = 0.007;
      } else if (t < 3.0) {
        // Phase 4 : Réouverture des doigts (2.5 -> 3.0)
        currentY = graspY;
        const openEase = THREE.MathUtils.smoothstep(t, 2.5, 3.0);
        fingerOpen = THREE.MathUtils.lerp(0.007, 0.022, openEase);
      } else if (t < 4.0) {
        // Phase 5 : Remontée en position haute (3.0 -> 4.0)
        const retractEase = THREE.MathUtils.smoothstep(t, 3.0, 4.0);
        currentY = THREE.MathUtils.lerp(graspY, restY, retractEase);
        fingerOpen = 0.022;
      } else {
        // Cycle terminé
        isExecutingRef.current = false;
        onAnimationComplete?.();
      }

      groupRef.current.position.set(tx, currentY, tz);
      groupRef.current.visible = true;

      if (leftFingerRef.current) leftFingerRef.current.position.x = -fingerOpen;
      if (rightFingerRef.current) rightFingerRef.current.position.x = fingerOpen;
    } else {
      if (!isExecutingRef.current) {
        groupRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* 1. BRIDE DE FIXATION AU BRAS ROBOTIQUE */}
      <mesh position={[0, 0.08, 0]} material={carbonMat}>
        <cylinderGeometry args={[0.024, 0.024, 0.04, 24]} />
      </mesh>
      {/* Bague rotative métallique anodisée */}
      <mesh position={[0, 0.055, 0]} material={titaniumMat}>
        <cylinderGeometry args={[0.026, 0.026, 0.01, 24]} />
      </mesh>

      {/* 2. CORPS CENTRAL DU PRÉHENSEUR */}
      <mesh position={[0, 0.035, 0]} material={carbonMat}>
        <boxGeometry args={[0.042, 0.032, 0.028]} />
      </mesh>

      {/* Témoin LED d'état robotique (vert quand actif) */}
      <mesh position={[0, 0.036, 0.015]}>
        <sphereGeometry args={[0.003, 12, 12]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* Faisceau guide laser d'alignement stérile */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.0006, 0.0012, 0.07, 8]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
      </mesh>

      {/* 3. DOIGT GAUCHE ARTICULÉ (-X) */}
      <group ref={leftFingerRef} position={[-0.016, 0.012, 0]}>
        {/* Support de glissière */}
        <mesh position={[0, 0, 0]} material={titaniumMat}>
          <boxGeometry args={[0.008, 0.016, 0.018]} />
        </mesh>
        {/* Doigt profilé descendant */}
        <mesh position={[0, -0.024, 0]} material={titaniumMat}>
          <boxGeometry args={[0.004, 0.034, 0.012]} />
        </mesh>
        {/* Mors en silicone médical texturé */}
        <mesh position={[0.0025, -0.028, 0]} material={siliconePadMat}>
          <boxGeometry args={[0.0016, 0.022, 0.010]} />
        </mesh>
      </group>

      {/* 4. DOIGT DROIT ARTICULÉ (+X) */}
      <group ref={rightFingerRef} position={[0.016, 0.012, 0]}>
        {/* Support de glissière */}
        <mesh position={[0, 0, 0]} material={titaniumMat}>
          <boxGeometry args={[0.008, 0.016, 0.018]} />
        </mesh>
        {/* Doigt profilé descendant */}
        <mesh position={[0, -0.024, 0]} material={titaniumMat}>
          <boxGeometry args={[0.004, 0.034, 0.012]} />
        </mesh>
        {/* Mors en silicone médical texturé */}
        <mesh position={[-0.0025, -0.028, 0]} material={siliconePadMat}>
          <boxGeometry args={[0.0016, 0.022, 0.010]} />
        </mesh>
      </group>
    </group>
  );
}
