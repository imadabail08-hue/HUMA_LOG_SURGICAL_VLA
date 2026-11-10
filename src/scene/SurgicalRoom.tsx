import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Salle d'Opération Chirurgicale Ultra-Réaliste Haute Fidélité (Y-UP)
 * - Plafond technique à flux laminaire stérile et dalles lumineuses LED encastrées
 * - Deux scialytiques chirurgicaux articulés haute puissance à double coupole multi-réflecteurs
 * - Grand mur multimédia avec moniteur patient animé en temps réel (ECG battant, SpO2, constantes)
 * - Écran chirurgical suspendu (Surgical Boom) au-dessus de la table pour le retour caméra IA
 * - Chariot d'anesthésie moderne avec bouteilles de gaz, détendeurs, vaporisateurs et respirateur
 * - Porte-sérum (IV Drip Stand) chromé à 5 roulettes avec poches de perfusion
 * - Porte hermétique coulissante avec voyant rouge "INTERVENTION EN COURS"
 */
export const SurgicalRoom = memo(function SurgicalRoom() {
  const heartDotRef = useRef<THREE.Mesh>(null);

  const steelMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.90, roughness: 0.18 }),
    []
  );

  const darkSteel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.85, roughness: 0.25 }),
    []
  );

  const cleanroomWall = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#131e2b', roughness: 0.6, metalness: 0.08 }),
    []
  );

  // Animation en temps réel du tracé ECG cardiologique
  const { ecgGeometry, ecgLine } = useMemo(() => {
    const pointsCount = 120;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const x = -0.45 + (i / pointsCount) * 0.90;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: '#10b981', linewidth: 2 });
    const line = new THREE.Line(geom, mat);
    return { ecgGeometry: geom, ecgLine: line };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Mise à jour de la ligne d'onde ECG
    const posAttr = ecgGeometry.attributes.position as THREE.BufferAttribute;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const u = (i / count + t * 0.8) % 1.0;
      let y = 0;
      // Profil P-Q-R-S-T
      if (u > 0.40 && u < 0.46) {
        y = Math.sin((u - 0.40) / 0.06 * Math.PI) * 0.03; // Onde P
      } else if (u >= 0.46 && u < 0.48) {
        y = -0.02; // Onde Q
      } else if (u >= 0.48 && u < 0.52) {
        y = Math.sin((u - 0.48) / 0.04 * Math.PI) * 0.14; // Pic R massif
      } else if (u >= 0.52 && u < 0.55) {
        y = -0.04; // Onde S
      } else if (u >= 0.58 && u < 0.68) {
        y = Math.sin((u - 0.58) / 0.10 * Math.PI) * 0.045; // Onde T
      }
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    // Battement du voyant cardiaque
    if (heartDotRef.current) {
      const pulse = 1.0 + Math.pow(Math.sin(t * 4.5), 8) * 0.6;
      heartDotRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================================= */}
      {/* 1. SOL EN RÉSINE ÉPOXY SANS JOINT AVEC BALISAGE LASER                     */}
      {/* ========================================================================= */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color="#152130"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Grille de carrelage conducteur hospitalier */}
      <group position={[0, 0.001, 0]}>
        <gridHelper args={[16, 16, '#2a3b50', '#1c293a']} />
      </group>

      {/* Périmètre stérile de sécurité au sol (Zone AGV & Table chirurgicale) */}
      <group position={[0, 0.002, -0.55]}>
        <lineLoop>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  -0.80, 0, -1.05,
                   0.80, 0, -1.05,
                   0.80, 0,  0.95,
                  -0.80, 0,  0.95
                ]),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" linewidth={2} transparent opacity={0.65} />
        </lineLoop>
      </group>

      {/* ========================================================================= */}
      {/* 2. PLAFOND TECHNIQUE DE SALLE BLANCHE À FLUX LAMINAIRE (Y = 3.6 M)        */}
      {/* ========================================================================= */}
      <group position={[0, 3.6, 0]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#0b131e" roughness={0.7} />
        </mesh>
        {/* Caisson central de flux d'air stérile filtré HEPA */}
        <mesh position={[0, -0.02, -0.8]}>
          <boxGeometry args={[3.2, 0.04, 3.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Dalles lumineuses chirurgicales encastrées */}
        {[-1.2, 1.2].map((lx) =>
          [-1.6, 0.2].map((lz) => (
            <mesh key={`ceiling-light-${lx}-${lz}`} position={[lx, -0.03, lz]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          ))
        )}
      </group>

      {/* ========================================================================= */}
      {/* 3. PAROI DU FOND (Z = -4.6) : ÉCRAN GÉANT, PORTE DE BLOC ET COMMANDES     */}
      {/* ========================================================================= */}
      <mesh receiveShadow position={[0, 1.8, -4.6]} material={cleanroomWall}>
        <boxGeometry args={[16, 3.6, 0.12]} />
      </mesh>
      {/* Rails antichoc inox double niveau */}
      <mesh position={[0, 0.90, -4.53]} material={steelMaterial}>
        <boxGeometry args={[16, 0.16, 0.025]} />
      </mesh>
      <mesh position={[0, 0.10, -4.53]} material={steelMaterial}>
        <boxGeometry args={[16, 0.14, 0.02]} />
      </mesh>

      {/* GRAND MONITEUR MULTIPARAMÈTRES ACTIF ANIMÉ EN X = 1.8, Y = 2.15 */}
      <group position={[1.8, 2.15, -4.53]}>
        {/* Châssis écran en titane */}
        <mesh material={darkSteel}>
          <boxGeometry args={[2.4, 1.35, 0.06]} />
        </mesh>
        {/* Dalle LED 4K antireflet */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[2.3, 1.25]} />
          <meshBasicMaterial color="#020817" />
        </mesh>

        {/* Tracé ECG battant en temps réel vert émissif */}
        <group position={[-0.55, 0.28, 0.035]}>
          <primitive object={ecgLine} />
          {/* Point pulsant du rythme sinusal */}
          <mesh ref={heartDotRef} position={[0.42, 0.04, 0]}>
            <circleGeometry args={[0.012, 16]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>

        {/* Données de constantes vitales médicales */}
        <group position={[-0.55, -0.22, 0.035]}>
          <mesh position={[-0.30, 0, 0]}>
            <planeGeometry args={[0.28, 0.22]} />
            <meshStandardMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <planeGeometry args={[0.28, 0.22]} />
            <meshStandardMaterial color="#0c4a6e" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.40, 0, 0]}>
            <planeGeometry args={[0.28, 0.22]} />
            <meshStandardMaterial color="#581c87" emissive="#a855f7" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Imagerie scanner CT / Tomodensitométrie en teintes froides à droite */}
        <group position={[0.62, 0.05, 0.035]}>
          <mesh>
            <planeGeometry args={[0.85, 0.95]} />
            <meshStandardMaterial color="#032030" emissive="#0284c7" emissiveIntensity={0.35} />
          </mesh>
          {/* Cercles de reconstruction tomographique */}
          {[0.12, 0.24, 0.35].map((cr) => (
            <mesh key={`ct-scan-ring-${cr}`} position={[0, 0, 0.002]}>
              <ringGeometry args={[cr, cr + 0.005, 32]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
      </group>

      {/* PORTE COULISSANTE HERMÉTIQUE VITRÉE AVEC VOYANT LUMINEUX ROUGE EN X = -2.8 */}
      <group position={[-2.8, 0, -4.54]}>
        {/* Voyant lumineux "CHIRURGIE ACTIVE" */}
        <group position={[0, 2.50, 0.04]}>
          <mesh material={darkSteel}>
            <boxGeometry args={[0.65, 0.12, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.60, 0.08]} />
            <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Rail de suspension inox */}
        <mesh position={[0, 2.30, 0.03]} material={steelMaterial}>
          <boxGeometry args={[2.2, 0.12, 0.06]} />
        </mesh>
        {/* Vantail de porte */}
        <mesh position={[0, 1.12, 0.02]}>
          <boxGeometry args={[1.60, 2.24, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Oculus vitré hermétique bleuté */}
        <mesh position={[0, 1.30, 0.025]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* Poignée barre inox pleine hauteur */}
        <mesh position={[0.65, 1.10, 0.06]} material={steelMaterial}>
          <cylinderGeometry args={[0.016, 0.016, 1.0, 16]} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 4. POSTE D'ANESTHÉSIE MODERNE EN ARRIÈRE-PLAN GAUCHE [-3.4, 0, -2.4]       */}
      {/* ========================================================================= */}
      <group position={[-3.4, 0, -2.4]}>
        {/* Chariot mobile à roulettes */}
        <mesh castShadow receiveShadow position={[0, 0.55, 0]} material={steelMaterial}>
          <boxGeometry args={[0.75, 1.05, 0.65]} />
        </mesh>
        {/* Écran du respirateur d'anesthésie */}
        <group position={[0, 1.25, 0.15]} rotation={[-0.2, 0, 0]}>
          <mesh material={darkSteel}>
            <boxGeometry args={[0.48, 0.34, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.44, 0.30]} />
            <meshStandardMaterial color="#022c22" emissive="#10b981" emissiveIntensity={0.65} />
          </mesh>
        </group>
        {/* 2 Bouteilles de gaz comprimé O2 / N2O à l'arrière */}
        <mesh position={[-0.22, 0.60, -0.36]}>
          <cylinderGeometry args={[0.07, 0.07, 0.85, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.22, 0.60, -0.36]}>
          <cylinderGeometry args={[0.07, 0.07, 0.85, 20]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Détendeurs et manomètres chromés */}
        {[-0.22, 0.22].map((bx) => (
          <mesh key={`regulator-${bx}`} position={[bx, 1.06, -0.36]} material={steelMaterial}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
          </mesh>
        ))}
        {/* Vaporisateurs d'halogénés anesthésiques (Jaune Sevoflurane & Violet Isoflurane) */}
        <mesh position={[-0.14, 0.95, 0.28]}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.14, 0.95, 0.28]}>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
          <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. PORTE-SÉRUM (IV DRIP STAND) CHROMÉ EN [-1.1, 0, -2.4]                   */}
      {/* ========================================================================= */}
      <group position={[-1.1, 0, -2.4]}>
        {/* Embase étoile à 5 roulettes */}
        <mesh position={[0, 0.04, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.22, 0.24, 0.04, 16]} />
        </mesh>
        {/* Tige télescopique en inox */}
        <mesh position={[0, 1.05, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.012, 0.014, 2.0, 16]} />
        </mesh>
        {/* Potence supérieure à crochets */}
        <mesh position={[0, 2.05, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
        </mesh>
        {/* 2 Poches de perfusion translucides (Sérum physiologique) */}
        {[-0.08, 0.08].map((ix) => (
          <group key={`iv-bag-${ix}`} position={[ix, 1.85, 0]}>
            <mesh>
              <boxGeometry args={[0.07, 0.16, 0.02]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} roughness={0.1} />
            </mesh>
            {/* Tubulure fine descendante */}
            <mesh position={[0, -0.15, 0]} material={steelMaterial}>
              <cylinderGeometry args={[0.002, 0.002, 0.18, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 6. ÉCRAN CHIRURGICAL SUSPENDU (SURGICAL BOOM) EN [0.85, 1.85, -0.6]        */}
      {/* ========================================================================= */}
      <group position={[0.85, 1.85, -0.6]} rotation={[0.25, -0.45, 0]}>
        {/* Bras de suspension articulé depuis le plafond */}
        <mesh position={[0, 0.85, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.022, 0.022, 1.7, 16]} />
        </mesh>
        {/* Cadre écran 32 pouces orienté vers la table d'instruments */}
        <mesh material={darkSteel}>
          <boxGeometry args={[0.82, 0.48, 0.04]} />
        </mesh>
        {/* Dalle active affichant le flux VLA et les boîtes de détection */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.78, 0.44]} />
          <meshStandardMaterial color="#061826" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        {/* Mire de centrage caméra robotique en vert */}
        <mesh position={[0, 0, 0.024]}>
          <ringGeometry args={[0.06, 0.065, 24]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 7. DEUX SCIALYTIQUES CHIRURGICAUX SUSPENDUS HAUTE PUISSANCE (LED CLUSTERS)*/}
      {/* ========================================================================= */}
      {/* Scialytique 1 : Directement braqué sur la trousse d'instruments [0.25, 2.5, -0.15] */}
      <group position={[0.25, 2.5, -0.15]} rotation={[0.25, 0, -0.12]}>
        <mesh position={[0, 0.45, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.026, 0.026, 0.9, 20]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={darkSteel}>
          <sphereGeometry args={[0.05, 20, 20]} />
        </mesh>
        {/* Coupole parabolique chirurgicale */}
        <mesh castShadow position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.30, 0.35, 0.09, 36]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Couronne de 8 réflecteurs LED ultra-lumineux */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8;
          const rx = Math.cos(angle) * 0.18;
          const rz = Math.sin(angle) * 0.18;
          return (
            <mesh key={`scia-led-ring1-${i}`} position={[rx, -0.106, rz]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.042, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={1.2} />
            </mesh>
          );
        })}
        {/* Lentille centrale et poignée ergonomique stérile bleue */}
        <mesh position={[0, -0.106, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.065, 20]} />
          <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.3} roughness={0.3} />
        </mesh>
      </group>

      {/* Scialytique 2 : Zone arrière-plan / patient [-1.6, 2.7, -2.8] */}
      <group position={[-1.6, 2.7, -2.8]} rotation={[-0.15, 0, 0.25]}>
        <mesh position={[0, 0.45, 0]} material={steelMaterial}>
          <cylinderGeometry args={[0.026, 0.026, 0.9, 20]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={darkSteel}>
          <sphereGeometry args={[0.05, 20, 20]} />
        </mesh>
        <mesh castShadow position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.34, 0.38, 0.09, 36]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI * 2) / 8;
          const rx = Math.cos(angle) * 0.20;
          const rz = Math.sin(angle) * 0.20;
          return (
            <mesh key={`scia-led-ring2-${i}`} position={[rx, -0.106, rz]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.045, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#f8fafc" emissiveIntensity={1.2} />
            </mesh>
          );
        })}
        <mesh position={[0, -0.106, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.075, 20]} />
          <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.09, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.3} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
});
