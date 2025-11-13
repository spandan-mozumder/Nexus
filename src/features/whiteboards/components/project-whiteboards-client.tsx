"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Palette } from "lucide-react";
import { CreateCanvasModal } from "./create-canvas-modal";
import { WhiteboardCard } from "./whiteboard-card";
import { WhiteboardModal } from "./whiteboard-modal";

interface Canvas {
  id: string;
  title: string;
  workspaceId: string;
  createdAt: Date;
  _count: {
    layers: number;
  };
}

interface Project {
  id: string;
  name: string;
  workspaceId: string;
}

interface ProjectWhiteboardsClientProps {
  project: Project;
  canvases: Canvas[];
  workspaceSlug: string;
  projectId: string;
}

export function ProjectWhiteboardsClient({
  project,
  canvases,
  workspaceSlug,
  projectId,
}: ProjectWhiteboardsClientProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);

  const handleOpenCanvas = (canvas: Canvas) => {
    setActiveCanvas(canvas);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {project.name} - Whiteboards
          </h2>
          <p className="text-muted-foreground">
            Manage your project whiteboards and diagrams
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Whiteboard
        </Button>
      </div>

      {canvases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No whiteboards yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first whiteboard to start collaborating visually
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {canvases.map((canvas) => (
            <WhiteboardCard
              key={canvas.id}
              canvas={canvas}
              onOpen={handleOpenCanvas}
            />
          ))}
        </div>
      )}

      <CreateCanvasModal
        workspaceId={project.workspaceId}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <WhiteboardModal
        open={Boolean(activeCanvas)}
        canvas={activeCanvas}
        onClose={() => setActiveCanvas(null)}
      />
    </div>
  );
}
