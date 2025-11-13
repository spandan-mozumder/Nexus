import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getProjectById } from "@/features/projects/actions";
import { getProjectItems } from "@/features/workspaces/actions-project-items";
import { getProjectMembers } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  Palette,
  ListTodo,
  Users,
  Calendar,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
}

export default async function ProjectOverviewPage({
  params,
}: ProjectPageProps) {
  await protectRoute();

  const { slug, projectId } = await params;
  const [projectResult, itemsResult, membersResult] = await Promise.all([
    getProjectById(projectId),
    getProjectItems(projectId),
    getProjectMembers(projectId),
  ]);

  if (projectResult.error || !projectResult.data) {
    redirect(`/workspace/${slug}/projects`);
  }

  const project = projectResult.data;
  const items = itemsResult;
  const members = membersResult.success ? membersResult.data : [];

  const stats = [
    {
      title: "Boards",
      count: items.boards.length,
      icon: CheckSquare,
      href: `/workspace/${slug}/projects/${projectId}/boards`,
      color: "text-blue-500",
      description: "Task boards with issues",
    },
    {
      title: "Documents",
      count: items.documents.length,
      icon: FileText,
      href: `/workspace/${slug}/projects/${projectId}/documents`,
      color: "text-green-500",
      description: "Project documentation",
    },
    {
      title: "Whiteboards",
      count: items.canvases.length,
      icon: Palette,
      href: `/workspace/${slug}/projects/${projectId}/whiteboards`,
      color: "text-purple-500",
      description: "Visual collaboration",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {}
      <div>
        <div>
          {project.description && (
            <p className="text-muted-foreground mb-4">{project.description}</p>
          )}
          <h2 className="text-2xl font-bold tracking-tight mb-6">Overview</h2>
        </div>
      </div>

      <Separator />

      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.count === 1 ? "item" : "items"} in project
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Details about this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Project Key</span>
              <Badge variant="secondary">{project.key}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">
                {project.isPrivate ? "Private" : "Shared"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <span className="text-sm font-semibold">
                {items.boards.length +
                  items.documents.length +
                  items.canvases.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "member" : "members"} in
              this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {member.user.avatar && (
                        <AvatarImage src={member.user.avatar} />
                      )}
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          member.user.name || member.user.email || "U",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={member.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
              {members.length > 5 && (
                <Link href={`/workspace/${slug}/projects/${projectId}/members`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View all {members.length} members
                  </Button>
                </Link>
              )}
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Create new items in this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href={`/workspace/${slug}/projects/${projectId}/boards/new`}>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="mr-2 h-4 w-4" />
                New Board
              </Button>
            </Link>
            <Link
              href={`/workspace/${slug}/projects/${projectId}/documents/new`}
            >
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </Link>
            <Link
              href={`/workspace/${slug}/whiteboard/new?projectId=${projectId}`}
            >
              <Button variant="outline" className="w-full justify-start">
                <Palette className="mr-2 h-4 w-4" />
                New Whiteboard
              </Button>
            </Link>
            <Link href={`/workspace/${slug}/projects/${projectId}/issues/new`}>
              <Button variant="outline" className="w-full justify-start">
                <ListTodo className="mr-2 h-4 w-4" />
                New Issue
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
