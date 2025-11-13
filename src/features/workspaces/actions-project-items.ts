"use server";

import { getProjectBoards } from "@/features/boards/actions";
import { getProjectDocuments } from "@/features/documents/actions";
import { getProjectCanvases } from "@/features/whiteboards/actions";

export async function getProjectItems(projectId: string) {
  const [boardsResult, documentsResult, canvasesResult] =
    await Promise.all([
      getProjectBoards(projectId),
      getProjectDocuments(projectId),
      getProjectCanvases(projectId),
    ]);

  return {
    boards: boardsResult.success ? boardsResult.data : [],
    documents: documentsResult.success ? documentsResult.data : [],
    canvases: canvasesResult.success ? canvasesResult.data : [],
  };
}
