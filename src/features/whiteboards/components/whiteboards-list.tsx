"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Palette, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistance } from "date-fns";
import { CreateCanvasModal } from "./create-canvas-modal";

interface Canvas {
  id: string;
  title: string;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  _count?: {
    layers: number;
  };
}

interface WhiteboardsListProps {
  canvases: Canvas[];
  workspaceId: string;
  workspaceSlug: string;
}

export function WhiteboardsList({
  canvases,
  workspaceId,
  workspaceSlug,
}: WhiteboardsListProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (canvases.length === 0) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Whiteboards
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Visual collaboration spaces for your team
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Whiteboard
          </Button>
        </div>

        <Card className="p-12 border-2 bg-gradient-to-br from-background to-muted/20">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
              <Palette className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold">Welcome to Whiteboards</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                Create infinite canvases for visual collaboration,
                brainstorming, and creative work with your team.
              </p>
            </div>
            <div className="grid gap-6 text-left max-w-md w-full mt-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Visual Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Draw, sketch, and brainstorm together in real-time
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Infinite Canvas</p>
                  <p className="text-sm text-muted-foreground">
                    Never run out of space for your ideas
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 h-fit">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Real-time Sync</p>
                  <p className="text-sm text-muted-foreground">
                    See changes from your team instantly
                  </p>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setCreateModalOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Whiteboard
            </Button>
          </div>
        </Card>

        <CreateCanvasModal
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-background to-muted/20 p-8 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Whiteboards
            </h1>
            <Badge variant="secondary" className="text-sm">
              {canvases.length}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">
            Visual collaboration spaces for your team
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Whiteboard
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {canvases.map((canvas) => (
          <Link
            key={canvas.id}
            href={`/workspace/${workspaceSlug}/whiteboards/${canvas.id}`}
          >
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-2 hover:border-primary group">
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 flex items-center justify-center border-b-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <Palette className="h-16 w-16 text-primary/40 relative z-10" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-lg font-bold line-clamp-1">
                      {canvas.title}
                    </CardTitle>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium truncate max-w-[120px]">
                        {canvas.createdBy.name || canvas.createdBy.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canvas._count && (
                      <Badge variant="secondary" className="text-xs">
                        {canvas._count.layers} objects
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Updated{" "}
                      {formatDistance(new Date(canvas.updatedAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Card
          className="h-full min-h-[280px] cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-dashed border-2 hover:border-primary group bg-gradient-to-br from-background to-muted/20"
          onClick={() => setCreateModalOpen(true)}
        >
          <CardContent className="p-6 h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 w-fit mx-auto mb-4">
                <Plus className="h-12 w-12" />
              </div>
              <p className="font-semibold text-lg">Create New Whiteboard</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a new visual collaboration
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateCanvasModal
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
