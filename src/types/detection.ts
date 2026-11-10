/**
 * Types de détection pour HUMA-LOG SURGICAL-VLA
 * Format de données compatible YOLO26s-seg et passerelle ROS 2
 */

export interface Position3D {
  x: number; // Axe latéral du plateau (mètres)
  y: number; // Axe longitudinal / profondeur du plateau (mètres)
  z: number; // Axe vertical / hauteur au-dessus du plateau (mètres)
}

export interface Rotation3D {
  roll: number;  // Angle en degrés ou radians
  pitch: number;
  yaw: number;
  // Format quaternion standard pour intégration ROS 2 tf2
  quaternion?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
}

export interface DetectionItem {
  class_id: number;
  class_name: string;
  instance_id: number;
  confidence: number;
  center_x: number; // Pixels
  center_y: number; // Pixels
  bbox: [number, number, number, number]; // [xmin, ymin, width, height] en pixels
  polygon?: Array<[number, number]>; // Coordonnées du contour de segmentation
  segmentation_mask?: string; // Encodage RLE ou chemin de masque si applicable
  position_3d: Position3D;
  rotation_3d?: Rotation3D;
  status: 'detected' | 'tracking' | 'occluded' | 'lost';
  timestamp: string;
}

export interface DetectionPayload {
  mode: 'simulation' | 'connected';
  timestamp: string;
  frame_id: number;
  processing_time_ms: number;
  detections: DetectionItem[];
  system_status?: {
    model_name: string;
    inference_device: string;
    fps: number;
    camera_resolution: string;
    yolo_connected: boolean;
    camera_connected: boolean;
    ros2_connected: boolean;
  };
}

export interface CameraCalibration {
  camera_matrix: number[][]; // Matrice intrinsèque K 3x3
  dist_coeffs: number[];     // Coefficients de distorsion radiale/tangentielle
  tray_origin_pixel: [number, number]; // Origine 2D du repère plateau
  pixels_per_meter: number;  // Facteur d'échelle approximatif pour calibration plane
}

