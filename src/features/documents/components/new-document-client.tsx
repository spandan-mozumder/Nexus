"use client";

import { DocumentForm } from "./document-form";

interface NewDocumentClientProps {
  projectId: string;
  workspaceSlug: string;
  workspaceId: string;
}

export function NewDocumentClient({
  projectId,
  workspaceSlug,
  workspaceId,
}: NewDocumentClientProps) {
  return (
    <DocumentForm
      projectId={projectId}
      workspaceSlug={workspaceSlug}
      workspaceId={workspaceId}
    />
  );
}
