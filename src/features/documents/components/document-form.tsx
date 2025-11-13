"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createDocument } from "../actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2, FileText, Smile } from "lucide-react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  icon: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DocumentFormProps {
  projectId: string;
  workspaceSlug: string;
  workspaceId: string;
}

export function DocumentForm({ projectId, workspaceSlug, workspaceId }: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      icon: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createDocument({
        ...data,
        workspaceId,
        projectId,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Document created successfully!");
        router.push(`/workspace/${workspaceSlug}/projects/${projectId}/documents/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    form.setValue("icon", emoji.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="space-y-6">
      <Link href={`/workspace/${workspaceSlug}/projects/${projectId}/documents`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="h-20 w-20 text-4xl hover:bg-accent"
                            >
                              {field.value || <FileText className="h-8 w-8 text-muted-foreground" />}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <EmojiPicker
                              onEmojiClick={handleEmojiSelect}
                              width="100%"
                              height={400}
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to select an emoji icon for your document
                          </p>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange("")}
                            >
                              Remove Icon
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Product Requirements, Meeting Notes, User Guide"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Content Editing</p>
                    <p className="text-sm text-muted-foreground">
                      After creating the document, you'll be able to add rich content including text, images, tables, and more using our editor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Document"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/workspace/${workspaceSlug}/projects/${projectId}/documents`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
