import { memo } from 'react';

/**
 * Zone Patient & Équipe chirurgicale
 * Positionnée en arrière-plan en [-1.5, 0, -2.8] (séparation spatiale nette sans collision)
 * Comprend :
 * - Table d'opération avec champ stérile bleu-vert mat (#1e4d6b, roughness: 0.85) et arceau d'anesthésie
 * - Respirateur d'anesthésie médical avec moniteur multiparamétrique (courbes ECG vertes/cyan)
 * - Pied à perfusion inox avec poches de soluté
 * - Chirurgien principal et infirmière de bloc aux silhouettes anatomiques détaillées
 */
export const MedicalPersonnel = memo(function MedicalPersonnel() {
  const surgicalGown = (
    <meshStandardMaterial color="#0e7490" roughness={0.82} metalness={0.05} />
  );

  const surgicalCap = (
    <meshStandardMaterial color="#155e75" roughness={0.88} />
  );

  const sterileMask = (
    <meshStandardMaterial color="#f8fafc" roughness={0.7} />
  );

  const sterileGloves = (
    <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.08} />
  );

  const patientSkin = (
    <meshStandardMaterial color="#e2b997" roughness={0.65} />
  );

  // RÈGLE CRITIQUE : Champ stérile bleu-vert hospitalier mat réaliste (#1e4d6b, roughness: 0.85)
  const sterileDrape = (
    <meshStandardMaterial color="#1e4d6b" roughness={0.85} metalness={0.02} />
  );

  const steelMaterial = (
    <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
  );

  return (
    <group position={[-1.5, 0, -2.8]}>
      {/* ========================================================================= */}
      {/* 1. TABLE D'OPÉRATION CHIRURGICALE DU PATIENT (HAUTEUR PLATEAU Y = 0.85)    */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Socle lourd en fonte d'acier au sol */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.90]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Colonne électro-hydraulique */}
        <mesh castShadow position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.72, 20]} />
          {steelMaterial}
        </mesh>
        {/* Plateau matelassé de la table d'opération */}
        <mesh receiveShadow position={[0, 0.83, 0]}>
          <boxGeometry args={[0.58, 0.06, 1.90]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. PATIENT ALONGÉ SOUS DRAP CHIRURGICAL BLEU-VERT STÉRILE MAT (#1e4d6b)   */}
      {/* ========================================================================= */}
      <group position={[0, 0.86, 0]}>
        {/* Coussin appui-tête ergonomique */}
        <mesh position={[0, 0.03, -0.72]}>
          <boxGeometry args={[0.28, 0.05, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Tête du patient */}
        <mesh position={[0, 0.08, -0.72]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          {patientSkin}
        </mesh>
        <mesh position={[0, 0.10, -0.74]}>
          <sphereGeometry args={[0.088, 16, 16]} />
          {surgicalCap}
        </mesh>

        {/* Arceau métallique d'anesthésie (Anesthesia Screen Arch) */}
        <group position={[0, 0.12, -0.52]}>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.010, 0.010, 0.62, 16]} />
            {steelMaterial}
          </mesh>
          {[-0.30, 0.30].map((ax) => (
            <mesh key={`arch-leg-${ax}`} position={[ax, 0.08, 0]}>
              <cylinderGeometry args={[0.010, 0.010, 0.18, 16]} />
              {steelMaterial}
            </mesh>
          ))}
        </group>

        {/* Drap chirurgical bleu-vert recouvrant le patient */}
        <mesh receiveShadow castShadow position={[0, 0.08, 0.15]}>
          <boxGeometry args={[0.58, 0.14, 1.45]} />
          {sterileDrape}
        </mesh>
        {/* Galbe anatomique du thorax sous le drap */}
        <mesh position={[0, 0.15, -0.20]}>
          <cylinderGeometry args={[0.18, 0.20, 0.45, 16]} />
          {sterileDrape}
        </mesh>
        {/* Retombées drapées sur les flancs gauche et droit */}
        <mesh position={[-0.30, 0.02, 0.15]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.18, 1.45]} />
          {sterileDrape}
        </mesh>
        <mesh position={[0.30, 0.02, 0.15]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.18, 1.45]} />
          {sterileDrape}
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3. CHARIOT D'ANESTHÉSIE / RESPIRATEUR MÉDICAL EN TÊTE DE TABLE            */}
      {/* ========================================================================= */}
      <group position={[0, 0, -1.25]}>
        {/* Meuble chariot sur 4 roulettes médicales */}
        <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
          <boxGeometry args={[0.52, 0.95, 0.45]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.15} />
        </mesh>
        {/* Tiroirs d'anesthésie et platine de rotamètres */}
        <mesh position={[0, 0.45, 0.23]}>
          <planeGeometry args={[0.46, 0.70]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
        {/* 2 Bouteilles de gaz médicaux (Oxygène & Protoxyde) à l'arrière */}
        {[-0.14, 0.14].map((bx, idx) => (
          <mesh key={`gas-bottle-${bx}`} position={[bx, 0.55, -0.24]}>
            <cylinderGeometry args={[0.065, 0.065, 0.85, 16]} />
            <meshStandardMaterial color={idx === 0 ? '#ffffff' : '#0284c7'} metalness={0.7} />
          </mesh>
        ))}

        {/* Bras support orientable et Moniteur Multiparamétrique */}
        <group position={[0.22, 1.15, 0.10]} rotation={[0, -0.35, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.36, 0.26, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {/* Écran d'affichage dynamique avec courbes ECG et SpO2 */}
          <mesh position={[0, 0, 0.042]}>
            <planeGeometry args={[0.33, 0.23]} />
            <meshBasicMaterial color="#040d1a" />
          </mesh>
          {/* Courbe ECG verte émissive */}
          <mesh position={[0, 0.04, 0.043]}>
            <planeGeometry args={[0.30, 0.05]} />
            <meshStandardMaterial color="#052e16" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
          {/* Courbe Pleth cyan émissive */}
          <mesh position={[0, -0.04, 0.043]}>
            <planeGeometry args={[0.30, 0.05]} />
            <meshStandardMaterial color="#082f49" emissive="#06b6d4" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* PIED À PERFUSION EN INOX (IV POLE) AVEC POCHES DE SOLUTÉ */}
        <group position={[-0.32, 0, 0.15]}>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 1.90, 14]} />
            {steelMaterial}
          </mesh>
          {/* Crochets supérieurs */}
          <mesh position={[0, 1.88, 0]}>
            <torusGeometry args={[0.09, 0.006, 8, 16]} />
            {steelMaterial}
          </mesh>
          {/* Poche de perfusion translucide (Sérum physiologique 0.9%) */}
          <mesh position={[0.06, 1.76, 0]}>
            <boxGeometry args={[0.05, 0.12, 0.02]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 4. CHIRURGIEN PRINCIPAL (LEAD SURGEON) - CÔTÉ GAUCHE DE LA TABLE           */}
      {/* ========================================================================= */}
      <group position={[-0.58, 0, 0.10]}>
        {/* Chaussures de bloc antistatiques */}
        {[-0.07, 0.07].map((fx) => (
          <mesh key={`surg-shoe-${fx}`} position={[fx, 0.035, 0]}>
            <boxGeometry args={[0.09, 0.07, 0.22]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        ))}

        {/* Jambes de pantalon stérile */}
        <mesh position={[-0.07, 0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.72, 12]} />
          {surgicalGown}
        </mesh>
        <mesh position={[0.07, 0.42, 0]}>
          <cylinderGeometry args={[0.055, 0.065, 0.72, 12]} />
          {surgicalGown}
        </mesh>

        {/* Buste / Blouse chirurgicale croisée avec épaulettes */}
        <mesh castShadow position={[0, 1.05, 0]}>
          <boxGeometry args={[0.38, 0.58, 0.24]} />
          {surgicalGown}
        </mesh>

        {/* Épaules anatomiques galbées */}
        {[-0.19, 0.19].map((sx) => (
          <mesh key={`shoulder-${sx}`} position={[sx, 1.30, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            {surgicalGown}
          </mesh>
        ))}

        {/* Bras fléchis naturellement en position d'intervention stérile */}
        <mesh position={[0.18, 1.04, 0.14]} rotation={[0.55, 0.25, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.30, 12]} />
          {surgicalGown}
        </mesh>
        <mesh position={[-0.18, 1.04, 0.14]} rotation={[0.55, -0.25, 0]}>
          <cylinderGeometry args={[0.042, 0.048, 0.30, 12]} />
          {surgicalGown}
        </mesh>
        {/* Avant-bras convergeant au-dessus du champ */}
        <mesh position={[0.12, 0.92, 0.26]} rotation={[0.2, -0.3, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.24, 12]} />
          {surgicalGown}
        </mesh>
        <mesh position={[-0.12, 0.92, 0.26]} rotation={[0.2, 0.3, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.24, 12]} />
          {surgicalGown}
        </mesh>
        {/* Gants chirurgicaux latex */}
        <mesh position={[0.08, 0.90, 0.34]}>
          <sphereGeometry args={[0.040, 12, 12]} />
          {sterileGloves}
        </mesh>
        <mesh position={[-0.08, 0.90, 0.34]}>
          <sphereGeometry args={[0.040, 12, 12]} />
          {sterileGloves}
        </mesh>

        {/* Tête, calot et masque */}
        <mesh position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.095, 16, 16]} />
          {patientSkin}
        </mesh>
        <mesh position={[0, 1.53, -0.01]}>
          <sphereGeometry args={[0.10, 16, 16]} />
          {surgicalCap}
        </mesh>
        <mesh position={[0, 1.46, 0.075]}>
          <boxGeometry args={[0.11, 0.07, 0.04]} />
          {sterileMask}
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 5. INSTRUMENTISTE / INFIRMIÈRE DE BLOC - CÔTÉ DROIT DE LA TABLE           */}
      {/* ========================================================================= */}
      <group position={[0.58, 0, -0.25]}>
        {/* Chaussures */}
        {[-0.06, 0.06].map((fx) => (
          <mesh key={`nurse-shoe-${fx}`} position={[fx, 0.035, 0]}>
            <boxGeometry args={[0.08, 0.07, 0.20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        ))}

        {/* Jambes */}
        <mesh position={[-0.06, 0.40, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.68, 12]} />
          {surgicalGown}
        </mesh>
        <mesh position={[0.06, 0.40, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.68, 12]} />
          {surgicalGown}
        </mesh>

        {/* Buste */}
        <mesh castShadow position={[0, 1.00, 0]}>
          <boxGeometry args={[0.34, 0.54, 0.22]} />
          {surgicalGown}
        </mesh>

        {/* Bras de l'instrumentiste orientés pour assister */}
        <mesh position={[-0.16, 0.98, 0.12]} rotation={[0.45, -0.2, 0]}>
          <cylinderGeometry args={[0.038, 0.044, 0.28, 10]} />
          {surgicalGown}
        </mesh>
        <mesh position={[0.16, 0.98, 0.12]} rotation={[0.45, 0.2, 0]}>
          <cylinderGeometry args={[0.038, 0.044, 0.28, 10]} />
          {surgicalGown}
        </mesh>
        <mesh position={[-0.12, 0.88, 0.24]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          {sterileGloves}
        </mesh>
        <mesh position={[0.12, 0.88, 0.24]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          {sterileGloves}
        </mesh>

        {/* Tête, charlotte plissée et masque */}
        <mesh position={[0, 1.40, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          {patientSkin}
        </mesh>
        <mesh position={[0, 1.44, -0.01]}>
          <sphereGeometry args={[0.095, 16, 16]} />
          {surgicalCap}
        </mesh>
        <mesh position={[0, 1.38, 0.07]}>
          <boxGeometry args={[0.10, 0.065, 0.04]} />
          {sterileMask}
        </mesh>
      </group>
    </group>
  );
});
