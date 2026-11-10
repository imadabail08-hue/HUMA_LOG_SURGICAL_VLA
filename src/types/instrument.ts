/**
 * Spécification des instruments chirurgicaux officiels
 * HUMA-LOG SURGICAL-VLA
 */

import { Position3D, Rotation3D } from './detection';

export interface InstrumentClassDefinition {
  id: number;
  name: string;
  french_name: string;
  color: string; // Code hexadécimal imposé
  description: string;
  category: 'cutting' | 'grasping' | 'probing' | 'handling';
  length_mm: number;
  width_mm: number;
  model_filename?: string;
  clinical_purpose: string;
}

export interface InstrumentInstance {
  instance_id: number;
  class_id: number;
  class_name: string;
  french_name: string;
  color: string;
  position_3d: Position3D;
  rotation_3d: Rotation3D;
  confidence: number;
  detection_status: 'detected' | 'tracking' | 'occluded' | 'lost';
  is_selected?: boolean;
  is_hovered?: boolean;
  last_seen: string;
}

export type TrayLayoutTheme = 'stainless_steel' | 'dissection_case' | 'clean_room';

