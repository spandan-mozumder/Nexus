"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  MessageSquare,
  Palette,
  FolderKanban,
  Settings,
  ChevronLeft,
  Users,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface WorkspaceNavProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

const navigation = [
  { name: "Overview", href: "", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

export function WorkspaceNav({ workspace, user }: WorkspaceNavProps) {
  const pathname = usePathname();
  const baseUrl = `/workspace/${workspace.slug}`;

  return (
    <div className="flex flex-col w-64 border-r bg-gradient-to-b from-background via-background to-muted/10 backdrop-blur-sm">
      <div className="p-6 border-b space-y-4">
        <Link href="/dashboard" prefetch={true}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-accent/50 transition-all duration-200 group"
          >
            <ChevronLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Workspaces
          </Button>
        </Link>
        <div className="px-2 space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-xl truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {workspace.name}
            </h2>
            <Badge variant="secondary" className="h-6 px-2 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-2">
          {navigation.map((item, index) => {
            const href = `${baseUrl}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link key={item.name} href={href} prefetch={true} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium transition-all duration-300 group",
                    isActive 
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10 shadow-md border border-primary/20 text-primary" 
                      : "hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-all duration-300",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground group-hover:text-primary group-hover:scale-110",
                    )}
                  />
                  {item.name}
                </Button>
              </Link>
            );
          })}

          <Separator className="my-6 bg-gradient-to-r from-transparent via-border to-transparent" />

          <Link href={`${baseUrl}/members`} prefetch={true} className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Button
              variant={
                pathname === `${baseUrl}/members` ? "secondary" : "ghost"
              }
              className={cn(
                "w-full justify-start font-medium transition-all duration-300 group",
                pathname === `${baseUrl}/members`
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 shadow-md border border-primary/20 text-primary"
                  : "hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Users
                className={cn(
                  "mr-3 h-5 w-5 transition-all duration-300",
                  pathname === `${baseUrl}/members`
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary group-hover:scale-110",
                )}
              />
              Members
            </Button>
          </Link>

          <Link href={`${baseUrl}/settings`} prefetch={true} className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <Button
              variant={
                pathname === `${baseUrl}/settings` ? "secondary" : "ghost"
              }
              className={cn(
                "w-full justify-start font-medium transition-all duration-300 group",
                pathname === `${baseUrl}/settings`
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 shadow-md border border-primary/20 text-primary"
                  : "hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Settings
                className={cn(
                  "mr-3 h-5 w-5 transition-all duration-300",
                  pathname === `${baseUrl}/settings`
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary group-hover:scale-110",
                )}
              />
              Settings
            </Button>
          </Link>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-300 cursor-pointer group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold group-hover:scale-110 transition-transform duration-300">
              {getInitials(user.name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-300">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/80 transition-colors duration-300">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
