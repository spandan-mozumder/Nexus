"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  FolderOpen,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDocument } from "@/features/documents/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocumentCardProps {
  document: {
    id: string;
    title: string | null;
    icon: string | null;
    isPublished: boolean;
    createdAt: Date;
    _count: {
      children: number;
    };
  };
  slug: string;
  projectId: string;
}

export function DocumentCard({ document, slug, projectId }: DocumentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteDocument({ id: document.id });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Document deleted");
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/workspace/${slug}/projects/${projectId}/documents/${document.id}`}>
        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
          <CardHeader className="pb-3">
            <div className="h-20 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-lg">
              {document.icon ? (
                <span className="text-2xl">{document.icon}</span>
              ) : (
                <FileText className="h-8 w-8" />
              )}
            </div>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base line-clamp-2 flex-1">
                {document.title || "Untitled"}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                <span>{document._count.children} pages</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(document.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {document.isPublished && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Published
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
