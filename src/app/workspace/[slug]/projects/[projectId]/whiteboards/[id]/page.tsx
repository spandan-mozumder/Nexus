import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

interface WhiteboardPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    id: string;
  }>;
}

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  await protectRoute();

  const { slug, projectId } = await params;
  redirect(`/workspace/${slug}/projects/${projectId}/whiteboards`);
}
