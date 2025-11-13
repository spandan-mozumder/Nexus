import { protectRoute } from "@/lib/auth-guard";
import { getProjectById } from "@/features/projects/actions";
import { getProjectBoards } from "@/features/boards/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LayoutDashboard, Calendar } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function ProjectBoardsList({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const boardsResult = await getProjectBoards(projectId);

  if (boardsResult.error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading boards</p>
      </div>
    );
  }

  const boards = boardsResult.data || [];

  if (boards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first board to start organizing and tracking issues with Kanban
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link
          key={board.id}
          href={`/workspace/${slug}/projects/${projectId}/boards/${board.id}`}
        >
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div
                className="h-20 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: board.backgroundColor || "#0079BF" }}
              >
                {board.title}
              </div>
              <CardTitle className="text-base line-clamp-2">
                {board.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <LayoutDashboard className="h-3 w-3" />
                  <span>{board._count.issues} issues</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {board.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {board.description}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function ProjectBoardsPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  await protectRoute();

  const { slug, projectId } = await params;
  const result = await getProjectById(projectId);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = result.data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {project.name} - Boards
          </h2>
          <p className="text-muted-foreground">
            Organize and track issues with Kanban boards
          </p>
        </div>
        <Link href={`/workspace/${slug}/projects/${projectId}/boards/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Board
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <ProjectBoardsList projectId={projectId} slug={slug} />
      </Suspense>
    </div>
  );
}
