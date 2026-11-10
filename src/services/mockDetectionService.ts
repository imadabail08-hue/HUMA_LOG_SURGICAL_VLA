import { IDetectionService } from './detectionService';
import { DetectionPayload, DetectionItem, Position3D } from '../types/detection';
import { INITIAL_MOCK_PAYLOAD, NOMINAL_POSITIONS } from '../data/mockDetections';

export class MockDetectionService implements IDetectionService {
  private listeners: Set<(payload: DetectionPayload) => void> = new Set();
  private statusListeners: Set<(status: { connected: boolean; mode: string; details?: string }) => void> = new Set();
  private currentPayload: DetectionPayload;
  private intervalId: number | null = null;
  private isRunning: boolean = true;
  private microMotionEnabled: boolean = false; // Désactivé par défaut pour un affichage 100% stable
  private tickCount: number = 0;
  private selectedInstanceId: number | null = null;

  constructor() {
    this.currentPayload = JSON.parse(JSON.stringify(INITIAL_MOCK_PAYLOAD));
    this.startSimulationLoop();
  }

  public async connect(): Promise<void> {
    this.isRunning = true;
    this.notifyStatus(true, 'Service de simulation actif');
  }

  public disconnect(): void {
    this.stopSimulationLoop();
    this.notifyStatus(false, 'Simulation en pause');
  }

  public isConnected(): boolean {
    return this.isRunning;
  }

  public getMode(): 'simulation' | 'connected' {
    return 'simulation';
  }

  public setMode(_mode: 'simulation' | 'connected'): void {
    // Mode simulation prioritaire
  }

  public onData(callback: (payload: DetectionPayload) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentPayload);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public onStatusChange(callback: (status: { connected: boolean; mode: string; details?: string }) => void): () => void {
    this.statusListeners.add(callback);
    callback({ connected: this.isRunning, mode: 'simulation', details: 'Générateur de données étalonné actif' });
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public toggleSimulationPlay(playing: boolean): void {
    this.isRunning = playing;
    if (playing && !this.intervalId) {
      this.startSimulationLoop();
    } else if (!playing && this.intervalId) {
      this.stopSimulationLoop();
    }
    this.notifyStatus(playing, playing ? 'Simulation en cours' : 'Simulation figée');
  }

  public setMicroMotion(enabled: boolean): void {
    this.microMotionEnabled = enabled;
  }

  public updateInstrumentPosition(instanceId: number, position: Position3D): void {
    this.currentPayload.detections = this.currentPayload.detections.map(item => {
      if (item.instance_id === instanceId) {
        return {
          ...item,
          position_3d: { ...position },
          timestamp: new Date().toISOString()
        };
      }
      return item;
    });
    this.broadcast();
  }

  public toggleInstrumentDetection(instanceId: number): void {
    this.currentPayload.detections = this.currentPayload.detections.map(item => {
      if (item.instance_id === instanceId) {
        const nextStatus = item.status === 'detected' ? 'occluded' : 'detected';
        return {
          ...item,
          status: nextStatus,
          confidence: nextStatus === 'detected' ? 0.95 : 0.0,
          timestamp: new Date().toISOString()
        };
      }
      return item;
    });
    this.broadcast();
  }

  public triggerOcclusionSimulation(instanceId: number): void {
    this.toggleInstrumentDetection(instanceId);
  }

  public setSelectedInstanceId(id: number | null): void {
    this.selectedInstanceId = id;
    if (id !== null) {
      // Figer immédiatement l'ensemble des instruments à 0 variation
      this.currentPayload = {
        ...this.currentPayload,
        detections: this.currentPayload.detections.map((d) => {
          const nominal = NOMINAL_POSITIONS[d.class_id];
          return nominal
            ? { ...d, position_3d: { ...nominal } }
            : d;
        })
      };
      this.broadcast();
    }
  }

  public resetToDefault(): void {
    this.currentPayload = JSON.parse(JSON.stringify(INITIAL_MOCK_PAYLOAD));
    this.broadcast();
  }

  private startSimulationLoop(): void {
    if (this.intervalId) return;

    // Ralenti à 2 Hz (500 ms) strict pour éliminer toute charge et re-render superflu
    this.intervalId = window.setInterval(() => {
      if (!this.isRunning) return;

      // Si un instrument est en cours d'inspection, figer à 0 variation de télémétrie
      if (this.selectedInstanceId !== null) return;

      this.tickCount++;
      const timeMs = 18.4 + Math.sin(this.tickCount * 0.2) * 1.2;

      const updatedDetections: DetectionItem[] = this.currentPayload.detections.map((item) => {
        const nominal = NOMINAL_POSITIONS[item.class_id];
        return {
          ...item,
          // Positions 3D TOUJOURS strictement égales aux constantes nominales
          position_3d: nominal ? { ...nominal } : item.position_3d,
          confidence: item.status === 'detected' ? Math.min(0.99, Math.max(0.92, item.confidence)) : 0.0,
          timestamp: new Date().toISOString()
        };
      });

      this.currentPayload = {
        ...this.currentPayload,
        frame_id: this.currentPayload.frame_id + 1,
        timestamp: new Date().toISOString(),
        processing_time_ms: Number(timeMs.toFixed(1)),
        detections: updatedDetections
      };

      this.broadcast();
    }, 500);
  }

  private stopSimulationLoop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private broadcast(): void {
    for (const listener of this.listeners) {
      listener(this.currentPayload);
    }
  }

  private notifyStatus(connected: boolean, details: string): void {
    for (const listener of this.statusListeners) {
      listener({ connected, mode: 'simulation', details });
    }
  }
}

// Instance singleton
export const mockDetectionService = new MockDetectionService();
