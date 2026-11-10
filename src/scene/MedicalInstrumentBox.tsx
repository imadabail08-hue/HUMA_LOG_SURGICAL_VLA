import { memo, useMemo } from 'react';
import * as THREE from 'three';

export type BoxInteriorStyle = 'red_velvet' | 'eva_foam' | 'elastic_bands';

interface MedicalInstrumentBoxProps {
  interiorStyle?: BoxInteriorStyle;
}

/**
 * Valise / Trousse médicale chirurgicale ouverte posée au centre de la table en [0, 0.85, 0]
 * Système Y-UP : X latéral (380 mm), Y hauteur (fond Y=0.85m), Z profondeur (280 mm)
 * 3 modes :
 * 1. 'red_velvet' : Trousse zippée velours rouge carmin (100% conforme à la photo réelle)
 * 2. 'eva_foam' : Mallette rigide avec mousse EVA grise usinée
 * 3. 'elastic_bands' : Mallette rigide fond bleu nuit avec sangles
 */
export const MedicalInstrumentBox = memo(function MedicalInstrumentBox({
  interiorStyle = 'red_velvet'
}: MedicalInstrumentBoxProps) {
  const boxWidth = 0.38;    // 380 mm (X)
  const boxDepth = 0.28;    // 280 mm (Z)
  const wallHeight = 0.038; // 38 mm (Y)
  const wallThick = 0.008;  // 8 mm
  const lidAngle = 108 * (Math.PI / 180); // Ouverture 108° vers l'arrière (-Z)

  const isRedVelvet = interiorStyle === 'red_velvet';
  const isFoam = interiorStyle === 'eva_foam';

  // Matériau composite extérieur bleu nuit mat antireflet
  const navyComposite = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#101c2c', roughness: 0.7, metalness: 0.12 }),
    []
  );

  // Profilé aluminium satiné brossé
  const aluminumFrame = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.82, roughness: 0.32 }),
    []
  );

  // Chrome poli pour ferrures et coins sphériques
  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.94, roughness: 0.18 }),
    []
  );

  // Matériau cuir/nylon noir extérieur de la trousse zippée
  const blackLeatherMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#11141a', roughness: 0.78, metalness: 0.15 }),
    []
  );

  // Matériau velours rouge carmin chirurgical haute fidélité (Photo réelle)
  const redVelvetMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#991b1b', // Rouge carmin profond
      roughness: 0.88,
      metalness: 0.04
    }),
    []
  );

  // Matériau élastique tissé noir
  const blackElasticMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.92, metalness: 0.02 }),
    []
  );

  // Matériau glissière fermeture éclair zippée argentée
  const zipperTrackMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.85, roughness: 0.28 }),
    []
  );

  return (
    <group position={[0, 0.85, 0]}>
      {/* ========================================================================= */}
      {/* 1. CUVE PRINCIPALE DE LA TROUSSE / VALISE                                 */}
      {/* ========================================================================= */}

      {/* Fond inférieur de la trousse / valise */}
      <mesh receiveShadow position={[0, 0.002, 0]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
        <boxGeometry args={[boxWidth, 0.004, boxDepth]} />
      </mesh>

      {/* Parois périphériques */}
      {/* Paroi avant (+Z) */}
      <mesh castShadow receiveShadow position={[0, wallHeight / 2, boxDepth / 2 - wallThick / 2]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
        <boxGeometry args={[boxWidth, wallHeight, wallThick]} />
      </mesh>
      {/* Paroi arrière (-Z) */}
      <mesh castShadow receiveShadow position={[0, wallHeight / 2, -boxDepth / 2 + wallThick / 2]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
        <boxGeometry args={[boxWidth, wallHeight, wallThick]} />
      </mesh>
      {/* Paroi gauche (-X) */}
      <mesh castShadow receiveShadow position={[-boxWidth / 2 + wallThick / 2, wallHeight / 2, 0]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
        <boxGeometry args={[wallThick, wallHeight, boxDepth - wallThick * 2]} />
      </mesh>
      {/* Paroi droite (+X) */}
      <mesh castShadow receiveShadow position={[boxWidth / 2 - wallThick / 2, wallHeight / 2, 0]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
        <boxGeometry args={[wallThick, wallHeight, boxDepth - wallThick * 2]} />
      </mesh>

      {/* Bordure supérieure : Soit glissière de fermeture éclair argentée (velours), soit profilé alu (valise) */}
      {isRedVelvet ? (
        <group>
          {/* Ligne de zip argentée tout autour du bord supérieur */}
          <mesh position={[0, wallHeight + 0.001, boxDepth / 2 - wallThick / 2]} material={zipperTrackMat}>
            <boxGeometry args={[boxWidth, 0.003, 0.004]} />
          </mesh>
          <mesh position={[0, wallHeight + 0.001, -boxDepth / 2 + wallThick / 2]} material={zipperTrackMat}>
            <boxGeometry args={[boxWidth, 0.003, 0.004]} />
          </mesh>
          <mesh position={[-boxWidth / 2 + wallThick / 2, wallHeight + 0.001, 0]} material={zipperTrackMat}>
            <boxGeometry args={[0.004, 0.003, boxDepth]} />
          </mesh>
          <mesh position={[boxWidth / 2 - wallThick / 2, wallHeight + 0.001, 0]} material={zipperTrackMat}>
            <boxGeometry args={[0.004, 0.003, boxDepth]} />
          </mesh>
          {/* Curseur de fermeture éclair en métal */}
          <mesh position={[-boxWidth / 2 + 0.015, wallHeight + 0.003, boxDepth / 2 - 0.012]} material={chrome}>
            <boxGeometry args={[0.008, 0.006, 0.014]} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh position={[0, wallHeight - 0.002, boxDepth / 2 - wallThick / 2]} material={aluminumFrame}>
            <boxGeometry args={[boxWidth + 0.002, 0.004, wallThick + 0.002]} />
          </mesh>
          <mesh position={[0, wallHeight - 0.002, -boxDepth / 2 + wallThick / 2]} material={aluminumFrame}>
            <boxGeometry args={[boxWidth + 0.002, 0.004, wallThick + 0.002]} />
          </mesh>
          <mesh position={[-boxWidth / 2 + wallThick / 2, wallHeight - 0.002, 0]} material={aluminumFrame}>
            <boxGeometry args={[wallThick + 0.002, 0.004, boxDepth + 0.002]} />
          </mesh>
          <mesh position={[boxWidth / 2 - wallThick / 2, wallHeight - 0.002, 0]} material={aluminumFrame}>
            <boxGeometry args={[wallThick + 0.002, 0.004, boxDepth + 0.002]} />
          </mesh>
        </group>
      )}

      {/* 4 Renforts d'angle pour la valise rigide */}
      {!isRedVelvet &&
        [-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh
              key={`corner-base-${sx}-${sz}`}
              position={[(boxWidth / 2) * sx, 0.014, (boxDepth / 2) * sz]}
              castShadow
              material={chrome}
            >
              <sphereGeometry args={[0.014, 16, 16]} />
            </mesh>
          ))
        )}

      {/* Poignée et grenouillères chromées (valise rigide uniquement) */}
      {!isRedVelvet && (
        <group position={[0, wallHeight / 2, boxDepth / 2 + 0.012]}>
          <mesh castShadow position={[0, 0, 0]} material={aluminumFrame}>
            <boxGeometry args={[0.11, 0.018, 0.008]} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.022]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.009, 0.009, 0.10, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.85} />
          </mesh>
          {[-0.045, 0.045].map((hx) => (
            <mesh key={hx} position={[hx, 0, 0.011]}>
              <cylinderGeometry args={[0.008, 0.008, 0.02, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.85} />
            </mesh>
          ))}
          {[-0.12, 0.12].map((lx) => (
            <mesh key={`latch-${lx}`} position={[lx, 0, -0.009]} material={chrome}>
              <boxGeometry args={[0.022, 0.026, 0.006]} />
            </mesh>
          ))}
        </group>
      )}

      {/* ========================================================================= */}
      {/* 2. INSERT INTÉRIEUR CONFORME AU STYLE SÉLECTIONNÉ                          */}
      {/* ========================================================================= */}

      {isRedVelvet ? (
        /* Configuration 1 (PHOTO RÉELLE) : Velours Rouge Carmin & Élastiques Noirs */
        <group position={[0, 0.004, 0]}>
          {/* Matelas de velours rouge carmin texturé */}
          <mesh receiveShadow position={[0, 0.011, 0]} material={redVelvetMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.004, 0.022, boxDepth - wallThick * 2 - 0.004]} />
          </mesh>

          {/* Surélévations douces en velours sous chaque zone d'instrument */}
          <mesh receiveShadow position={[0, 0.023, 0]} material={redVelvetMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.012, 0.002, boxDepth - wallThick * 2 - 0.012]} />
          </mesh>

          {/* SANGLES ÉLASTIQUES NOIRES TRANSVERSALES CONFORMES À LA PHOTO RÉELLE */}
          {/* Sangle supérieure retenant les tiges (-Z) */}
          <mesh position={[0, 0.025, -0.038]} material={blackElasticMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.01, 0.003, 0.016]} />
          </mesh>
          {/* Sangle inférieure retenant les manches (+Z) */}
          <mesh position={[0, 0.025, 0.042]} material={blackElasticMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.01, 0.003, 0.016]} />
          </mesh>

          {/* Passants de couture individuels pour chaque instrument (effet compartimenté) */}
          {[-0.14, -0.098, -0.052, 0.004, 0.048, 0.092, 0.122].map((px) => (
            <group key={`stitch-${px}`}>
              <mesh position={[px + 0.018, 0.026, -0.038]}>
                <boxGeometry args={[0.002, 0.002, 0.017]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[px + 0.018, 0.026, 0.042]}>
                <boxGeometry args={[0.002, 0.002, 0.017]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      ) : isFoam ? (
        /* Configuration 2 : Mousse EVA Anthracite avec Rigole Centrale */
        <group position={[0, 0.004, 0]}>
          <mesh receiveShadow position={[0, 0.010, -0.076]}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.004, 0.020, 0.108]} />
            <meshStandardMaterial color="#1c2026" roughness={0.90} metalness={0.05} />
          </mesh>
          <mesh receiveShadow position={[0, 0.010, 0.076]}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.004, 0.020, 0.108]} />
            <meshStandardMaterial color="#1c2026" roughness={0.90} metalness={0.05} />
          </mesh>
          <mesh receiveShadow position={[0, 0.004, 0]}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.004, 0.008, 0.044]} />
            <meshStandardMaterial color="#111318" roughness={0.95} metalness={0.02} />
          </mesh>
        </group>
      ) : (
        /* Configuration 3 : Fond Bleu Nuit et Sangles */
        <group position={[0, 0.004, 0]}>
          <mesh receiveShadow position={[0, 0.009, 0]}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.004, 0.018, boxDepth - wallThick * 2 - 0.004]} />
            <meshStandardMaterial color="#162438" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.019, -0.04]} material={blackElasticMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.008, 0.002, 0.022]} />
          </mesh>
          <mesh position={[0, 0.019, 0.04]} material={blackElasticMat}>
            <boxGeometry args={[boxWidth - wallThick * 2 - 0.008, 0.002, 0.022]} />
          </mesh>
        </group>
      )}

      {/* ========================================================================= */}
      {/* 3. COUVERCLE DE LA VALISE / RABAT DE LA TROUSSE OUVERT À 108°              */}
      {/* ========================================================================= */}
      <group position={[0, wallHeight, -boxDepth / 2 + wallThick / 2]} rotation={[-(Math.PI - lidAngle), 0, 0]}>
        {/* Paroi externe du rabat / couvercle */}
        <mesh castShadow position={[0, boxDepth / 2, -0.016]} material={isRedVelvet ? blackLeatherMat : navyComposite}>
          <boxGeometry args={[boxWidth, boxDepth, 0.024]} />
        </mesh>

        {/* Encadrement */}
        {!isRedVelvet && (
          <mesh position={[0, boxDepth / 2, -0.002]} material={aluminumFrame}>
            <boxGeometry args={[boxWidth + 0.004, boxDepth + 0.004, 0.006]} />
          </mesh>
        )}

        {/* Doublure intérieure du couvercle */}
        <mesh position={[0, boxDepth / 2, 0.002]} material={isRedVelvet ? redVelvetMat : navyComposite}>
          <planeGeometry args={[boxWidth - 0.022, boxDepth - 0.022]} />
        </mesh>

        {/* Pochette intérieure zippée en nylon noir pour accessoires */}
        <mesh position={[0, boxDepth / 2 - 0.02, 0.006]} material={blackLeatherMat}>
          <planeGeometry args={[boxWidth - 0.08, 0.12]} />
        </mesh>
        <mesh position={[0, boxDepth / 2 + 0.04, 0.008]} material={zipperTrackMat}>
          <boxGeometry args={[boxWidth - 0.08, 0.004, 0.002]} />
        </mesh>
      </group>
    </group>
  );
});
