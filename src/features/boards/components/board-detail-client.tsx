"use client";

import { useState } from "react";
import { BoardIssuesKanban } from "./board-issues-kanban";
import { CreateIssueDialog } from "./create-issue-dialog";

interface BoardDetailClientProps {
  board: {
    id: string;
    title: string;
    description: string | null;
  };
  issues: any[];
  boardId: string;
  workspaceSlug: string;
  projectId: string;
}

export function BoardDetailClient({
  board,
  issues,
  boardId,
  workspaceSlug,
  projectId,
}: BoardDetailClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("BACKLOG");

  const handleCreateIssue = (status: string) => {
    setDefaultStatus(status);
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-3xl font-bold">{board.title}</h1>
          {board.description && (
            <p className="text-muted-foreground mt-2">{board.description}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BoardIssuesKanban
          issues={issues}
          boardId={boardId}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          onCreateIssue={handleCreateIssue}
        />
      </div>

      <CreateIssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        boardId={boardId}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
