import { protectRoute } from "@/lib/auth-guard";
import { getProjectById } from "@/features/projects/actions";
import { getProjectCanvases } from "@/features/whiteboards/actions";
import { ProjectWhiteboardsClient } from "@/features/whiteboards/components/project-whiteboards-client";

export default async function ProjectWhiteboardsPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  await protectRoute();

  const { slug, projectId } = await params;
  const [projectResult, canvasesResult] = await Promise.all([
    getProjectById(projectId),
    getProjectCanvases(projectId),
  ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = projectResult.data;
  const canvases = canvasesResult.success ? canvasesResult.data || [] : [];

  return (
    <ProjectWhiteboardsClient
      project={project}
      canvases={canvases}
      workspaceSlug={slug}
      projectId={projectId}
    />
  );
}
