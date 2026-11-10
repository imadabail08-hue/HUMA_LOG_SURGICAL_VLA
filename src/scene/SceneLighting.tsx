import { memo } from 'react';
import { Environment, Lightformer } from '@react-three/drei';

export type LightingMode = 'surgery' | 'ambient' | 'uv_sterile';

interface SceneLightingProps {
  mode?: LightingMode;
}

/**
 * Système d'éclairage photoréaliste de bloc opératoire calibré en Y-UP
 * Intègre un environnement HDRI procédural par Lightformers pour les reflets de l'acier chirurgical
 * 3 modes :
 * - 'surgery' : Scialytique principal haute clarté 6000K (Mode opératoire actif)
 * - 'ambient' : Ambiance clinique tamisée bleu nuit
 * - 'uv_sterile' : Lumière ultraviolette de décontamination fluorescente 395nm
 */
export const SceneLighting = memo(function SceneLighting({
  mode = 'surgery'
}: SceneLightingProps) {
  const isUV = mode === 'uv_sterile';
  const isAmbient = mode === 'ambient';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. ENVIRONNEMENT DE RÉFLEXIONS PBR HAUTE FIDÉLITÉ (LIGHTFORMERS 100% LOCAL)*/}
      {/* ========================================================================= */}
      <Environment resolution={256}>
        {/* Plafonnier scialytique principal au-dessus de la table */}
        <Lightformer
          form="ring"
          intensity={isUV ? 0.6 : isAmbient ? 1.2 : 2.8}
          color={isUV ? '#a855f7' : isAmbient ? '#38bdf8' : '#ffffff'}
          position={[0, 3.5, 0]}
          scale={2.5}
          target={[0, 0.85, 0]}
        />
        {/* Bande latérale gauche pour les chanfreins de coupe des instruments */}
        <Lightformer
          form="rect"
          intensity={isUV ? 0.4 : 1.5}
          color={isUV ? '#7c3aed' : '#e0f2fe'}
          position={[-2, 2.2, 1.2]}
          scale={[1.5, 3, 1]}
          target={[0, 0.85, 0]}
        />
        {/* Bande latérale droite pour les reflets satinés du boîtier */}
        <Lightformer
          form="rect"
          intensity={isUV ? 0.4 : 1.5}
          color={isUV ? '#c084fc' : '#ffffff'}
          position={[2, 2.2, 1.2]}
          scale={[1.5, 3, 1]}
          target={[0, 0.85, 0]}
        />
      </Environment>

      {/* ========================================================================= */}
      {/* 2. SOURCES LUMINEUSES DIRECTES & SCIALYTIQUES                             */}
      {/* ========================================================================= */}

      {/* Lumière d'ambiance diffuse */}
      <ambientLight
        intensity={isUV ? 0.25 : isAmbient ? 0.45 : 0.85}
        color={isUV ? '#581c87' : isAmbient ? '#0c4a6e' : '#f8fafc'}
      />

      {/* Lumière hémisphérique de salle */}
      <hemisphereLight
        color={isUV ? '#7e22ce' : isAmbient ? '#0284c7' : '#e0f2fe'}
        groundColor="#090d16"
        intensity={isUV ? 0.3 : isAmbient ? 0.4 : 0.6}
      />

      {/* Scialytique principal n°1 : Dédié à la trousse et aux 8 instruments */}
      <directionalLight
        position={[0.4, 2.4, 0.5]}
        intensity={isUV ? 0.5 : isAmbient ? 0.7 : 1.2}
        color={isUV ? '#c084fc' : '#ffffff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.2}
        shadow-camera-far={4.5}
        shadow-camera-left={-0.45}
        shadow-camera-right={0.45}
        shadow-camera-top={0.45}
        shadow-camera-bottom={-0.45}
        shadow-bias={-0.00015}
      />

      {/* Scialytique secondaire n°2 : Zone arrière-plan */}
      <directionalLight
        position={[-1.5, 2.8, -2.4]}
        intensity={isUV ? 0.2 : isAmbient ? 0.4 : 0.75}
        color={isUV ? '#6b21a8' : '#e0f2fe'}
      />

      {/* Lumière de débouchage intérieur de boîte */}
      <pointLight
        position={[0.0, 1.15, 0.05]}
        intensity={isUV ? 0.8 : isAmbient ? 0.4 : 0.65}
        distance={1.1}
        color={isUV ? '#d8b4fe' : '#f0f9ff'}
      />
    </>
  );
});
