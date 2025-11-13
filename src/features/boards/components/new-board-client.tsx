"use client";

import { BoardForm } from "./board-form";

interface NewBoardClientProps {
  projectId: string;
  workspaceSlug: string;
  workspaceId: string;
}

export function NewBoardClient({
  projectId,
  workspaceSlug,
  workspaceId,
}: NewBoardClientProps) {
  return (
    <BoardForm
      projectId={projectId}
      workspaceSlug={workspaceSlug}
      workspaceId={workspaceId}
    />
  );
}
