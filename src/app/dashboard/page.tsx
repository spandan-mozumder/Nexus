import { protectRoute } from "@/lib/auth-guard";
import { getUserWorkspaces } from "@/features/workspaces/actions";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FolderKanban, ArrowRight, Plus } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { getInitials } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await protectRoute();

  const result = await getUserWorkspaces();
  const workspaces = result.workspaces || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <h1 className="text-xl font-bold">Nexus</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.avatar || ""} />
                <AvatarFallback className="bg-primary/10">
                  {getInitials(session.user.name || session.user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{session.user.name || "User"}</div>
                <div className="text-muted-foreground text-xs">
                  {session.user.email}
                </div>
              </div>
            </div>
            <form action={signOutAction}>
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-1">
              Your Workspaces
            </h2>
            <p className="text-muted-foreground">
              Select a workspace to get started or create a new one.
            </p>
          </div>
          <CreateWorkspaceModal>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          </CreateWorkspaceModal>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              No workspaces yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first workspace to start collaborating.
            </p>
            <CreateWorkspaceModal>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </CreateWorkspaceModal>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspace/${workspace.slug}`}
              >
                <Card className="h-full hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="truncate">
                        {workspace.name}
                      </span>
                      <ArrowRight className="h-5 w-5 flex-shrink-0" />
                    </CardTitle>
                    {workspace.description && (
                      <CardDescription className="line-clamp-2">
                        {workspace.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{workspace._count.members}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4" />
                        <span>{workspace._count.projects}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
