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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Logo size="lg" className="transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nexus
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" prefetch={true}>
              <Button variant="ghost" className="hover:bg-accent/50 transition-all duration-200">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" prefetch={true}>
              <Button className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
        
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            <span>All-in-One Productivity Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 leading-tight animate-fade-in-up delay-200">
            One Platform.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Five Superpowers.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Combine project management, task boards, documentation, team chat,
            and visual collaboration in one seamless workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-400">
            <Link href="/sign-up" prefetch={true}>
              <Button size="lg" className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="/sign-in" prefetch={true}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 hover:bg-accent/50 transition-all duration-300 hover:-translate-y-1">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything Your Team Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Five powerful tools integrated into one seamless workspace
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle2 className="h-12 w-12" />}
              title="Project Management"
              description="Track issues, plan sprints, and manage projects with Jira-like power and flexibility."
              gradient="from-blue-500/20 to-blue-600/10"
              iconColor="text-blue-600"
              delay="0"
            />
            <FeatureCard
              icon={<Trello className="h-12 w-12" />}
              title="Task Boards"
              description="Organize work with intuitive Kanban boards. Drag, drop, and get things done."
              gradient="from-indigo-500/20 to-indigo-600/10"
              iconColor="text-indigo-600"
              delay="100"
            />
            <FeatureCard
              icon={<FileText className="h-12 w-12" />}
              title="Documentation"
              description="Create beautiful docs and wikis. Share knowledge across your entire team."
              gradient="from-purple-500/20 to-purple-600/10"
              iconColor="text-purple-600"
              delay="200"
            />
            <FeatureCard
              icon={<MessageSquare className="h-12 w-12" />}
              title="Team Chat"
              description="Real-time messaging, channels, and threads. Keep everyone in the loop."
              gradient="from-green-500/20 to-green-600/10"
              iconColor="text-green-600"
              delay="300"
            />
            <FeatureCard
              icon={<Palette className="h-12 w-12" />}
              title="Whiteboard"
              description="Brainstorm visually with infinite canvas and real-time collaboration."
              gradient="from-pink-500/20 to-pink-600/10"
              iconColor="text-pink-600"
              delay="400"
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-12 w-12" />}
              title="Unified Dashboard"
              description="Everything in one place. No more switching between apps."
              gradient="from-orange-500/20 to-orange-600/10"
              iconColor="text-orange-600"
              delay="500"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <span>Why Teams Choose Nexus</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Teams Love Nexus
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the difference of a truly unified workspace
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <BenefitItem 
              text="Save money - one subscription instead of five" 
              icon={<Zap className="h-6 w-6" />}
              delay="0"
            />
            <BenefitItem 
              text="Boost productivity - no more context switching" 
              icon={<CheckCircle2 className="h-6 w-6" />}
              delay="100"
            />
            <BenefitItem 
              text="Collaborate better - everything is connected" 
              icon={<MessageSquare className="h-6 w-6" />}
              delay="200"
            />
            <BenefitItem 
              text="Find anything - unified search across all content" 
              icon={<FileText className="h-6 w-6" />}
              delay="300"
            />
            <BenefitItem 
              text="Stay organized - one workspace for all your work" 
              icon={<LayoutDashboard className="h-6 w-6" />}
              delay="400"
            />
            <BenefitItem 
              text="Scale effortlessly - grows with your team" 
              icon={<Sparkles className="h-6 w-6" />}
              delay="500"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Nexus
              </span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              &copy; 2025 Nexus. Built with Next.js, TypeScript, and ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  iconColor,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  delay: string;
}) {
  return (
    <div 
      className="group relative p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
      <div className="relative z-10">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function BenefitItem({ 
  text, 
  icon, 
  delay 
}: { 
  text: string; 
  icon: React.ReactNode;
  delay: string;
}) {
  return (
    <div 
      className="group flex items-center gap-4 p-6 rounded-xl bg-background/50 backdrop-blur-sm border hover:bg-background hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <span className="text-lg font-medium group-hover:text-primary transition-colors duration-300">{text}</span>
    </div>
  );
}
