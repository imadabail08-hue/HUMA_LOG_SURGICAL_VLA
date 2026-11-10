import { useState, useEffect, useCallback } from 'react';
import { detectionManager } from '../services/detectionService';
import { DetectionPayload, DetectionItem, Position3D } from '../types/detection';
import { INITIAL_MOCK_PAYLOAD } from '../data/mockDetections';

export function useDetectionStream() {
  const [payload, setPayload] = useState<DetectionPayload>(INITIAL_MOCK_PAYLOAD);
  const [status, setStatus] = useState({
    mode: detectionManager.getMode(),
    connected: true,
    details: 'Initialisation du jumeau numérique...'
  });
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [hoveredInstanceId, setHoveredInstanceId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    const unsubData = detectionManager.subscribe((newPayload) => {
      setPayload(newPayload);
    });

    const unsubStatus = detectionManager.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubData();
      unsubStatus();
    };
  }, []);

  const selectInstance = useCallback((id: number | null) => {
    setSelectedInstanceId(id);
    detectionManager.setSelectedInstanceId(id);
  }, []);

  const hoverInstance = useCallback((id: number | null) => {
    setHoveredInstanceId(id);
  }, []);

  const toggleSimulation = useCallback(() => {
    const next = !isPlaying;
    setIsPlaying(next);
    detectionManager.togglePlay(next);
  }, [isPlaying]);

  const updatePosition = useCallback((instanceId: number, pos: Position3D) => {
    detectionManager.updatePosition(instanceId, pos);
  }, []);

  const toggleOcclusion = useCallback((instanceId: number) => {
    detectionManager.toggleOcclusion(instanceId);
  }, []);

  const resetSimulation = useCallback(() => {
    detectionManager.resetSimulation();
  }, []);

  const switchMode = useCallback((mode: 'simulation' | 'connected') => {
    detectionManager.setMode(mode);
  }, []);

  const selectedItem: DetectionItem | undefined = payload.detections.find(
    (d) => d.instance_id === selectedInstanceId
  );

  return {
    payload,
    status,
    selectedInstanceId,
    hoveredInstanceId,
    selectedItem,
    isPlaying,
    selectInstance,
    hoverInstance,
    toggleSimulation,
    updatePosition,
    toggleOcclusion,
    resetSimulation,
    switchMode
  };
}

