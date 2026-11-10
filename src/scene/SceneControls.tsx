import { forwardRef } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SceneControlsProps {
  autoRotate?: boolean;
  enablePan?: boolean;
}

export const SceneControls = forwardRef<OrbitControlsImpl, SceneControlsProps>(
  function SceneControls({ autoRotate = false, enablePan = true }, ref) {
    return (
      <OrbitControls
        ref={ref}
        enableDamping={false}
        minDistance={0.12}
        maxDistance={5.0}
        maxPolarAngle={Math.PI / 2 + 0.05}
        minPolarAngle={0.02}
        rotateSpeed={0.8}
        zoomSpeed={1.0}
        panSpeed={0.8}
        enablePan={enablePan}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        target={new THREE.Vector3(0, 0.88, 0)}
      />
    );
  }
);
