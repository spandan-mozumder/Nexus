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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Logo size="md" className="transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nexus
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={session.user.avatar || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {getInitials(session.user.name || session.user.email || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 text-sm">
                <div className="font-medium">{session.user.name || "User"}</div>
                <div className="text-muted-foreground">
                  {session.user.email}
                </div>
              </div>
            </div>
            <form action={signOutAction}>
              <Button variant="outline" type="submit" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Your Workspaces
            </h2>
            <p className="text-lg text-muted-foreground">
              Select a workspace to get started or create a new one.
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CreateWorkspaceModal>
              <Button className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                New Workspace
              </Button>
            </CreateWorkspaceModal>
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted/50 bg-gradient-to-br from-muted/20 to-muted/10 py-24 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Plus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              No workspaces yet
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Create your first workspace to start collaborating with your team.
            </p>
            <CreateWorkspaceModal>
              <Button className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Create Workspace
              </Button>
            </CreateWorkspaceModal>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace, index) => (
              <Link
                key={workspace.id}
                href={`/workspace/${workspace.slug}`}
                prefetch={true}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 group-hover:bg-card">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-start justify-between mb-3">
                      <span className="truncate text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                        {workspace.name}
                      </span>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </CardTitle>
                    {workspace.description && (
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {workspace.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end p-6 pt-0">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{workspace._count.members} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <FolderKanban className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="font-medium">{workspace._count.projects} projects</span>
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
