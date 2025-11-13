import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getWorkspaceBySlug } from "@/features/workspaces/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  CheckSquare,
  FileText,
  MessageSquare,
  Palette,
  FolderKanban,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await protectRoute();

  const { slug } = await params;
  const result = await getWorkspaceBySlug(slug);

  if (result.error || !result.workspace) {
    redirect("/dashboard");
  }

  const workspace = result.workspace;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-12">
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {workspace.name}
                </h1>
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Active
                </Badge>
              </div>
              {workspace.description && (
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                  {workspace.description}
                </p>
              )}
            </div>
          </div>
          <Separator className="my-6 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Team Members
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {workspace.members.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Active collaborators
              </p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Projects</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FolderKanban className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">0</div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Start tracking work
              </p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Active Tasks
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">0</div>
              <p className="text-sm text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg hover:shadow-muted-foreground/5 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Documents</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">0</div>
              <p className="text-sm text-muted-foreground">
                Knowledge base
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                Quick Access
              </h2>
              <p className="text-muted-foreground">Jump into your workspace features and start collaborating</p>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              2 Features
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              title="Project Management"
              description="Track issues, boards, documents, and whiteboards. Manage your projects with agile workflows"
              icon={<FolderKanban className="h-12 w-12" />}
              href={`/workspace/${slug}/projects`}
              gradient="from-primary/20 to-primary/5"
              badgeText="All-in-one"
              delay="0"
            />
            <FeatureCard
              title="Team Chat"
              description="Real-time messaging, channels, and direct conversations for seamless collaboration"
              icon={<MessageSquare className="h-12 w-12" />}
              href={`/workspace/${slug}/messages`}
              gradient="from-muted to-muted/30"
              badgeText="Slack-like"
              delay="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  gradient,
  badgeText,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  badgeText: string;
  delay: string;
}) {
  return (
    <Link href={href} className="group animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <Card className="h-full border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm group-hover:bg-card">
        <CardHeader className="p-8 space-y-6">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <div className="text-primary group-hover:text-primary/80 transition-colors duration-300">{icon}</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <Badge variant="outline" className="text-xs font-medium bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              {badgeText}
            </Badge>
          </div>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
