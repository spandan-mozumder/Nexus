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
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-muted/10">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <span className="text-2xl font-bold">
              Nexus
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span>All-in-One Workspace</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            One Platform.
            <br />
            Five Tools.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Project management, task boards, documentation, team chat,
            and whiteboards in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful tools working together
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Project Management</h3>
              <p className="text-muted-foreground">Track issues, plan sprints, and manage projects.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <Trello className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Task Boards</h3>
              <p className="text-muted-foreground">Organize work with Kanban boards.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className="text-muted-foreground">Create docs and wikis for your team.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Team Chat</h3>
              <p className="text-muted-foreground">Real-time messaging and channels.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Whiteboard</h3>
              <p className="text-muted-foreground">Visual brainstorming and collaboration.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <LayoutDashboard className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unified Dashboard</h3>
              <p className="text-muted-foreground">Everything in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Teams Choose Nexus
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A unified workspace makes work easier
            </p>
          </div>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span>Save money on subscriptions</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <span>Boost team productivity</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span>Better collaboration</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span>Unified search</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <span>Stay organized</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span>Scales with your team</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-semibold">Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Nexus
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
