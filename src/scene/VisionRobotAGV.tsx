import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VisionRobotAGVProps {
  showFOV?: boolean;
}

/**
 * Robot Mobile AGV HUMA-LOG — Plateforme Robotisée Médicale Avancée 7-DOF
 * - Châssis AGV omnidirectionnel avec LiDAR 360°, pare-chocs de sécurité et roues Mecanum
 * - Deux bras robotiques 7 axes articulés haute fidélité (KUKA LBR Med / Franka Medical style)
 * - Anneaux LED d'état circulaires lumineux émissifs à chaque articulation
 * - Cinématique temps réel avec micro-mouvements organiques de stabilisation stérile
 * - Tête de vision stéréo RGB-D haute résolution avec télémètre laser ToF et champ de vision FOV
 */
export const VisionRobotAGV = memo(function VisionRobotAGV({
  showFOV = true
}: VisionRobotAGVProps) {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const lidarRingRef = useRef<THREE.Mesh>(null);

  // Matériaux PBR médicaux d'excellence
  const robotWhite = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.18,
      metalness: 0.15
    }),
    []
  );

  const graphiteJoint = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.3,
      metalness: 0.85
    }),
    []
  );

  const titaniumSatin = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.22,
      metalness: 0.92
    }),
    []
  );

  const cyanLedRing = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      emissive: '#0891b2',
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.5
    }),
    []
  );

  const emeraldLed = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#10b981',
      emissiveIntensity: 0.95
    }),
    []
  );

  const cableConduit = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#090d16',
      roughness: 0.8,
      metalness: 0.1
    }),
    []
  );

  const sensorOptics = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#020617',
      roughness: 0.05,
      metalness: 0.95
    }),
    []
  );

  // Micro-mouvements organiques et rotation continue du LiDAR
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotation continue du LiDAR 360°
    if (lidarRingRef.current) {
      lidarRingRef.current.rotation.y = t * 6.0;
    }

    // Micro-stabilisation active du bras gauche (Vision / Caméra)
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.015;
      leftArmRef.current.rotation.y = Math.cos(t * 0.6) * 0.012;
    }

    // Micro-stabilisation active du bras droit (Préhenseur)
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.cos(t * 0.7) * 0.015;
      rightArmRef.current.rotation.y = -Math.sin(t * 0.5) * 0.012;
    }

    // Micro-ajustement de la tête de caméra
    if (headRef.current) {
      headRef.current.position.y = 1.48 + Math.sin(t * 1.2) * 0.003;
    }
  });

  // Géométrie pyramidale du faisceau optique (FOV Frustum)
  const fovGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const apex = new THREE.Vector3(0, 1.48, -0.35);
    const p1 = new THREE.Vector3(-0.19, 0.88, -0.14);
    const p2 = new THREE.Vector3(0.19, 0.88, -0.14);
    const p3 = new THREE.Vector3(0.19, 0.88, 0.14);
    const p4 = new THREE.Vector3(-0.19, 0.88, 0.14);

    const vertices = new Float32Array([
      apex.x, apex.y, apex.z,  p2.x, p2.y, p2.z,  p1.x, p1.y, p1.z,
      apex.x, apex.y, apex.z,  p3.x, p3.y, p3.z,  p2.x, p2.y, p2.z,
      apex.x, apex.y, apex.z,  p4.x, p4.y, p4.z,  p3.x, p3.y, p3.z,
      apex.x, apex.y, apex.z,  p1.x, p1.y, p1.z,  p4.x, p4.y, p4.z,
      p1.x, p1.y, p1.z,  p2.x, p2.y, p2.z,  p3.x, p3.y, p3.z,
      p1.x, p1.y, p1.z,  p3.x, p3.y, p3.z,  p4.x, p4.y, p4.z,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. BASE MOBILE AGV OMNIDIRECTIONNELLE EN [0, 0, -1.15]                    */}
      {/* ========================================================================= */}
      <group position={[0, 0, -1.15]}>
        {/* Châssis principal caréné avec chanfreins aérodynamiques */}
        <mesh castShadow receiveShadow position={[0, 0.17, 0]} material={robotWhite}>
          <boxGeometry args={[0.52, 0.22, 0.58]} />
        </mesh>

        {/* Pare-chocs inférieur absorbant noir avec capteurs ultrasons */}
        <mesh position={[0, 0.05, 0]} material={graphiteJoint}>
          <boxGeometry args={[0.54, 0.06, 0.60]} />
        </mesh>

        {/* Capteur LiDAR 360° de sécurité laser en façade */}
        <group position={[0, 0.12, 0.30]}>
          <mesh material={graphiteJoint}>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 24]} />
          </mesh>
          <mesh ref={lidarRingRef} position={[0, 0, 0]} material={cyanLedRing}>
            <torusGeometry args={[0.046, 0.004, 12, 24]} />
          </mesh>
        </group>

        {/* 4 Roues Mecanum carénées */}
        {[-0.21, 0.21].map((wx) =>
          [-0.22, 0.22].map((wz) => (
            <group key={`mecanum-${wx}-${wz}`} position={[wx, 0.05, wz]} rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow material={graphiteJoint}>
                <cylinderGeometry args={[0.05, 0.05, 0.045, 20]} />
              </mesh>
              <mesh position={[0, 0, 0]} material={cyanLedRing}>
                <cylinderGeometry args={[0.026, 0.026, 0.048, 16]} />
              </mesh>
            </group>
          ))
        )}

        {/* Pupitre de commande arrière avec écran tactile de statut */}
        <group position={[0, 0.285, -0.22]} rotation={[-0.45, 0, 0]}>
          <mesh material={graphiteJoint}>
            <boxGeometry args={[0.18, 0.12, 0.02]} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.16, 0.10]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Bouton Arrêt d'Urgence E-Stop & Tour LED d'état */}
        <group position={[0.20, 0.29, 0.20]}>
          <mesh material={graphiteJoint}>
            <cylinderGeometry args={[0.022, 0.024, 0.012, 16]} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.018, 16]} />
            <meshStandardMaterial color="#dc2626" roughness={0.2} metalness={0.2} />
          </mesh>
        </group>

        {/* Balise LED d'état stérile (Vert = Prêt / Actif) */}
        <group position={[-0.20, 0.29, 0.20]}>
          <mesh position={[0, 0.06, 0]} material={graphiteJoint}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} material={emeraldLed}>
            <cylinderGeometry args={[0.014, 0.014, 0.025, 16]} />
          </mesh>
        </group>

        {/* ========================================================================= */}
        {/* 2. MÂT TÉLESCOPIQUE & COLONNE VERTÉBRALE (Y = 0.28 à 1.34)                */}
        {/* ========================================================================= */}
        <mesh castShadow position={[0, 0.80, -0.06]} material={robotWhite}>
          <cylinderGeometry args={[0.065, 0.075, 0.98, 24]} />
        </mesh>
        {/* Anneau de guidage en titane */}
        <mesh position={[0, 0.80, -0.06]} material={titaniumSatin}>
          <cylinderGeometry args={[0.078, 0.078, 0.15, 24]} />
        </mesh>

        {/* Gaine de câblage annelée flex le long de la colonne */}
        <mesh position={[0.05, 0.80, -0.12]} material={cableConduit}>
          <cylinderGeometry args={[0.016, 0.016, 0.92, 12]} />
        </mesh>

        {/* Torse d'articulation des deux bras robotiques */}
        <mesh castShadow position={[0, 1.32, -0.02]} material={robotWhite}>
          <boxGeometry args={[0.44, 0.15, 0.28]} />
        </mesh>
        {/* Bandeau lumineux d'état VLA */}
        <mesh position={[0, 1.32, 0.122]} material={cyanLedRing}>
          <boxGeometry args={[0.30, 0.035, 0.004]} />
        </mesh>

        {/* ========================================================================= */}
        {/* 3. BRAS ROBOTIQUE GAUCHE 7-DOF (BRAS DE VISION STEREO & PROJECTEUR)       */}
        {/* ========================================================================= */}
        <group ref={leftArmRef} position={[-0.24, 1.32, 0.0]}>
          {/* Base épaule J1 avec anneau LED */}
          <mesh castShadow material={graphiteJoint}>
            <cylinderGeometry args={[0.046, 0.046, 0.06, 20]} />
          </mesh>
          <mesh material={cyanLedRing} position={[0, 0.032, 0]}>
            <torusGeometry args={[0.046, 0.004, 12, 24]} />
          </mesh>

          {/* Épaule J2 rotule d'élévation */}
          <mesh castShadow position={[0, 0.06, 0]} material={titaniumSatin}>
            <sphereGeometry args={[0.044, 18, 18]} />
          </mesh>

          {/* Bras supérieur J3 orienté vers l'avant */}
          <group position={[-0.04, 0.18, 0.14]} rotation={[0.45, -0.25, 0]}>
            <mesh castShadow material={robotWhite}>
              <cylinderGeometry args={[0.032, 0.036, 0.30, 18]} />
            </mesh>
            <mesh position={[0, 0.08, 0]} material={graphiteJoint}>
              <cylinderGeometry args={[0.034, 0.034, 0.025, 18]} />
            </mesh>

            {/* Coude J4 avec anneau émissif */}
            <group position={[0, 0.16, 0]} rotation={[-0.75, 0, 0]}>
              <mesh castShadow material={graphiteJoint}>
                <sphereGeometry args={[0.038, 18, 18]} />
              </mesh>
              <mesh material={cyanLedRing}>
                <torusGeometry args={[0.040, 0.005, 12, 24]} />
              </mesh>

              {/* Avant-bras J5 vers l'avant-centre */}
              <group position={[0, 0.14, 0]} rotation={[0.2, 0.1, 0]}>
                <mesh castShadow material={robotWhite}>
                  <cylinderGeometry args={[0.026, 0.030, 0.24, 18]} />
                </mesh>

                {/* Poignet J6 et Module Caméra Optique Auxiliaire */}
                <group position={[0, 0.14, 0]}>
                  <mesh castShadow material={titaniumSatin}>
                    <cylinderGeometry args={[0.022, 0.024, 0.05, 16]} />
                  </mesh>
                  {/* Objectif caméra stéréoscopique gauche */}
                  <mesh position={[0, 0.035, 0]} material={sensorOptics}>
                    <cylinderGeometry args={[0.016, 0.018, 0.02, 16]} />
                  </mesh>
                  <mesh position={[0, 0.046, 0]} material={cyanLedRing}>
                    <ringGeometry args={[0.012, 0.018, 16]} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* ========================================================================= */}
        {/* 4. BRAS ROBOTIQUE DROIT 7-DOF (BRAS MANIPULATEUR & PRÉHENSEUR CHIRURGICAL) */}
        {/* ========================================================================= */}
        <group ref={rightArmRef} position={[0.24, 1.32, 0.0]}>
          {/* Base épaule J1 */}
          <mesh castShadow material={graphiteJoint}>
            <cylinderGeometry args={[0.046, 0.046, 0.06, 20]} />
          </mesh>
          <mesh material={cyanLedRing} position={[0, 0.032, 0]}>
            <torusGeometry args={[0.046, 0.004, 12, 24]} />
          </mesh>

          {/* Épaule J2 */}
          <mesh castShadow position={[0, 0.06, 0]} material={titaniumSatin}>
            <sphereGeometry args={[0.044, 18, 18]} />
          </mesh>

          {/* Bras supérieur J3 */}
          <group position={[0.04, 0.18, 0.14]} rotation={[0.42, 0.22, 0]}>
            <mesh castShadow material={robotWhite}>
              <cylinderGeometry args={[0.032, 0.036, 0.30, 18]} />
            </mesh>
            <mesh position={[0, 0.08, 0]} material={graphiteJoint}>
              <cylinderGeometry args={[0.034, 0.034, 0.025, 18]} />
            </mesh>

            {/* Coude J4 */}
            <group position={[0, 0.16, 0]} rotation={[-0.65, 0, 0]}>
              <mesh castShadow material={graphiteJoint}>
                <sphereGeometry args={[0.038, 18, 18]} />
              </mesh>
              <mesh material={cyanLedRing}>
                <torusGeometry args={[0.040, 0.005, 12, 24]} />
              </mesh>

              {/* Avant-bras J5 */}
              <group position={[0, 0.14, 0]} rotation={[0.15, -0.15, 0]}>
                <mesh castShadow material={robotWhite}>
                  <cylinderGeometry args={[0.026, 0.030, 0.24, 18]} />
                </mesh>

                {/* Poignet J6 et Bride de préhension terminale */}
                <group position={[0, 0.14, 0]}>
                  <mesh castShadow material={titaniumSatin}>
                    <cylinderGeometry args={[0.022, 0.024, 0.05, 16]} />
                  </mesh>
                  {/* Préhenseur chirurgical stérile à double mors */}
                  <group position={[0, 0.035, 0]}>
                    <mesh material={graphiteJoint}>
                      <boxGeometry args={[0.032, 0.02, 0.02]} />
                    </mesh>
                    <mesh position={[-0.01, 0.02, 0]} material={titaniumSatin}>
                      <boxGeometry args={[0.004, 0.025, 0.008]} />
                    </mesh>
                    <mesh position={[0.01, 0.02, 0]} material={titaniumSatin}>
                      <boxGeometry args={[0.004, 0.025, 0.008]} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 5. TÊTE DE VISION STÉRÉO RGB-D AVANCÉE EN [0, 1.48, -0.35]               */}
      {/* ========================================================================= */}
      <group ref={headRef} position={[0, 1.48, -0.35]}>
        {/* Potence support col-de-cygne articulé reliant le torse à la tête */}
        <mesh position={[0, -0.06, -0.35]} rotation={[0.55, 0, 0]} material={titaniumSatin}>
          <cylinderGeometry args={[0.022, 0.024, 0.82, 18]} />
        </mesh>

        {/* Bloc capteur stéréo profilé horizontal */}
        <mesh castShadow position={[0, 0, 0]} rotation={[0.52, 0, 0]} material={robotWhite}>
          <boxGeometry args={[0.28, 0.065, 0.075]} />
        </mesh>

        {/* Face avant vitrée sombre antireflet */}
        <mesh position={[0, -0.015, 0.036]} rotation={[0.52, 0, 0]} material={sensorOptics}>
          <boxGeometry args={[0.26, 0.055, 0.004]} />
        </mesh>

        {/* Deux objectifs optiques stéréo RGB haute résolution */}
        {[-0.09, 0.09].map((ox) => (
          <group key={`stereo-cam-${ox}`} position={[ox, -0.015, 0.040]} rotation={[0.52, 0, 0]}>
            <mesh material={titaniumSatin}>
              <cylinderGeometry args={[0.018, 0.018, 0.008, 16]} />
            </mesh>
            <mesh position={[0, 0.005, 0]} material={cyanLedRing}>
              <ringGeometry args={[0.012, 0.017, 16]} />
            </mesh>
          </group>
        ))}

        {/* Projecteur central infrarouge ToF (Time-of-Flight) pour nuage de points 3D */}
        <mesh position={[0, -0.015, 0.040]} rotation={[0.52, 0, 0]}>
          <circleGeometry args={[0.014, 16]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Éclairage d'appoint annulaire LED calibré pour la vision artificielle */}
        <pointLight
          position={[0, -0.03, 0.06]}
          color="#f0f9ff"
          intensity={0.65}
          distance={1.5}
        />
      </group>

      {/* ========================================================================= */}
      {/* 6. FAISCEAU OPTIQUE VOLUMÉTRIQUE (CHAMP DE VISION FOV / CONE DE DÉTECTION)*/}
      {/* ========================================================================= */}
      {showFOV && (
        <group>
          {/* Volume translucide du champ de détection de la boîte */}
          <mesh geometry={fovGeometry}>
            <meshBasicMaterial
              color="#06b6d4"
              transparent
              opacity={0.05}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Arêtes filaires nettes reliant la tête aux 4 coins de la boîte */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    // Du sommet aux 4 coins
                    0, 1.48, -0.35,  -0.19, 0.88, -0.14,
                    0, 1.48, -0.35,   0.19, 0.88, -0.14,
                    0, 1.48, -0.35,   0.19, 0.88,  0.14,
                    0, 1.48, -0.35,  -0.19, 0.88,  0.14,
                    // Périmètre inférieur
                    -0.19, 0.88, -0.14,   0.19, 0.88, -0.14,
                     0.19, 0.88, -0.14,   0.19, 0.88,  0.14,
                     0.19, 0.88,  0.14,  -0.19, 0.88,  0.14,
                    -0.19, 0.88,  0.14,  -0.19, 0.88, -0.14,
                  ]),
                  3
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#06b6d4" transparent opacity={0.35} linewidth={1.5} />
          </lineSegments>
        </group>
      )}
    </group>
  );
});
