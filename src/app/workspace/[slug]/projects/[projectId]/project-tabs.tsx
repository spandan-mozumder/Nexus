"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  workspaceSlug: string;
  projectId: string;
}

export function ProjectTabs({ workspaceSlug, projectId }: ProjectTabsProps) {
  const pathname = usePathname();

  const mainTabs = [
    {
      label: "Overview",
      href: `/workspace/${workspaceSlug}/projects/${projectId}`,
      exact: true,
    },
    {
      label: "Boards",
      href: `/workspace/${workspaceSlug}/projects/${projectId}/boards`,
    },
    {
      label: "Documents",
      href: `/workspace/${workspaceSlug}/projects/${projectId}/documents`,
    },
    {
      label: "Whiteboards",
      href: `/workspace/${workspaceSlug}/projects/${projectId}/whiteboards`,
    },
    {
      label: "Members",
      href: `/workspace/${workspaceSlug}/projects/${projectId}/members`,
    },
    {
      label: "Messages",
      href: `/workspace/${workspaceSlug}/projects/${projectId}/messages`,
    },
  ];

  return (
    <div className="px-6 border-t">
      <nav className="flex space-x-1 overflow-x-auto">
        {mainTabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link key={tab.href} href={tab.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none border-b-2 px-4 py-3 text-sm font-medium",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {tab.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
