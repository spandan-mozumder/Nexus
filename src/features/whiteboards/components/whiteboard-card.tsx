"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Layers, MoreHorizontal, Palette, Trash2 } from "lucide-react";
import { deleteCanvas } from "@/features/whiteboards/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhiteboardCardProps {
  canvas: {
    id: string;
    title: string;
    workspaceId: string;
    createdAt: Date;
    _count: {
      layers: number;
    };
  };
  onOpen: (canvas: WhiteboardCardProps["canvas"]) => void;
}

export function WhiteboardCard({
  canvas,
  onOpen,
}: WhiteboardCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this whiteboard? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCanvas({ id: canvas.id });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Whiteboard deleted");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting whiteboard:", error);
      toast.error("Failed to delete whiteboard");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpen = useCallback(() => {
    onOpen(canvas);
  }, [canvas, onOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:border-primary cursor-pointer",
      )}
    >
      <CardHeader className="pb-3">
        <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 text-white">
          <Palette className="h-12 w-12" />
        </div>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex-1 text-base line-clamp-2">
            {canvas.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>{canvas._count.layers} layers</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(canvas.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
