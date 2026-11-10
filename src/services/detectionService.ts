import { DetectionPayload, Position3D } from '../types/detection';
import { mockDetectionService } from './mockDetectionService';
import { webSocketDetectionService } from './websocketDetectionService';

export interface IDetectionService {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  getMode(): 'simulation' | 'connected';
  setMode(mode: 'simulation' | 'connected'): void;
  onData(callback: (payload: DetectionPayload) => void): () => void;
  onStatusChange(callback: (status: { connected: boolean; mode: string; details?: string }) => void): () => void;
  updateInstrumentPosition?(instanceId: number, position: Position3D): void;
  toggleSimulationPlay?(playing: boolean): void;
  triggerOcclusionSimulation?(instanceId: number): void;
}

class UnifiedDetectionManager {
  private mode: 'simulation' | 'connected' = 'simulation';
  private dataListeners: Set<(payload: DetectionPayload) => void> = new Set();
  private statusListeners: Set<(status: { mode: 'simulation' | 'connected'; connected: boolean; details: string }) => void> = new Set();
  private unsubscribeData: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;

  constructor() {
    this.bindCurrentService();
  }

  public getMode(): 'simulation' | 'connected' {
    return this.mode;
  }

  public setMode(newMode: 'simulation' | 'connected') {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.bindCurrentService();
  }

  public getActiveService(): IDetectionService {
    return this.mode === 'simulation' ? mockDetectionService : webSocketDetectionService;
  }

  public subscribe(callback: (payload: DetectionPayload) => void): () => void {
    this.dataListeners.add(callback);
    return () => {
      this.dataListeners.delete(callback);
    };
  }

  public subscribeStatus(callback: (status: { mode: 'simulation' | 'connected'; connected: boolean; details: string }) => void): () => void {
    this.statusListeners.add(callback);
    // Émission immédiate de l'état actuel
    const s = this.getActiveService();
    callback({
      mode: this.mode,
      connected: s.isConnected(),
      details: this.mode === 'simulation' ? 'Générateur de données simulées' : 'Flux WebSocket direct YOLO26s-seg'
    });
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public updatePosition(instanceId: number, position: Position3D) {
    if (this.mode === 'simulation' && mockDetectionService.updateInstrumentPosition) {
      mockDetectionService.updateInstrumentPosition(instanceId, position);
    }
  }

  public togglePlay(playing: boolean) {
    if (this.mode === 'simulation' && mockDetectionService.toggleSimulationPlay) {
      mockDetectionService.toggleSimulationPlay(playing);
    }
  }

  public toggleOcclusion(instanceId: number) {
    if (this.mode === 'simulation' && mockDetectionService.triggerOcclusionSimulation) {
      mockDetectionService.triggerOcclusionSimulation(instanceId);
    }
  }

  public setSelectedInstanceId(id: number | null) {
    if (this.mode === 'simulation') {
      mockDetectionService.setSelectedInstanceId(id);
    }
  }

  public resetSimulation() {
    if (this.mode === 'simulation') {
      mockDetectionService.resetToDefault();
    }
  }

  private bindCurrentService() {
    if (this.unsubscribeData) this.unsubscribeData();
    if (this.unsubscribeStatus) this.unsubscribeStatus();

    const service = this.getActiveService();

    this.unsubscribeData = service.onData((payload) => {
      for (const listener of this.dataListeners) {
        listener(payload);
      }
    });

    this.unsubscribeStatus = service.onStatusChange((status) => {
      for (const listener of this.statusListeners) {
        listener({
          mode: this.mode,
          connected: status.connected,
          details: status.details || ''
        });
      }
    });
  }
}

export const detectionManager = new UnifiedDetectionManager();
