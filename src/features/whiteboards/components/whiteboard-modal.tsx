"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Circle,
  Edit3,
  Eye,
  Minus,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  Square,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

type Tool = "pen" | "rectangle" | "ellipse" | "line";

type DrawingElement =
  | {
      kind: "path";
      color: string;
      size: number;
      points: Point[];
    }
  | {
      kind: "rectangle" | "ellipse" | "line";
      color: string;
      size: number;
      start: Point;
      end: Point;
    };

interface WhiteboardModalProps {
  open: boolean;
  canvas: {
    id: string;
    title: string;
  } | null;
  onClose: () => void;
}

const clampZoom = (value: number) => Math.min(Math.max(value, 0.25), 3);
const AUTOSAVE_DELAY = 1500;

const cloneElements = (elements: DrawingElement[]): DrawingElement[] =>
  elements.map((element) =>
    element.kind === "path"
      ? {
          kind: "path" as const,
          color: element.color,
          size: element.size,
          points: element.points.map((point) => ({ ...point })),
        }
      : {
          kind: element.kind,
          color: element.color,
          size: element.size,
          start: { ...element.start },
          end: { ...element.end },
        },
  );

export function WhiteboardModal({ open, canvas, onClose }: WhiteboardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<DrawingElement[]>([]);
  const activeElementRef = useRef<DrawingElement | null>(null);
  const isDrawingRef = useRef(false);
  const savedSnapshotRef = useRef<DrawingElement[]>([]);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const historyRef = useRef<DrawingElement[][]>([[]]);
  const [historyCursor, setHistoryCursor] = useState(0);

  const [isEditing, setIsEditing] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [strokeSize, setStrokeSize] = useState(4);
  const [tool, setTool] = useState<Tool>("pen");
  const [zoom, setZoom] = useState(1);
  const [isDirty, setIsDirty] = useState(false);
  const sessionZoomRef = useRef<Record<string, number>>({});

  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: DrawingElement, currentZoom: number) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.size / currentZoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (element.kind) {
        case "path": {
          if (element.points.length === 0) return;
          ctx.beginPath();
          const [first, ...rest] = element.points;
          ctx.moveTo(first.x, first.y);
          if (rest.length === 0) {
            ctx.lineTo(first.x + 0.1, first.y + 0.1);
          } else {
            rest.forEach((point) => ctx.lineTo(point.x, point.y));
          }
          ctx.stroke();
          break;
        }
        case "rectangle": {
          const width = element.end.x - element.start.x;
          const height = element.end.y - element.start.y;
          ctx.strokeRect(element.start.x, element.start.y, width, height);
          break;
        }
        case "ellipse": {
          const radiusX = Math.abs(element.end.x - element.start.x) / 2;
          const radiusY = Math.abs(element.end.y - element.start.y) / 2;
          const centerX = Math.min(element.start.x, element.end.x) + radiusX;
          const centerY = Math.min(element.start.y, element.end.y) + radiusY;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case "line": {
          ctx.beginPath();
          ctx.moveTo(element.start.x, element.start.y);
          ctx.lineTo(element.end.x, element.end.y);
          ctx.stroke();
          break;
        }
      }
    },
    [],
  );

  const drawAll = useCallback(
    (preview?: DrawingElement | null) => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) return;

      const ctx = canvasElement.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      const centerX = canvasElement.width / 2;
      const centerY = canvasElement.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -centerY);

      const elements = preview
        ? [...elementsRef.current, preview]
        : elementsRef.current;

      elements.forEach((element) => drawElement(ctx, element, zoom));
      ctx.restore();
    },
    [drawElement, zoom],
  );

  const handleAutosave = useCallback(() => {
    if (!canvas) return;

    try {
      window.localStorage.setItem(`whiteboard:${canvas.id}`, JSON.stringify(elementsRef.current));
      savedSnapshotRef.current = cloneElements(elementsRef.current);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save whiteboard", error);
      toast.error("Failed to save whiteboard");
    } finally {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    }
  }, [canvas]);

  const scheduleAutosave = useCallback(() => {
    if (!canvas) return;

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = window.setTimeout(() => {
      handleAutosave();
    }, AUTOSAVE_DELAY);
  }, [canvas, handleAutosave]);

  const pushHistory = useCallback((elements: DrawingElement[]) => {
    const snapshot = cloneElements(elements);

    setHistoryCursor((prevCursor) => {
      const truncated = historyRef.current.slice(0, prevCursor + 1);
      truncated.push(snapshot);
      historyRef.current = truncated;
      return truncated.length - 1;
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvasElement = canvasRef.current;
    const wrapperElement = wrapperRef.current;
    if (!canvasElement || !wrapperElement) return;

    const rect = wrapperElement.getBoundingClientRect();
    canvasElement.width = rect.width;
    canvasElement.height = rect.height;
    canvasElement.style.width = `${rect.width}px`;
    canvasElement.style.height = `${rect.height}px`;

    drawAll(isDrawingRef.current ? activeElementRef.current ?? undefined : undefined);
  }, [drawAll]);

  const getPointFromEvent = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
      const canvasElement = canvasRef.current;
      if (!canvasElement) return null;

      const rect = canvasElement.getBoundingClientRect();
      const centerX = canvasElement.width / 2;
      const centerY = canvasElement.height / 2;
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      return {
        x: ((screenX - centerX) / zoom) + centerX,
        y: ((screenY - centerY) / zoom) + centerY,
      };
    },
    [zoom],
  );

  const loadCanvas = useCallback(
    (canvasId: string) => {
      const saved = window.localStorage.getItem(`whiteboard:${canvasId}`);

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown;

          if (Array.isArray(parsed)) {
            const sanitised: DrawingElement[] = parsed
              .map((item) => {
                if (item && typeof item === "object") {
                  const candidate = item as Partial<DrawingElement> & { kind?: string };

                  if (candidate.kind === "path" && Array.isArray(candidate.points)) {
                    return {
                      kind: "path" as const,
                      color: candidate.color ?? "#111827",
                      size: typeof candidate.size === "number" ? candidate.size : 4,
                      points: candidate.points as Point[],
                    } satisfies DrawingElement;
                  }

                  if (
                    (candidate.kind === "rectangle" || candidate.kind === "ellipse" || candidate.kind === "line") &&
                    candidate.start &&
                    candidate.end
                  ) {
                    return {
                      kind: candidate.kind,
                      color: candidate.color ?? "#111827",
                      size: typeof candidate.size === "number" ? candidate.size : 4,
                      start: candidate.start as Point,
                      end: candidate.end as Point,
                    } satisfies DrawingElement;
                  }

                  if (Array.isArray((candidate as any).points)) {
                    return {
                      kind: "path" as const,
                      color: candidate.color ?? "#111827",
                      size: typeof candidate.size === "number" ? candidate.size : 4,
                      points: (candidate as any).points as Point[],
                    } satisfies DrawingElement;
                  }
                }

                return null;
              })
              .filter(Boolean) as DrawingElement[];

            elementsRef.current = sanitised;
            savedSnapshotRef.current = cloneElements(sanitised);
            historyRef.current = [cloneElements(sanitised)];
            setHistoryCursor(historyRef.current.length - 1);
            setIsDirty(false);
            drawAll();
            return;
          }
        } catch (error) {
          console.error("Failed to parse saved whiteboard", error);
        }
      }

      elementsRef.current = [];
      savedSnapshotRef.current = [];
      historyRef.current = [[]];
      setHistoryCursor(0);
      setIsDirty(false);
      drawAll();
    },
    [drawAll],
  );

  useEffect(() => {
    if (!open) return;
    if (!canvas) return;

    // Restore zoom level for this canvas
    const savedZoom = sessionZoomRef.current[canvas.id];
    if (typeof savedZoom === "number") {
      sessionZoomRef.current[canvas.id] = savedZoom;
      setZoom(savedZoom);
    } else {
      sessionZoomRef.current[canvas.id] = 1;
      setZoom(1);
    }

    resizeCanvas();
    loadCanvas(canvas.id);
  }, [open, canvas, loadCanvas, resizeCanvas]);

  useEffect(() => {
    if (!open) return;

    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) return;

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(wrapperElement);

    return () => observer.disconnect();
  }, [open, resizeCanvas]);

  useEffect(() => {
    if (!open && autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [open]);

  const handleRequestClose = useCallback(() => {
    if (isDirty && canvas) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Would you like to save before closing?\n\nClick OK to save and close, or Cancel to close without saving."
      );
      if (!confirmClose) {
        return;
      }
      handleAutosave();
    }
    onClose();
  }, [isDirty, onClose, canvas, handleAutosave]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleRequestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleRequestClose]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setIsEditing(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const preview =
      isDrawingRef.current &&
      activeElementRef.current &&
      activeElementRef.current.kind !== "path"
        ? activeElementRef.current
        : null;
    drawAll(preview ?? undefined);
  }, [zoom, drawAll, open]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    scheduleAutosave();
  }, [scheduleAutosave]);

  const syncDirtyState = useCallback(
    (elements: DrawingElement[]) => {
      const saved = savedSnapshotRef.current;
      let dirty = true;

      if (saved.length === elements.length) {
        try {
          dirty = JSON.stringify(elements) !== JSON.stringify(saved);
        } catch {
          dirty = true;
        }
      }

      setIsDirty(dirty);

      if (dirty) {
        scheduleAutosave();
      } else if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    },
    [scheduleAutosave],
  );

  const updateZoom = useCallback(
    (updater: (prev: number) => number) => {
      setZoom((prev) => {
        const next = clampZoom(updater(prev));
        if (canvas) {
          sessionZoomRef.current[canvas.id] = next;
        }
        return next;
      });
    },
    [canvas],
  );

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!open) return;
    event.preventDefault();

    const zoomStep = event.ctrlKey || event.metaKey ? 0.05 : 0.1;
    if (event.deltaY < 0) {
      updateZoom((prev) => prev + zoomStep);
    } else if (event.deltaY > 0) {
      updateZoom((prev) => prev - zoomStep);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    const point = getPointFromEvent(event);
    if (!point) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    markDirty();

    switch (tool) {
      case "pen": {
        const element: DrawingElement = {
          kind: "path",
          color: strokeColor,
          size: strokeSize,
          points: [point],
        };
        elementsRef.current.push(element);
        activeElementRef.current = element;
        break;
      }
      case "rectangle":
      case "ellipse":
      case "line": {
        activeElementRef.current = {
          kind: tool,
          color: strokeColor,
          size: strokeSize,
          start: point,
          end: point,
        };
        break;
      }
    }

    isDrawingRef.current = true;
    drawAll(activeElementRef.current && activeElementRef.current.kind !== "path" ? activeElementRef.current : undefined);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEditing || !isDrawingRef.current) return;
    const point = getPointFromEvent(event);
    if (!point) return;

    const activeElement = activeElementRef.current;
    if (!activeElement) return;

    if (activeElement.kind === "path") {
      activeElement.points.push(point);
      drawAll();
    } else {
      activeElement.end = point;
      drawAll(activeElement);
    }
  };

  const stopDrawing = (event?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    if (event) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore release failures */
      }
    }

    const activeElement = activeElementRef.current;

    if (activeElement && activeElement.kind !== "path") {
      const deltaX = activeElement.end.x - activeElement.start.x;
      const deltaY = activeElement.end.y - activeElement.start.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > 2) {
        elementsRef.current.push({
          ...activeElement,
          start: { ...activeElement.start },
          end: { ...activeElement.end },
        });
      }
    }

    activeElementRef.current = null;
    isDrawingRef.current = false;
    drawAll();

    pushHistory(elementsRef.current);
    scheduleAutosave();
  };

  const handleSave = () => {
    if (!canvas) return;
    try {
      window.localStorage.setItem(`whiteboard:${canvas.id}`, JSON.stringify(elementsRef.current));
      savedSnapshotRef.current = cloneElements(elementsRef.current);
      setIsDirty(false);
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
      toast.success("Whiteboard saved");
    } catch (error) {
      console.error("Failed to save whiteboard", error);
      toast.error("Failed to save whiteboard");
    }
  };

  const handleClear = () => {
    elementsRef.current = [];
    activeElementRef.current = null;
    isDrawingRef.current = false;
    drawAll();
    if (canvas) {
      window.localStorage.removeItem(`whiteboard:${canvas.id}`);
    }
    markDirty();
    pushHistory(elementsRef.current);
  };

  const handleUndo = useCallback(() => {
    if (!isEditing) return;
    if (historyCursor <= 0) return;

    const nextCursor = historyCursor - 1;
    const snapshot = historyRef.current[nextCursor];
    const clone = cloneElements(snapshot);

    elementsRef.current = clone;
    activeElementRef.current = null;
    isDrawingRef.current = false;
    setHistoryCursor(nextCursor);
    drawAll();
    syncDirtyState(clone);
  }, [historyCursor, drawAll, syncDirtyState, isEditing]);

  const handleRedo = useCallback(() => {
    if (!isEditing) return;
    if (historyCursor >= historyRef.current.length - 1) return;

    const nextCursor = historyCursor + 1;
    const snapshot = historyRef.current[nextCursor];
    const clone = cloneElements(snapshot);

    elementsRef.current = clone;
    activeElementRef.current = null;
    isDrawingRef.current = false;
    setHistoryCursor(nextCursor);
    drawAll();
    syncDirtyState(clone);
  }, [historyCursor, drawAll, syncDirtyState, isEditing]);

  const handleRevert = useCallback(() => {
    if (!isEditing) return;
    if (savedSnapshotRef.current.length === 0) return;

    const snapshot = cloneElements(savedSnapshotRef.current);
    elementsRef.current = snapshot;
    activeElementRef.current = null;
    isDrawingRef.current = false;
    drawAll();

    setHistoryCursor((prevCursor) => {
      const truncated = historyRef.current.slice(0, prevCursor + 1);
      truncated.push(cloneElements(snapshot));
      historyRef.current = truncated;
      return truncated.length - 1;
    });

    setIsDirty(false);
    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
  }, [drawAll, isEditing]);

  if (!open || !canvas) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{canvas.title}</h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Editing" : "Viewing"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
            <Button
              variant={tool === "pen" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("pen")}
              disabled={!isEditing}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "line" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("line")}
              disabled={!isEditing}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "rectangle" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("rectangle")}
              disabled={!isEditing}
              className="h-8 w-8 p-0"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "ellipse" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTool("ellipse")}
              disabled={!isEditing}
              className="h-8 w-8 p-0"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Color
            </label>
            <input
              type="color"
              value={strokeColor}
              onChange={(event) => setStrokeColor(event.target.value)}
              disabled={!isEditing}
              className="h-8 w-8 cursor-pointer rounded border border-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Size
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={strokeSize}
              onChange={(event) => setStrokeSize(Number(event.target.value))}
              disabled={!isEditing}
              className="h-1 w-24"
            />
          </div>

          <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="h-8 w-8 p-0"
              disabled={!isEditing || historyCursor <= 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              className="h-8 w-8 p-0"
              disabled={!isEditing || historyCursor >= historyRef.current.length - 1}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevert}
              className="h-8 w-8 p-0"
              disabled={!isEditing || !isDirty || savedSnapshotRef.current.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1 text-xs font-medium">
            <span>{Math.round(zoom * 100)}%</span>
            <span className="text-muted-foreground">Scroll to zoom</span>
          </div>

          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? (
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="destructive" size="sm" onClick={handleRequestClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </div>
      <div ref={wrapperRef} className="flex-1 bg-muted">
        <canvas
          ref={canvasRef}
          className={cn(
            "h-full w-full touch-none",
            isEditing ? "cursor-crosshair" : "cursor-default",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          onWheel={handleWheel}
        />
      </div>
    </div>
  );
}
