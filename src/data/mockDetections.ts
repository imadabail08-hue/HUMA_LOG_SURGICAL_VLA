/**
 * Données de détection simulées pour le jumeau numérique HUMA-LOG SURGICAL-VLA
 * Calibrées sur les photographies réelles de la valise médicale chirurgicale
 * (Système de coordonnées standard Three.js Y-UP : X latéral, Y hauteur, Z profondeur)
 *
 * MENTION LÉGALE SOUTENANCE :
 * Ces données correspondent au mode simulation étalonné sur les dimensions réelles.
 */

import { DetectionItem, DetectionPayload } from '../types/detection';

/**
 * Constantes statiques immuables des 8 instruments chirurgicaux (ZÉRO JITTER)
 * Ordre réel de gauche à droite :
 * 03 (Aiguille) -> 07 (Manche) -> 01 (Pince coupante) -> 04 (Sonde papillon) ->
 * 00 (Ciseaux) -> 02 (Bistouri fixe) -> 06 (Stylet mousse) -> 05 (Pince à disséquer)
 */
export const NOMINAL_POSITIONS: Record<number, { x: number; y: number; z: number; yaw: number }> = {
  3: { x: -0.140, y: 0.880, z: 0.000, yaw: 0.0 },   // 03: dissecting_needle
  7: { x: -0.098, y: 0.880, z: 0.000, yaw: 0.0 },   // 07: scalpel_handle
  1: { x: -0.052, y: 0.880, z: -0.008, yaw: 0.0 },  // 01: cutting_nipper
  4: { x: 0.004,  y: 0.880, z: 0.000, yaw: 0.0 },   // 04: grooved_director
  0: { x: 0.048,  y: 0.880, z: -0.008, yaw: 0.0 },  // 00: surgical_scissors
  2: { x: 0.092,  y: 0.880, z: 0.000, yaw: 0.0 },   // 02: dissecting_scalpel
  6: { x: 0.122,  y: 0.880, z: 0.000, yaw: 0.0 },   // 06: blunt_probe
  5: { x: 0.146,  y: 0.880, z: 0.000, yaw: 0.0 },   // 05: dissecting_forceps
};

export const INITIAL_MOCK_DETECTIONS: DetectionItem[] = [
  // 1. Aiguille droite de dissection (Far-left)
  {
    class_id: 3,
    class_name: 'dissecting_needle',
    instance_id: 104,
    confidence: 0.964,
    center_x: 162,
    center_y: 395,
    bbox: [138, 165, 50, 460],
    polygon: [
      [160, 165], [165, 165], [168, 275], [172, 380], [170, 500],
      [166, 615], [158, 625], [156, 500], [154, 380], [156, 275]
    ],
    position_3d: { ...NOMINAL_POSITIONS[3] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 2. Manche de bistouri n°3/4 (2nd from left)
  {
    class_id: 7,
    class_name: 'scalpel_handle',
    instance_id: 108,
    confidence: 0.982,
    center_x: 238,
    center_y: 398,
    bbox: [208, 195, 62, 405],
    polygon: [
      [234, 195], [244, 195], [246, 260], [248, 380], [250, 520],
      [244, 600], [228, 600], [224, 520], [226, 380], [230, 260]
    ],
    position_3d: { ...NOMINAL_POSITIONS[7] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 3. Pince coupante / rongeur articulée (3rd from left)
  {
    class_id: 1,
    class_name: 'cutting_nipper',
    instance_id: 102,
    confidence: 0.956,
    center_x: 382,
    center_y: 360,
    bbox: [302, 215, 162, 290],
    polygon: [
      [372, 215], [392, 215], [405, 270], [420, 360], [455, 480],
      [440, 505], [395, 420], [382, 380], [365, 420], [320, 505],
      [305, 480], [345, 360], [360, 270]
    ],
    position_3d: { ...NOMINAL_POSITIONS[1] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 4. Sonde cannelée papillon double palette (4th from left, center)
  {
    class_id: 4,
    class_name: 'grooved_director',
    instance_id: 105,
    confidence: 0.971,
    center_x: 510,
    center_y: 395,
    bbox: [475, 170, 70, 450],
    polygon: [
      [490, 172], [530, 172], [535, 220], [514, 235], [514, 550],
      [536, 570], [530, 620], [490, 620], [484, 570], [506, 550],
      [506, 235], [485, 220]
    ],
    position_3d: { ...NOMINAL_POSITIONS[4] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 5. Ciseaux chirurgicaux droits (5th from left)
  {
    class_id: 0,
    class_name: 'surgical_scissors',
    instance_id: 101,
    confidence: 0.988,
    center_x: 625,
    center_y: 375,
    bbox: [550, 190, 155, 375],
    polygon: [
      [618, 190], [632, 190], [635, 330], [655, 450], [695, 520],
      [680, 565], [635, 550], [625, 470], [615, 550], [570, 565],
      [555, 520], [595, 450], [615, 330]
    ],
    position_3d: { ...NOMINAL_POSITIONS[0] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 6. Bistouri fixe de dissection (6th from left)
  {
    class_id: 2,
    class_name: 'dissecting_scalpel',
    instance_id: 103,
    confidence: 0.978,
    center_x: 732,
    center_y: 395,
    bbox: [702, 175, 62, 440],
    polygon: [
      [725, 175], [745, 185], [748, 255], [740, 360], [748, 520],
      [748, 615], [724, 615], [722, 520], [726, 360], [720, 255]
    ],
    position_3d: { ...NOMINAL_POSITIONS[2] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 7. Stylet à pointe mousse (7th from left)
  {
    class_id: 6,
    class_name: 'blunt_probe',
    instance_id: 107,
    confidence: 0.942,
    center_x: 802,
    center_y: 400,
    bbox: [780, 185, 45, 430],
    polygon: [
      [798, 185], [808, 185], [806, 350], [806, 500], [808, 615],
      [798, 615], [798, 500], [798, 350]
    ],
    position_3d: { ...NOMINAL_POSITIONS[6] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  },

  // 8. Pince à disséquer dentelée (8th from left, far-right)
  {
    class_id: 5,
    class_name: 'dissecting_forceps',
    instance_id: 106,
    confidence: 0.985,
    center_x: 865,
    center_y: 392,
    bbox: [830, 180, 75, 425],
    polygon: [
      [842, 180], [854, 180], [872, 180], [884, 180], [876, 340],
      [888, 480], [884, 605], [872, 605], [862, 500], [862, 340]
    ],
    position_3d: { ...NOMINAL_POSITIONS[5] },
    rotation_3d: {
      roll: 0,
      pitch: 0,
      yaw: 0.0,
      quaternion: { x: 0, y: 0, z: 0, w: 1.0 }
    },
    status: 'detected',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_MOCK_PAYLOAD: DetectionPayload = {
  mode: 'simulation',
  timestamp: new Date().toISOString(),
  frame_id: 1042,
  processing_time_ms: 18.4,
  detections: INITIAL_MOCK_DETECTIONS,
  system_status: {
    model_name: 'YOLO26s-seg (Simulé)',
    inference_device: 'CUDA:0 / TensorRT (Simulation)',
    fps: 48.5,
    camera_resolution: '1024x768 (Valise médicale réelle)',
    yolo_connected: false,
    camera_connected: false,
    ros2_connected: false
  }
};
