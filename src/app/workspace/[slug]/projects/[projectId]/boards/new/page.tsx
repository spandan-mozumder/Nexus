import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getProjectById } from "@/features/projects/actions";
import { NewBoardClient } from "@/features/boards/components/new-board-client";

interface NewBoardPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
}

export default async function NewBoardPage({ params }: NewBoardPageProps) {
  await protectRoute();

  const { slug, projectId } = await params;

  const result = await getProjectById(projectId);

  if (result.error || !result.data) {
    redirect(`/workspace/${slug}/projects`);
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Board</h1>
        <p className="text-muted-foreground">
          Create a Kanban board to organize your tasks and workflow
        </p>
      </div>

      <NewBoardClient
        projectId={projectId}
        workspaceSlug={slug}
        workspaceId={result.data.workspaceId}
      />
    </div>
  );
}
