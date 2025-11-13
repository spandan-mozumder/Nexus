"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  FileText,
  Palette,
  ChevronRight,
  ChevronDown,
  Plus,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectItems } from "@/features/workspaces/actions-project-items";

interface ProjectSectionProps {
  project: {
    id: string;
    name: string;
    key: string;
    color: string | null;
    isPrivate: boolean;
    isDefault: boolean;
  };
  workspaceSlug: string;
  isExpanded: boolean;
  onToggle: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
}

export function ProjectSection({
  project,
  workspaceSlug,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
}: ProjectSectionProps) {
  const [items, setItems] = useState<{
    boards: any[];
    documents: any[];
    canvases: any[];
  }>({ boards: [], documents: [], canvases: [] });
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    boards: true,
    documents: true,
    whiteboards: true,
  });

  useEffect(() => {
    if (
      isExpanded &&
      items.boards.length === 0 &&
      items.documents.length === 0 &&
      items.canvases.length === 0
    ) {
      loadItems();
    }
  }, [isExpanded]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getProjectItems(project.id);
      setItems(data);
    } catch (error) {
      console.error("Failed to load project items:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => onToggle(project.id);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const baseUrl = `/workspace/${workspaceSlug}`;
  const projectUrl = `${baseUrl}/projects/${project.id}`;

  return (
    <div className="space-y-0.5">
      {}
      <div className="flex items-center gap-1 group">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-accent"
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </Button>
        <Link href={projectUrl} className="flex-1 min-w-0">
          <Button
            variant="ghost"
            className="w-full justify-start h-8 px-2 font-medium"
            size="sm"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: project.color || "#6366f1" }}
              />
              <span className="truncate text-sm">{project.name}</span>
              {project.isPrivate && (
                <Lock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              )}
              {project.isDefault && (
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  Default
                </Badge>
              )}
            </div>
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(project.id)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit Project
            </DropdownMenuItem>
            {!project.isDefault && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(project.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Project
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {}
      {isExpanded && (
        <div className="ml-8 space-y-0.5 border-l-2 border-muted pl-2">
          {loading ? (
            <p className="text-xs text-muted-foreground py-2 px-2">
              Loading...
            </p>
          ) : (
            <>
              {}
              <div className="space-y-0.5">
                <div className="flex items-center group/section">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection("boards");
                    }}
                  >
                    {expandedSections.boards ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                  <Link
                    href={`${baseUrl}/projects/${project.id}/boards`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md transition-colors cursor-pointer">
                      <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Boards</span>
                    </div>
                  </Link>
                  <Link href={`${baseUrl}/projects/${project.id}/boards/new`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover/section:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                {expandedSections.boards && (
                  <>
                    {items.boards.map((board) => (
                      <Link
                        key={board.id}
                        href={`${baseUrl}/projects/${project.id}/boards/${board.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-7 px-2 text-xs pl-6"
                        >
                          <span className="truncate flex-1 text-left">
                            {board.title}
                          </span>
                          {board._count?.lists > 0 && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-xs ml-2"
                            >
                              {board._count.lists}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ))}
                    {items.boards.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1 pl-6">
                        No boards yet
                      </p>
                    )}
                  </>
                )}
              </div>

              {}
              <div className="space-y-0.5">
                <div className="flex items-center group/section">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection("documents");
                    }}
                  >
                    {expandedSections.documents ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                  <Link
                    href={`${baseUrl}/projects/${project.id}/documents`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md transition-colors cursor-pointer">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Documents</span>
                    </div>
                  </Link>
                  <Link
                    href={`${baseUrl}/projects/${project.id}/documents/new`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover/section:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                {expandedSections.documents && (
                  <>
                    {items.documents.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`${baseUrl}/projects/${project.id}/documents/${doc.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-7 px-2 text-xs pl-6"
                        >
                          {doc.icon && <span className="mr-1">{doc.icon}</span>}
                          <span className="truncate flex-1 text-left">
                            {doc.title}
                          </span>
                        </Button>
                      </Link>
                    ))}
                    {items.documents.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1 pl-6">
                        No documents yet
                      </p>
                    )}
                  </>
                )}
              </div>

              {}
              <div className="space-y-0.5">
                <div className="flex items-center group/section">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection("whiteboards");
                    }}
                  >
                    {expandedSections.whiteboards ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                  <Link
                    href={`${baseUrl}/projects/${project.id}/whiteboards`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md transition-colors cursor-pointer">
                      <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Whiteboards</span>
                    </div>
                  </Link>
                  <Link
                    href={`${baseUrl}/projects/${project.id}/whiteboards/new`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover/section:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                {expandedSections.whiteboards && (
                  <>
                    {items.canvases.map((canvas) => (
                      <Link
                        key={canvas.id}
                        href={`${baseUrl}/projects/${project.id}/whiteboards/${canvas.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-7 px-2 text-xs pl-6"
                        >
                          <span className="truncate flex-1 text-left">
                            {canvas.title}
                          </span>
                        </Button>
                      </Link>
                    ))}
                    {items.canvases.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-1 pl-6">
                        No whiteboards yet
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
