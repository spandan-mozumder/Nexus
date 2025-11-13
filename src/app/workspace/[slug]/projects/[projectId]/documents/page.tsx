import { protectRoute } from "@/lib/auth-guard";
import { getProjectById } from "@/features/projects/actions";
import { getProjectDocuments } from "@/features/documents/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DocumentCard } from "@/features/documents/components/document-card";

async function ProjectDocumentsList({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const documentsResult = await getProjectDocuments(projectId);

  if (documentsResult.error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading documents</p>
      </div>
    );
  }

  const documents = documentsResult.data || [];

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first document to start organizing information
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          slug={slug}
          projectId={projectId}
        />
      ))}
    </div>
  );
}

export default async function ProjectDocumentsPage({
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
            {project.name} - Documents
          </h2>
          <p className="text-muted-foreground">
            Manage your project documents and notes
          </p>
        </div>
        <Link href={`/workspace/${slug}/projects/${projectId}/documents/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <ProjectDocumentsList projectId={projectId} slug={slug} />
      </Suspense>
    </div>
  );
}
