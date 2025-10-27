"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ProjectSection } from "./project-section";
import { deleteProject } from "@/features/projects/actions";
import { ThemeToggle } from "@/components/theme-toggle";

interface Project {
  id: string;
  name: string;
  key: string;
  color: string | null;
  isPrivate: boolean;
  isDefault: boolean;
  _count: {
    boards: number;
    documents: number;
    canvases: number;
    issues: number;
  };
  members: {
    role: string;
  }[];
}

interface WorkspaceNavProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  projects: Project[];
}

export function WorkspaceNav({
  workspace,
  user,
  projects: initialProjects,
}: WorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const baseUrl = `/workspace/${workspace.slug}`;
  const [projects, setProjects] = useState(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    initialProjects.length > 0 ? initialProjects[0].id : null,
  );
  const [isPending, startTransition] = useTransition();

  const handleToggleProject = (projectId: string) => {
    setExpandedProjectId(projectId);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingId(projectId);

    const previousProjects = projects;
    setProjects(projects.filter((p) => p.id !== projectId));

    try {
      const result = await deleteProject(projectId);

      if (result.error) {
        setProjects(previousProjects);
        alert(`Error: ${result.error}`);
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      setProjects(previousProjects);
      alert("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col overflow-hidden">
      <div className="p-4 border-b space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex-1" prefetch={true}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start hover:bg-accent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Workspaces
            </Button>
          </Link>
          <ThemeToggle />
        </div>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg truncate">{workspace.name}</h2>
            <Badge variant="secondary" className="h-5 px-1.5">
              <Sparkles className="h-3 w-3" />
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="p-3 space-y-2 border-b flex-shrink-0">
        <Link href={baseUrl} prefetch={true}>
          <Button
            variant={pathname === baseUrl ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start font-medium transition-all",
              pathname === baseUrl &&
                "bg-secondary shadow-sm border border-border",
            )}
            size="sm"
          >
            <LayoutDashboard
              className={cn(
                "mr-2 h-4 w-4",
                pathname === baseUrl ? "text-primary" : "text-muted-foreground",
              )}
            />
            Overview
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <nav className="p-3 space-y-1 flex flex-col">
          <div className="flex items-center justify-between px-2 py-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
            <Badge variant="secondary" className="text-xs h-5">
              {projects.length}
            </Badge>
          </div>

          {projects.map((project) => (
            <ProjectSection
              key={project.id}
              project={project}
              workspaceSlug={workspace.slug}
              isExpanded={expandedProjectId === project.id}
              onToggle={handleToggleProject}
              onDelete={handleDeleteProject}
            />
          ))}

          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No projects yet. Create one to get started!
            </p>
          )}
        </nav>
      </ScrollArea>

      <div className="p-3 space-y-2 border-t flex-shrink-0">
        <Link href={`${baseUrl}/messages`} prefetch={true}>
          <Button
            variant={
              pathname.startsWith(`${baseUrl}/messages`) ? "secondary" : "ghost"
            }
            className={cn(
              "w-full justify-start font-medium transition-all",
              pathname.startsWith(`${baseUrl}/messages`) &&
                "bg-secondary shadow-sm border border-border",
            )}
            size="sm"
          >
            <MessageSquare
              className={cn(
                "mr-2 h-4 w-4",
                pathname.startsWith(`${baseUrl}/messages`)
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            Messages
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t bg-muted/30 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
