"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/features/documents/components/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Upload,
  Trash2,
  Globe,
  Lock,
  Smile,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { updateDocument, deleteDocument } from "@/features/documents/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DocumentEditorProps {
  document: {
    id: string;
    title: string | null;
    content: any;
    icon: string | null;
    coverImage: string | null;
    isPublished: boolean;
    workspaceId: string;
    projectId?: string | null;
  };
}

export function DocumentEditor({
  document: initialDocument,
}: DocumentEditorProps) {
  const router = useRouter();
  const [document, setDocument] = useState({
    ...initialDocument,
    title: initialDocument.title || "Untitled",
    content:
      typeof initialDocument.content === "string"
        ? initialDocument.content
        : initialDocument.content || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedSave = useCallback(
    async (field: string, value: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          const result = await updateDocument({
            id: document.id,
            [field]: value,
          });

          if (result.error) {
            toast.error(result.error);
          }
        } catch (error) {
          console.error("Error saving:", error);
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [document.id]
  );

  const handleContentChange = async (content: string) => {
    setDocument((prev) => ({ ...prev, content }));
    debouncedSave("content", content);
  };

  const handleTitleChange = async (title: string) => {
    if (!title.trim()) return;

    setDocument((prev) => ({ ...prev, title }));
    setIsSaving(true);

    try {
      const result = await updateDocument({
        id: document.id,
        title: title.trim(),
      });

      if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsSaving(false);
      setIsEditingTitle(false);
    }
  };

  const handleIconChange = async (icon: string) => {
    setDocument((prev) => ({ ...prev, icon }));
    setShowEmojiPicker(false);

    const result = await updateDocument({
      id: document.id,
      icon,
    });

    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleRemoveIcon = async () => {
    setDocument((prev) => ({ ...prev, icon: null }));

    const result = await updateDocument({
      id: document.id,
      icon: "",
    });

    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleAddCoverImage = async () => {
    const url = window.prompt("Enter cover image URL:");
    if (!url) return;

    setDocument((prev) => ({ ...prev, coverImage: url }));

    const result = await updateDocument({
      id: document.id,
      coverImage: url,
    });

    if (result.error) {
      toast.error(result.error);
      setDocument((prev) => ({ ...prev, coverImage: null }));
    } else {
      toast.success("Cover image added");
    }
  };

  const handleRemoveCoverImage = async () => {
    setDocument((prev) => ({ ...prev, coverImage: null }));

    const result = await updateDocument({
      id: document.id,
      coverImage: "",
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cover image removed");
    }
  };

  const handleTogglePublish = async () => {
    const newPublishState = !document.isPublished;
    setDocument((prev) => ({ ...prev, isPublished: newPublishState }));

    const result = await updateDocument({
      id: document.id,
      isPublished: newPublishState,
    });

    if (result.error) {
      toast.error(result.error);
      setDocument((prev) => ({ ...prev, isPublished: !newPublishState }));
    } else {
      toast.success(
        newPublishState ? "Document published" : "Document unpublished",
      );
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this document?")) {
      return;
    }

    const result = await deleteDocument({ id: document.id });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document archived");
      if (document.projectId) { router.push(`/workspace/${document.workspaceId}/projects/${document.projectId}/documents`); } else { router.push(`/workspace/${document.workspaceId}/projects`); }
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return;
    }

    const result = await deleteDocument({ id: document.id });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document deleted");
      if (document.projectId) {
        router.push(`/workspace/${document.workspaceId}/projects/${document.projectId}/documents`);
      } else {
        router.push(`/workspace/${document.workspaceId}/projects`);
      }
    }
  };

  const handleToggleEditMode = async (newEditState: boolean) => {
    // Auto-save when switching to view mode
    if (!newEditState && isEditing) {
      // Save immediately before switching to view mode
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        await updateDocument({
          id: document.id,
          content: document.content,
        });
      } catch (error) {
        console.error("Error saving document:", error);
      }
    }
    setIsEditing(newEditState);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleEditMode(!isEditing)}
          >
            {isEditing ? "View" : "Edit"}
          </Button>
          {isEditing && (
            <Button
              variant={document.isPublished ? "default" : "outline"}
              size="sm"
              onClick={handleTogglePublish}
            >
              {document.isPublished ? (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Published
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {}
          {isSaving && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}

          {}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isEditing && !document.coverImage && (
                <>
                  <DropdownMenuItem onClick={handleAddCoverImage}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Cover
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8">
          {}
          {document.coverImage && (
            <div className="mb-8 relative group">
              <img
                src={document.coverImage}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg"
              />
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveCoverImage}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          )}

          {}
          <div className="px-8 mb-6 space-y-4">
            {}
            {document.icon && !isEditing ? (
              <div className="text-6xl">
                {document.icon}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {document.icon ? (
                  <div className="group relative">
                    <button
                      className="text-6xl hover:opacity-70 transition-opacity"
                      onClick={() => isEditing && setShowEmojiPicker(true)}
                      disabled={!isEditing}
                    >
                      {document.icon}
                    </button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={handleRemoveIcon}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ) : isEditing ? (
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        <Smile className="h-4 w-4 mr-2" />
                        Add icon
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <EmojiPicker
                        onEmojiClick={(emoji) => handleIconChange(emoji.emoji)}
                        width="100%"
                      />
                    </PopoverContent>
                  </Popover>
                ) : null}

                {showEmojiPicker && document.icon && isEditing && (
                  <div className="absolute z-50">
                    <EmojiPicker
                      onEmojiClick={(emoji) => handleIconChange(emoji.emoji)}
                    />
                  </div>
                )}
              </div>
            )}

            {}
            {isEditingTitle && isEditing ? (
              <Input
                autoFocus
                value={document.title}
                onChange={(e) =>
                  setDocument((prev) => ({ ...prev, title: e.target.value }))
                }
                onBlur={() => handleTitleChange(document.title)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleChange(document.title);
                  }
                  if (e.key === "Escape") {
                    setIsEditingTitle(false);
                  }
                }}
                className="text-5xl font-bold border-none focus-visible:ring-0 px-0 h-auto"
              />
            ) : (
              <h1
                className={cn(
                  "text-5xl font-bold rounded px-2 -ml-2 transition-colors",
                  isEditing && "cursor-text hover:bg-muted/50"
                )}
                onClick={() => isEditing && setIsEditingTitle(true)}
              >
                {document.title}
              </h1>
            )}
          </div>

          {}
          <Editor
            content={document.content}
            onChange={handleContentChange}
            editable={isEditing}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}
