"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLayer,
  updateLayer,
  deleteLayer,
  bringLayerToFront,
} from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Square,
  Circle,
  Type,
  StickyNote,
  MousePointer,
  Eraser,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Undo,
  Redo,
  Download,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useCanvasCollaboration } from "../hooks/use-canvas-collaboration";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Tool =
  | "select"
  | "pen"
  | "rectangle"
  | "ellipse"
  | "text"
  | "note"
  | "eraser"
  | "pan";
type LayerType = "RECTANGLE" | "ELLIPSE" | "PATH" | "TEXT" | "NOTE";

interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  data: any;
}

interface WhiteboardCanvasProps {
  canvasId: string;
  layers: Layer[];
  workspaceId: string;
  userId?: string;
  userName?: string;
}

const tools = [
  { id: "select" as Tool, icon: MousePointer, label: "Select (V)" },
  { id: "pan" as Tool, icon: Move, label: "Pan (H)" },
  { id: "pen" as Tool, icon: Pencil, label: "Pen (P)" },
  { id: "rectangle" as Tool, icon: Square, label: "Rectangle (R)" },
  { id: "ellipse" as Tool, icon: Circle, label: "Circle (O)" },
  { id: "text" as Tool, icon: Type, label: "Text (T)" },
  { id: "note" as Tool, icon: StickyNote, label: "Sticky Note (N)" },
  { id: "eraser" as Tool, icon: Eraser, label: "Eraser (E)" },
];

const colorPalette = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#6366f1", "#14b8a6", "#ef4444", "#a855f7", "#06b6d4",
];

