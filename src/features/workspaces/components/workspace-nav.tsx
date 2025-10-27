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
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Boards", href: "/boards", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Whiteboard", href: "/whiteboard", icon: Palette },
];

export function WorkspaceNav({ workspace, user }: WorkspaceNavProps) {
  const pathname = usePathname();
  const baseUrl = `/workspace/${workspace.slug}`;

  return (
    <div className="flex flex-col w-64 border-r bg-gradient-to-b from-background to-muted/20">
      <div className="p-4 border-b space-y-3">
        <Link href="/dashboard" prefetch={true}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-accent"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Button>
        </Link>
        <div className="px-2 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg truncate">{workspace.name}</h2>
            <Badge variant="secondary" className="h-5 px-1.5">
              <Sparkles className="h-3 w-3" />
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const href = `${baseUrl}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link key={item.name} href={href} prefetch={true}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start font-medium transition-all",
                    isActive && "bg-secondary shadow-sm border border-border",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {item.name}
                </Button>
              </Link>
            );
          })}

          <Separator className="my-4" />

          <Link href={`${baseUrl}/members`} prefetch={true}>
            <Button
              variant={
                pathname === `${baseUrl}/members` ? "secondary" : "ghost"
              }
              className={cn(
                "w-full justify-start font-medium transition-all",
                pathname === `${baseUrl}/members` &&
                  "bg-secondary shadow-sm border border-border",
              )}
            >
              <Users
                className={cn(
                  "mr-3 h-4 w-4",
                  pathname === `${baseUrl}/members`
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              Members
            </Button>
          </Link>

          <Link href={`${baseUrl}/settings`} prefetch={true}>
            <Button
              variant={
                pathname === `${baseUrl}/settings` ? "secondary" : "ghost"
              }
              className={cn(
                "w-full justify-start font-medium transition-all",
                pathname === `${baseUrl}/settings` &&
                  "bg-secondary shadow-sm border border-border",
              )}
            >
              <Settings
                className={cn(
                  "mr-3 h-4 w-4",
                  pathname === `${baseUrl}/settings`
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              Settings
            </Button>
          </Link>
        </nav>
      </ScrollArea>

      {}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(user.name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
