import { memo } from 'react';

interface SurgicalTableProps {
  showDrape?: boolean;
}

/**
 * Table à instruments chirurgicale (Zone d'Inspection Vision centrale [0, 0, 0])
 * Hauteur plateau supérieur calibrée exactement à Y = 0.85 m
 */
export const SurgicalTable = memo(function SurgicalTable({
  showDrape = true
}: SurgicalTableProps) {
  const tableWidth = 0.68;   // 680 mm (X latéral)
  const tableDepth = 0.52;   // 520 mm (Z longitudinal)
  const topThickness = 0.025; // 25 mm
  const tableTopY = 0.85;    // Hauteur exacte Y = 0.85 m

  // Inox chirurgical 304L satiné antireflet
  const stainlessSteel = (
    <meshStandardMaterial
      color="#cbd5e1"
      metalness={0.82}
      roughness={0.28}
    />
  );

  return (
    <group position={[0, 0, 0]}>
      {/* 1. PLATEAU SUPÉRIEUR EN INOX CHIRURGICAL À Y = 0.85 */}
      <mesh receiveShadow position={[0, tableTopY - topThickness / 2, 0]}>
        <boxGeometry args={[tableWidth, topThickness, tableDepth]} />
        {stainlessSteel}
      </mesh>

      {/* Rebords de retenue anti-chute périphériques (Marine edge) */}
      <mesh position={[0, tableTopY + 0.005, tableDepth / 2 - 0.005]}>
        <boxGeometry args={[tableWidth, 0.012, 0.010]} />
        {stainlessSteel}
      </mesh>
      <mesh position={[0, tableTopY + 0.005, -tableDepth / 2 + 0.005]}>
        <boxGeometry args={[tableWidth, 0.012, 0.010]} />
        {stainlessSteel}
      </mesh>
      <mesh position={[tableWidth / 2 - 0.005, tableTopY + 0.005, 0]}>
        <boxGeometry args={[0.010, 0.012, tableDepth - 0.02]} />
        {stainlessSteel}
      </mesh>
      <mesh position={[-tableWidth / 2 + 0.005, tableTopY + 0.005, 0]}>
        <boxGeometry args={[0.010, 0.012, tableDepth - 0.02]} />
        {stainlessSteel}
      </mesh>

      {/* 2. CHAMP STÉRILE / DRAP CHIRURGICAL BLEU MÉDICAL REPLIÉ SUR L'AVANT */}
      {showDrape && (
        <group position={[0, tableTopY + 0.001, tableDepth / 2 - 0.08]}>
          <mesh receiveShadow position={[0, 0.002, 0]}>
            <boxGeometry args={[tableWidth - 0.04, 0.004, 0.14]} />
            <meshStandardMaterial color="#1e40af" roughness={0.92} />
          </mesh>
          {/* Retombée du drap sur la face avant (+Z) */}
          <mesh position={[0, -0.06, 0.07]}>
            <boxGeometry args={[tableWidth - 0.04, 0.12, 0.004]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.94} />
          </mesh>
        </group>
      )}

      {/* 3. COLONNE TÉLESCOPIQUE CENTRALE LOURDE & RAILS */}
      <group position={[0, 0.42, 0]}>
        {/* Fût supérieur inox */}
        <mesh castShadow position={[0, 0.20, 0]}>
          <cylinderGeometry args={[0.06, 0.065, 0.40, 20]} />
          {stainlessSteel}
        </mesh>
        {/* Bague de réglage ergonomique */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Fût inférieur lourd */}
        <mesh castShadow position={[0, -0.20, 0]}>
          <cylinderGeometry args={[0.07, 0.075, 0.40, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
      </group>

      {/* 4. EMBASE EN H OU TRÉPIED AU SOL AVEC 4 ROULETTES MÉDICALES FREINÉES */}
      <group position={[0, 0.04, 0]}>
        {/* Branches en H au sol */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[tableWidth * 0.75, 0.035, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {[-tableWidth * 0.35, tableWidth * 0.35].map((bx) => (
          <mesh key={`leg-bar-${bx}`} position={[bx, 0, 0]}>
            <boxGeometry args={[0.05, 0.035, tableDepth * 0.85]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
        ))}

        {/* 4 Roulettes antistatiques doubles au sol Y = 0 */}
        {[-tableWidth * 0.35, tableWidth * 0.35].map((wx) =>
          [-tableDepth * 0.38, tableDepth * 0.38].map((wz) => (
            <group key={`table-wheel-${wx}-${wz}`} position={[wx, -0.015, wz]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.012, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            </group>
          ))
        )}
      </group>
    </group>
  );
});
