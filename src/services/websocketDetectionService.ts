import { IDetectionService } from './detectionService';
import { DetectionPayload } from '../types/detection';

export class WebSocketDetectionService implements IDetectionService {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<(payload: DetectionPayload) => void> = new Set();
  private statusListeners: Set<(status: { connected: boolean; mode: string; details?: string }) => void> = new Set();
  private connected: boolean = false;
  private reconnectTimer: number | null = null;
  private autoReconnect: boolean = false;

  constructor(url: string = 'ws://localhost:8765') {
    this.url = url;
  }

  public setUrl(newUrl: string): void {
    if (this.url !== newUrl) {
      this.url = newUrl;
      if (this.connected) {
        this.disconnect();
        this.connect();
      }
    }
  }

  public getUrl(): string {
    return this.url;
  }

  public async connect(): Promise<void> {
    this.autoReconnect = true;
    this.cleanupSocket();

    this.notifyStatus(false, `Tentative de connexion à ${this.url}...`);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.notifyStatus(true, `Connecté au flux YOLO26s-seg (${this.url})`);
      };

      this.ws.onmessage = (event) => {
        try {
          const data: DetectionPayload = JSON.parse(event.data);
          this.broadcast(data);
        } catch (e) {
          console.error('[WS] Erreur de décodage JSON:', e);
        }
      };

      this.ws.onerror = () => {
        this.notifyStatus(false, `Échec de connexion WebSocket sur ${this.url}`);
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.notifyStatus(false, 'Connexion fermée');
        if (this.autoReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      this.connected = false;
      this.notifyStatus(false, `Erreur d'initialisation WebSocket: ${e}`);
    }
  }

  public disconnect(): void {
    this.autoReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.cleanupSocket();
    this.connected = false;
    this.notifyStatus(false, 'Déconnecté manuellement');
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getMode(): 'simulation' | 'connected' {
    return 'connected';
  }

  public setMode(_mode: 'simulation' | 'connected'): void {}

  public onData(callback: (payload: DetectionPayload) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public onStatusChange(callback: (status: { connected: boolean; mode: string; details?: string }) => void): () => void {
    this.statusListeners.add(callback);
    callback({
      connected: this.connected,
      mode: 'connected',
      details: this.connected ? `En ligne sur ${this.url}` : `Hors ligne (${this.url})`
    });
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.autoReconnect) {
        this.connect();
      }
    }, 4000);
  }

  private cleanupSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch {
        // no-op
      }
      this.ws = null;
    }
  }

  private broadcast(payload: DetectionPayload): void {
    for (const listener of this.listeners) {
      listener(payload);
    }
  }

  private notifyStatus(connected: boolean, details: string): void {
    for (const listener of this.statusListeners) {
      listener({ connected, mode: 'connected', details });
    }
  }
}

export const webSocketDetectionService = new WebSocketDetectionService();
