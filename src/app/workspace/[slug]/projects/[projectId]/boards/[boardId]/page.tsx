import { protectRoute } from "@/lib/auth-guard";
import { getBoardById, getBoardIssues } from "@/features/boards/actions";
import { BoardDetailClient } from "@/features/boards/components/board-detail-client";

interface BoardPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  await protectRoute();

  const { slug, projectId, boardId } = await params;
  const [boardResult, issuesResult] = await Promise.all([
    getBoardById(boardId),
    getBoardIssues(boardId),
  ]);

  if (boardResult.error || !boardResult.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const board = boardResult.data;
  const issues = issuesResult.success ? issuesResult.data : [];

  return (
    <BoardDetailClient
      board={board}
      issues={issues}
      boardId={boardId}
      workspaceSlug={slug}
      projectId={projectId}
    />
  );
}
