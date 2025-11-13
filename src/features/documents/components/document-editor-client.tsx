"use client";

import { DocumentEditor } from "./document-editor";

interface DocumentEditorClientProps {
  document: {
    id: string;
    title: string | null;
    content: any;
    icon: string | null;
    coverImage: string | null;
    isPublished: boolean;
    workspaceId: string;
    projectId?: string | null;
  };
}

export function DocumentEditorClient({ document }: DocumentEditorClientProps) {
  return <DocumentEditor document={document} />;
}
