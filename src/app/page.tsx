import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Trello,
  Palette,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="lg" />
            <span className="text-2xl font-bold">Unified Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" prefetch={true}>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up" prefetch={true}>
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            One Platform. Five Superpowers.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Combine project management, task boards, documentation, team chat,
            and visual collaboration in one seamless workspace.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up" prefetch={true}>
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/sign-in" prefetch={true}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything Your Team Needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-blue-600" />}
              title="Project Management"
              description="Track issues, plan sprints, and manage projects with Jira-like power and flexibility."
            />
            <FeatureCard
              icon={<Trello className="h-10 w-10 text-indigo-600" />}
              title="Task Boards"
              description="Organize work with intuitive Kanban boards. Drag, drop, and get things done."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-purple-600" />}
              title="Documentation"
              description="Create beautiful docs and wikis. Share knowledge across your entire team."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-green-600" />}
              title="Team Chat"
              description="Real-time messaging, channels, and threads. Keep everyone in the loop."
            />
            <FeatureCard
              icon={<Palette className="h-10 w-10 text-pink-600" />}
              title="Whiteboard"
              description="Brainstorm visually with infinite canvas and real-time collaboration."
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-10 w-10 text-orange-600" />}
              title="Unified Workspace"
              description="Everything in one place. No more switching between apps."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Teams Love Unified Workspace
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <BenefitItem text="Save money - one subscription instead of five" />
            <BenefitItem text="Boost productivity - no more context switching" />
            <BenefitItem text="Collaborate better - everything is connected" />
            <BenefitItem text="Find anything - unified search across all content" />
            <BenefitItem text="Stay organized - one workspace for all your work" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            &copy; 2025 Unified Workspace. Built with Next.js, TypeScript, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
      <span className="text-lg">{text}</span>
    </div>
  );
}
