import { protectRoute } from "@/lib/auth-guard";
import { getDocumentById } from "@/features/documents/actions";
import { DocumentEditorClient } from "@/features/documents/components/document-editor-client";
import { redirect } from "next/navigation";

interface DocumentPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  await protectRoute();

  const { slug, projectId, documentId } = await params;
  const result = await getDocumentById(documentId);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  const document = result.data;

  // Ensure the document belongs to this project
  if (document.projectId !== projectId) {
    redirect(`/workspace/${slug}/projects/${projectId}/documents`);
  }

  return (
    <div className="flex-1 h-full overflow-hidden">
      <DocumentEditorClient
        document={{
          id: document.id,
          title: document.title,
          content: document.content,
          icon: document.icon,
          coverImage: document.coverImage,
          isPublished: document.isPublished,
          workspaceId: document.workspaceId,
          projectId: document.projectId,
        }}
      />
    </div>
  );
}