export function WhiteboardCanvas({
  canvasId,
  layers: initialLayers,
  workspaceId,
  userId,
  userName,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [history, setHistory] = useState<Layer[][]>([initialLayers]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const queryClient = useQueryClient();

  const { users, sendCursor, isConnected } = useCanvasCollaboration({
    canvasId,
    userId: userId || "anonymous",
    userName: userName || "Anonymous",
    onElementUpdate: (element) => {
      setLayers(prev => {
        const existingIndex = prev.findIndex(l => l.id === element.id);
        if (existingIndex >= 0) {
          const newLayers = [...prev];
          newLayers[existingIndex] = element;
          return newLayers;
        }
        return [...prev, element];
      });
    },
    onElementDelete: (elementId) => {
      setLayers(prev => prev.filter(l => l.id !== elementId));
    },
    onSync: (elements) => {
      setLayers(elements);
    },
  });

  const createLayerMutation = useMutation({
    mutationFn: createLayer,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        const newLayer = result.data as Layer;
        setLayers(prev => [...prev, newLayer]);
        addToHistory([...layers, newLayer]);
        queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
      }
    },
  });

  const updateLayerMutation = useMutation({
    mutationFn: updateLayer,
    onSuccess: (result) => {
      if (!result.error) {
        queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
      }
    },
  });

  const deleteLayerMutation = useMutation({
    mutationFn: deleteLayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
      setSelectedLayer(null);
    },
  });

  const addToHistory = (newLayers: Layer[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLayers);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        if (e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
      
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "v": setSelectedTool("select"); break;
          case "h": setSelectedTool("pan"); break;
          case "p": setSelectedTool("pen"); break;
          case "r": setSelectedTool("rectangle"); break;
          case "o": setSelectedTool("ellipse"); break;
          case "t": setSelectedTool("text"); break;
          case "n": setSelectedTool("note"); break;
          case "e": setSelectedTool("eraser"); break;
          case "delete":
          case "backspace":
            if (selectedLayer) {
              deleteLayerMutation.mutate({ id: selectedLayer });
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayer, historyIndex, history]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    layers.forEach((layer) => {
      ctx.save();

      switch (layer.type) {
        case "RECTANGLE":
          ctx.fillStyle = layer.data.color || selectedColor;
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          ctx.strokeStyle = layer.data.strokeColor || "#000";
          ctx.lineWidth = 2 / zoom;
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          
          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3 / zoom;
            ctx.setLineDash([5 / zoom, 5 / zoom]);
            ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
            ctx.setLineDash([]);
          }
          break;

        case "ELLIPSE":
          ctx.fillStyle = layer.data.color || selectedColor;
          ctx.beginPath();
          ctx.ellipse(
            layer.x + layer.width / 2,
            layer.y + layer.height / 2,
            Math.abs(layer.width / 2),
            Math.abs(layer.height / 2),
            0,
            0,
            2 * Math.PI,
          );
          ctx.fill();
          ctx.strokeStyle = layer.data.strokeColor || "#000";
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
          
          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3 / zoom;
            ctx.setLineDash([5 / zoom, 5 / zoom]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          break;

        case "PATH":
          if (layer.data.points && layer.data.points.length > 0) {
            ctx.strokeStyle = layer.data.color || "#000000";
            ctx.lineWidth = (layer.data.lineWidth || 2) / zoom;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(layer.data.points[0].x, layer.data.points[0].y);
            layer.data.points.forEach((point: { x: number; y: number }) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            
            if (selectedLayer === layer.id) {
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 1 / zoom;
              ctx.setLineDash([5 / zoom, 5 / zoom]);
              ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
              ctx.setLineDash([]);
            }
          }
          break;

        case "NOTE":
          const noteColor = layer.data.color || "#fef3c7";
          ctx.fillStyle = noteColor;
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.strokeStyle = "#ca8a04";
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          
          ctx.shadowColor = "transparent";

          if (layer.data.text) {
            ctx.fillStyle = "#000000";
            ctx.font = `${14 / zoom}px sans-serif`;
            const padding = 10 / zoom;
            wrapText(ctx, layer.data.text, layer.x + padding, layer.y + 25 / zoom, layer.width - 2 * padding, 18 / zoom);
          }

          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3 / zoom;
            ctx.setLineDash([5 / zoom, 5 / zoom]);
            ctx.strokeRect(layer.x - 5, layer.y - 5, layer.width + 10, layer.height + 10);
            ctx.setLineDash([]);
          }
          break;

        case "TEXT":
          if (layer.data.text) {
            ctx.fillStyle = layer.data.color || "#000000";
            ctx.font = `${(layer.data.fontSize || 16) / zoom}px sans-serif`;
            ctx.fillText(layer.data.text, layer.x, layer.y);
            
            if (selectedLayer === layer.id) {
              const metrics = ctx.measureText(layer.data.text);
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 2 / zoom;
              ctx.setLineDash([5 / zoom, 5 / zoom]);
              ctx.strokeRect(layer.x - 5, layer.y - 20 / zoom, metrics.width + 10, 25 / zoom);
              ctx.setLineDash([]);
            }
          }
          break;
      }

      ctx.restore();
    });

    users.forEach((user) => {
      if (user.cursorX && user.cursorY) {
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        
        ctx.fillStyle = user.color;
        ctx.beginPath();
        ctx.arc(user.cursorX, user.cursorY, 5 / zoom, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = "#000";
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.fillText(user.userName, user.cursorX + 10 / zoom, user.cursorY - 10 / zoom);
        
        ctx.restore();
      }
    });

    ctx.restore();
  }, [layers, selectedLayer, zoom, pan, users, selectedColor]);
  
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let yPos = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, yPos);
        line = words[n] + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, yPos);
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (selectedTool === "pan" || (e.button === 1) || (e.shiftKey && selectedTool === "select")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (selectedTool === "select") {
      const clicked = [...layers]
        .reverse()
        .find(
          (layer) =>
            pos.x >= layer.x &&
            pos.x <= layer.x + layer.width &&
            pos.y >= layer.y &&
            pos.y <= layer.y + layer.height,
        );
      
      if (clicked) {
        setSelectedLayer(clicked.id);
        setDraggedLayer(clicked.id);
        setDragOffset({
          x: pos.x - clicked.x,
          y: pos.y - clicked.y,
        });
      } else {
        setSelectedLayer(null);
      }
    } else if (selectedTool === "pen") {
      setIsDrawing(true);
      setCurrentPath([pos]);
    } else if (selectedTool === "eraser") {
      const clicked = [...layers]
        .reverse()
        .find(
          (layer) =>
            pos.x >= layer.x &&
            pos.x <= layer.x + layer.width &&
            pos.y >= layer.y &&
            pos.y <= layer.y + layer.height,
        );
      if (clicked) {
        setLayers(prev => prev.filter(l => l.id !== clicked.id));
        deleteLayerMutation.mutate({ id: clicked.id });
      }
    } else {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (isConnected) {
      sendCursor(pos.x, pos.y, selectedLayer || undefined);
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedLayer && selectedTool === "select") {
      const layer = layers.find(l => l.id === draggedLayer);
      if (layer) {
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;
        
        setLayers(prev => prev.map(l => 
          l.id === draggedLayer 
            ? { ...l, x: newX, y: newY }
            : l
        ));
      }
      return;
    }

    if (!isDrawing) return;

    if (selectedTool === "pen") {
      setCurrentPath((prev) => [...prev, pos]);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && currentPath.length > 0) {
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 3 / zoom;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(
          currentPath[currentPath.length - 1].x,
          currentPath[currentPath.length - 1].y,
        );
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedLayer) {
      const layer = layers.find(l => l.id === draggedLayer);
      if (layer) {
        updateLayerMutation.mutate({
          id: layer.id,
          x: layer.x,
          y: layer.y,
        });
        addToHistory(layers);
      }
      setDraggedLayer(null);
      return;
    }

    if (!isDrawing) return;

    const endPos = getMousePos(e);
    const startPos = currentPath[0];

    if (selectedTool === "rectangle") {
      createLayerMutation.mutate({
        canvasId,
        type: "RECTANGLE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        data: { color: selectedColor, strokeColor: "#000" },
      });
    } else if (selectedTool === "ellipse") {
      createLayerMutation.mutate({
        canvasId,
        type: "ELLIPSE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        data: { color: selectedColor, strokeColor: "#000" },
      });
    } else if (selectedTool === "pen" && currentPath.length > 1) {
      const minX = Math.min(...currentPath.map((p) => p.x));
      const maxX = Math.max(...currentPath.map((p) => p.x));
      const minY = Math.min(...currentPath.map((p) => p.y));
      const maxY = Math.max(...currentPath.map((p) => p.y));

      createLayerMutation.mutate({
        canvasId,
        type: "PATH",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        data: { points: currentPath, color: selectedColor, lineWidth: 3 },
      });
    } else if (selectedTool === "note") {
      const width = Math.max(Math.abs(endPos.x - startPos.x), 200);
      const height = Math.max(Math.abs(endPos.y - startPos.y), 150);
      
      createLayerMutation.mutate({
        canvasId,
        type: "NOTE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width,
        height,
        data: { color: "#fef3c7", text: "Double-click to edit..." },
      });
    } else if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        createLayerMutation.mutate({
          canvasId,
          type: "TEXT",
          x: startPos.x,
          y: startPos.y,
          width: 100,
          height: 20,
          data: { text, color: selectedColor, fontSize: 16 },
        });
      }
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const clicked = [...layers]
      .reverse()
      .find(
        (layer) =>
          pos.x >= layer.x &&
          pos.x <= layer.x + layer.width &&
          pos.y >= layer.y &&
          pos.y <= layer.y + layer.height,
      );

    if (clicked && (clicked.type === "NOTE" || clicked.type === "TEXT")) {
      const newText = prompt("Edit text:", clicked.data.text || "");
      if (newText !== null) {
        updateLayerMutation.mutate({
          id: clicked.id,
          data: { ...clicked.data, text: newText },
        });
        setLayers(prev => prev.map(l =>
          l.id === clicked.id ? { ...l, data: { ...l.data, text: newText } } : l
        ));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 5));
    }
  };

  const exportAsImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `whiteboard-${canvasId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-muted/10">
      <div className="border-b bg-background/95 backdrop-blur p-2 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 border-r pr-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
              className="shrink-0"
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1 items-center">
          <span className="text-xs text-muted-foreground mr-1">Color:</span>
          {colorPalette.map((color) => (
            <button
              key={color}
              className={cn(
                "w-6 h-6 rounded border-2 transition-all",
                selectedColor === color ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.1, 5))}
            title="Zoom In (Ctrl +)"
            disabled={zoom >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
          >
            <span className="text-xs font-medium min-w-[40px]">
              {Math.round(zoom * 100)}%
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))}
            title="Zoom Out (Ctrl -)"
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {selectedLayer && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLayers(prev => prev.filter(l => l.id !== selectedLayer));
                deleteLayerMutation.mutate({ id: selectedLayer });
              }}
              title="Delete Selected (Del)"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}

        <Separator orientation="vertical" className="h-8" />

        <Button
          variant="ghost"
          size="sm"
          onClick={exportAsImage}
          title="Export as Image"
        >
          <Download className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {users.slice(0, 5).map((user) => (
                <Avatar
                  key={user.userId}
                  className="h-7 w-7 border-2 border-background"
                  style={{ borderColor: user.color }}
                >
                  <AvatarFallback
                    style={{ backgroundColor: user.color + "40" }}
                    className="text-xs"
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {users.length > 5 && (
                <Avatar className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    +{users.length - 5}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs">
            {layers.length} objects
          </Badge>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <canvas
          ref={canvasRef}
          width={3000}
          height={2000}
          className={cn(
            "absolute inset-0",
            selectedTool === "pen" && "cursor-crosshair",
            selectedTool === "eraser" && "cursor-not-allowed",
            selectedTool === "select" && "cursor-default",
            selectedTool === "pan" && "cursor-grab",
            isPanning && "cursor-grabbing",
            (selectedTool === "rectangle" || selectedTool === "ellipse" || selectedTool === "note" || selectedTool === "text") && "cursor-crosshair",
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setIsPanning(false);
            setDraggedLayer(null);
            setCurrentPath([]);
          }}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
        />
      </div>
    </div>
  );
}
