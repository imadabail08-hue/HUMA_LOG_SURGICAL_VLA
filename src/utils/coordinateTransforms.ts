/**
 * Utilitaires de conversion et calibration spatiale
 * HUMA-LOG SURGICAL-VLA
 */

import { Position3D, CameraCalibration } from '../types/detection';

/**
 * Paramètres de calibration par défaut (modèle sténopé / homographie plane)
 */
export const DEFAULT_CALIBRATION: CameraCalibration = {
  camera_matrix: [
    [1200, 0, 960],
    [0, 1200, 540],
    [0, 0, 1]
  ],
  dist_coeffs: [0.02, -0.05, 0.001, 0.001, 0],
  tray_origin_pixel: [400, 480],
  pixels_per_meter: 1850 // ~1850 pixels pour 1 mètre dans le plan du plateau
};

/**
 * Coordonnées nominales calibrées dans le repère local de la boîte (Plateau)
 * Origine [0, 0, 0] = centre de la mousse EVA
 * - X : axe latéral [-145.0 mm, +146.0 mm]
 * - Y : axe longitudinal / profondeur [-12.0 mm, +15.0 mm]
 * - Z : hauteur plateau au-dessus de la mousse [26.5 mm, 31.0 mm]
 */
export const TRAY_NOMINAL_OFFSETS: Record<number, { localYMm: number; localZMm: number }> = {
  3: { localYMm: 2.0, localZMm: 27.5 },  // 03 Aiguille
  7: { localYMm: -4.0, localZMm: 28.0 }, // 07 Manche
  1: { localYMm: 8.0, localZMm: 30.5 },  // 01 Pince coupante
  4: { localYMm: -2.0, localZMm: 28.5 }, // 04 Sonde papillon
  0: { localYMm: 7.5, localZMm: 29.0 },  // 00 Ciseaux
  2: { localYMm: -5.0, localZMm: 28.0 }, // 02 Bistouri
  6: { localYMm: 1.0, localZMm: 26.5 },  // 06 Stylet
  5: { localYMm: -3.0, localZMm: 29.5 }, // 05 Pince dissectrice
};

/**
 * Conversion d'une position Three.js monde vers les coordonnées locales du repère plateau (en mètres)
 */
export function worldToTrayLocalPosition(pos: Position3D, classId?: number): { x: number; y: number; z: number } {
  // Axe X : latéral direct (identique monde et local)
  const localX = pos.x;

  // Axe Y : longitudinal (Three.js Z est la profondeur, inversée ou calibrée)
  let localY = -pos.z;
  // Si disponible, utiliser le décalage fin calibré
  if (classId !== undefined && TRAY_NOMINAL_OFFSETS[classId]) {
    localY = (TRAY_NOMINAL_OFFSETS[classId].localYMm / 1000) - (pos.z !== 0 ? pos.z * 0.1 : 0);
  }

  // Axe Z : hauteur au-dessus du fond du plateau
  // Dans le monde Three.js, la table est à Y=0.85m et les outils à Y=0.88m (30mm au-dessus)
  let localZ = pos.y > 0.5 ? pos.y - 0.85 : pos.z;
  if (classId !== undefined && TRAY_NOMINAL_OFFSETS[classId]) {
    localZ = TRAY_NOMINAL_OFFSETS[classId].localZMm / 1000;
  }

  return {
    x: Number(localX.toFixed(4)),
    y: Number(localY.toFixed(4)),
    z: Number(localZ.toFixed(4))
  };
}

/**
 * Formatage lisible des coordonnées LOCALES en millimètres pour affichage UI
 */
export function formatCoordinatesMm(
  pos: Position3D,
  classId?: number
): { xMm: string; yMm: string; zMm: string } {
  const local = worldToTrayLocalPosition(pos, classId);
  return {
    xMm: (local.x * 1000).toFixed(1),
    yMm: (local.y * 1000).toFixed(1),
    zMm: (local.z * 1000).toFixed(1)
  };
}

/**
 * Conversion d'un point pixel (image caméra) vers les coordonnées métriques 3D du plateau.
 */
export function pixelToTrayCoordinates(
  pixelX: number,
  pixelY: number,
  imageWidth: number = 800,
  imageHeight: number = 1000,
  calibration: CameraCalibration = DEFAULT_CALIBRATION
): Position3D {
  const normX = (pixelX - imageWidth / 2) / calibration.pixels_per_meter;
  // Inversion de l'axe Y pour correspondre au repère robotique (Y vers l'avant)
  const normY = -(pixelY - imageHeight / 2) / calibration.pixels_per_meter;

  return {
    x: Number(normX.toFixed(4)),
    y: Number(normY.toFixed(4)),
    z: 0.028 // Hauteur de repos standard sur le plateau (28 mm)
  };
}


