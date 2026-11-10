import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Check,
  MousePointer,
  Square,
  AlertCircle,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { BoundingBox, ImageAnnotation, QualityAnomaly } from '../../types/annotation';

interface AnnotationCanvasProps {
  annotation: ImageAnnotation | null;
  onUpdateBoxes: (boxes: BoundingBox[], markReviewed: boolean) => void;
  availableClasses: string[];
}

type CanvasTool = 'select' | 'draw';

const DEFAULT_SURGICAL_CLASSES = [
  'bistouri_scalpel',
  'pince_bipolar',
  'ciseaux_metzenbaum',
  'porte_aiguille',
  'pince_dissection',
  'ecarteur_farabeuf',
  'pince_kocher',
  'canule_aspiration'
];

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  annotation,
  onUpdateBoxes,
  availableClasses = DEFAULT_SURGICAL_CLASSES
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>(
    availableClasses[0] || 'bistouri_scalpel'
  );

  // Dragging / Resizing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [activeHandle, setActiveHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const boxes = annotation?.boxes || [];
  const selectedBox = boxes.find((b) => b.id === selectedBoxId) || null;

  // Convert mouse event client coordinates to normalized coordinates (0.0 - 1.0)
  const getNormalizedCoords = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  }, []);

  // Handle Box Selection
  const handleSelectBox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBoxId(id);
  };

  // Delete selected box
  const handleDeleteSelected = () => {
    if (!selectedBoxId) return;
    const newBoxes = boxes.filter((b) => b.id !== selectedBoxId);
    onUpdateBoxes(newBoxes, true);
    setSelectedBoxId(null);
  };

  // Keyboard shortcuts (Escape, Delete, V, R)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedBoxId(null);
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveTool('draw');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedBoxId, boxes]);

  // Update class of selected box
  const handleChangeBoxLabel = (newLabel: string) => {
    if (!selectedBoxId) return;
    const newBoxes = boxes.map((b) =>
      b.id === selectedBoxId ? { ...b, label: newLabel, verified: true } : b
    );
    onUpdateBoxes(newBoxes, true);
  };

  // Start Drawing or Moving
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!annotation) return;
    const { x, y } = getNormalizedCoords(e);

    if (activeTool === 'draw') {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setCurrentDraw({ x, y, w: 0, h: 0 });
    } else if (selectedBox && !activeHandle) {
      // Check if clicking inside selected box to move
      if (
        x >= selectedBox.x &&
        x <= selectedBox.x + selectedBox.width &&
        y >= selectedBox.y &&
        y <= selectedBox.y + selectedBox.height
      ) {
        setIsDraggingBox(true);
        setDragOffset({ x: x - selectedBox.x, y: y - selectedBox.y });
      } else {
        setSelectedBoxId(null);
      }
    } else {
      setSelectedBoxId(null);
    }
  };

  // Mouse Move: Draw, Drag, or Resize
  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getNormalizedCoords(e);

    // Drawing new box
    if (isDrawing && drawStart) {
      const minX = Math.min(drawStart.x, x);
      const minY = Math.min(drawStart.y, y);
      const w = Math.abs(x - drawStart.x);
      const h = Math.abs(y - drawStart.y);
      setCurrentDraw({ x: minX, y: minY, w, h });
      return;
    }

    // Dragging whole box
    if (isDraggingBox && selectedBox) {
      const newX = Math.max(0, Math.min(1 - selectedBox.width, x - dragOffset.x));
      const newY = Math.max(0, Math.min(1 - selectedBox.height, y - dragOffset.y));
      const newBoxes = boxes.map((b) =>
        b.id === selectedBox.id ? { ...b, x: newX, y: newY, verified: true } : b
      );
      onUpdateBoxes(newBoxes, false);
      return;
    }

    // Resizing with handle
    if (activeHandle && selectedBox) {
      let { x: bx, y: by, width: bw, height: bh } = selectedBox;
      if (activeHandle === 'nw') {
        bw += bx - x;
        bh += by - y;
        bx = x;
        by = y;
      } else if (activeHandle === 'ne') {
        bw = x - bx;
        bh += by - y;
        by = y;
      } else if (activeHandle === 'se') {
        bw = x - bx;
        bh = y - by;
      } else if (activeHandle === 'sw') {
        bw += bx - x;
        bh = y - by;
        bx = x;
      }

      if (bw > 0.01 && bh > 0.01) {
        const newBoxes = boxes.map((b) =>
          b.id === selectedBox.id
            ? { ...b, x: Math.max(0, bx), y: Math.max(0, by), width: Math.min(1 - bx, bw), height: Math.min(1 - by, bh), verified: true }
            : b
        );
        onUpdateBoxes(newBoxes, false);
      }
    }
  };

  // Mouse Up: commit changes
  const handleMouseUp = () => {
    if (isDrawing && currentDraw && currentDraw.w > 0.01 && currentDraw.h > 0.01) {
      const newBox: BoundingBox = {
        id: Math.random().toString(36).substring(2, 9),
        label: selectedClass,
        confidence: 1.0,
        x: Math.round(currentDraw.x * 1000) / 1000,
        y: Math.round(currentDraw.y * 1000) / 1000,
        width: Math.round(currentDraw.w * 1000) / 1000,
        height: Math.round(currentDraw.h * 1000) / 1000,
        verified: true,
        source: 'manual'
      };
      onUpdateBoxes([...boxes, newBox], true);
      setSelectedBoxId(newBox.id);
      setActiveTool('select');
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
    setIsDraggingBox(false);
    setActiveHandle(null);
  };

  if (!annotation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#070b14] text-slate-500 text-sm">
        Sélectionnez une image dans le volet pour l'annoter.
      </div>
    );
  }

  // Color logic according to Confidence
  const getBoxColor = (box: BoundingBox, isSelected: boolean) => {
    if (isSelected) return '#38bdf8'; // Sky blue
    if (box.confidence >= 0.80) return '#10b981'; // Green
    if (box.confidence >= 0.50) return '#f59e0b'; // Amber
    return '#f43f5e'; // Red
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] overflow-hidden select-none">
      {/* Top CVAT Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
        {/* Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('select')}
            title="Sélectionner / Déplacer (V)"
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition ${
              activeTool === 'select'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">Sélectionner (V)</span>
          </button>

          <button
            onClick={() => setActiveTool('draw')}
            title="Créer Boîte (R)"
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition ${
              activeTool === 'draw'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Créer Boîte (R)</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-2" />

          {/* Class selector */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBox ? selectedBox.label : selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                if (selectedBox) handleChangeBoxLabel(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {selectedBox && (
            <button
              onClick={handleDeleteSelected}
              title="Supprimer la boîte sélectionnée (Suppr)"
              className="p-1.5 ml-2 rounded-lg text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          )}
        </div>

        {/* Zoom & Validation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/60 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom Arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom Avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-400 hover:text-white border-l border-slate-700"
              title="Ajuster l'écran"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onUpdateBoxes(boxes, true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Valider Image
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-6 relative cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative inline-block transition-transform duration-100 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-800"
        >
          {/* Base Image */}
          <img
            ref={imageRef}
            src={annotation.image_url}
            alt={annotation.filename}
            className="max-h-[75vh] w-auto object-contain block pointer-events-none select-none"
            draggable={false}
          />

          {/* SVG Overlay for Bounding Boxes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto">
            {/* Existing boxes */}
            {boxes.map((box) => {
              const isSelected = box.id === selectedBoxId;
              const color = getBoxColor(box, isSelected);

              return (
                <g key={box.id} onClick={(e) => handleSelectBox(box.id, e)}>
                  {/* Bounding Box Rectangle */}
                  <rect
                    x={`${box.x * 100}%`}
                    y={`${box.y * 100}%`}
                    width={`${box.width * 100}%`}
                    height={`${box.height * 100}%`}
                    fill={isSelected ? `${color}25` : `${color}10`}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="cursor-move hover:stroke-cyan-300 transition-colors"
                  />

                  {/* Label & Confidence Badge */}
                  <foreignObject
                    x={`${box.x * 100}%`}
                    y={`${Math.max(0, box.y * 100 - 4)}%`}
                    width="200"
                    height="30"
                    className="overflow-visible pointer-events-none"
                  >
                    <div
                      style={{ backgroundColor: color }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-950 shadow-md transform -translate-y-full"
                    >
                      <span>{box.label}</span>
                      <span className="opacity-80 font-mono">
                        {Math.round(box.confidence * 100)}%
                      </span>
                    </div>
                  </foreignObject>

                  {/* Corner Resize Handles for selected box */}
                  {isSelected && (
                    <>
                      {/* NW */}
                      <circle
                        cx={`${box.x * 100}%`}
                        cy={`${box.y * 100}%`}
                        r={5}
                        fill="#38bdf8"
                        stroke="#0a0f1d"
                        strokeWidth={2}
                        className="cursor-nwse-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveHandle('nw');
                        }}
                      />
                      {/* NE */}
                      <circle
                        cx={`${(box.x + box.width) * 100}%`}
                        cy={`${box.y * 100}%`}
                        r={5}
                        fill="#38bdf8"
                        stroke="#0a0f1d"
                        strokeWidth={2}
                        className="cursor-nesw-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveHandle('ne');
                        }}
                      />
                      {/* SE */}
                      <circle
                        cx={`${(box.x + box.width) * 100}%`}
                        cy={`${(box.y + box.height) * 100}%`}
                        r={5}
                        fill="#38bdf8"
                        stroke="#0a0f1d"
                        strokeWidth={2}
                        className="cursor-nwse-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveHandle('se');
                        }}
                      />
                      {/* SW */}
                      <circle
                        cx={`${box.x * 100}%`}
                        cy={`${(box.y + box.height) * 100}%`}
                        r={5}
                        fill="#38bdf8"
                        stroke="#0a0f1d"
                        strokeWidth={2}
                        className="cursor-nesw-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveHandle('sw');
                        }}
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Currently Drawing Box Preview */}
            {isDrawing && currentDraw && (
              <rect
                x={`${currentDraw.x * 100}%`}
                y={`${currentDraw.y * 100}%`}
                width={`${currentDraw.w * 100}%`}
                height={`${currentDraw.h * 100}%`}
                fill="rgba(56, 189, 248, 0.2)"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Quality Anomaly Bottom Alert Bar */}
      {annotation.anomalies && annotation.anomalies.length > 0 && (
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold">Anomalies détectées ({annotation.anomalies.length}) :</span>
            <span className="text-slate-300">
              {annotation.anomalies.map((a) => a.message).join(' • ')}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Score de qualité : <strong className="text-cyan-400">{annotation.quality_score}/100</strong>
          </span>
        </div>
      )}
    </div>
  );
};
