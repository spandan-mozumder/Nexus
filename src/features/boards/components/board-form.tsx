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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBoard } from "../actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BoardFormProps {
  projectId: string;
  workspaceSlug: string;
  workspaceId: string;
}

const BACKGROUND_COLORS = [
  { name: "Blue", value: "#0079BF" },
  { name: "Green", value: "#519839" },
  { name: "Orange", value: "#D29034" },
  { name: "Red", value: "#B04632" },
  { name: "Purple", value: "#89609E" },
  { name: "Pink", value: "#CD5A91" },
  { name: "Lime", value: "#4BBF6B" },
  { name: "Sky", value: "#00AECC" },
];

export function BoardForm({ projectId, workspaceSlug, workspaceId }: BoardFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      backgroundColor: BACKGROUND_COLORS[0].value,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const result = await createBoard({
        ...data,
        workspaceId,
        projectId,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Board created successfully!");
        router.push(`/workspace/${workspaceSlug}/projects/${projectId}/boards/${result.data.id}`);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href={`/workspace/${workspaceSlug}/projects/${projectId}/boards`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Boards
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Board Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sprint Planning, Product Roadmap"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your board
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this board..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help team members understand the board's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3">
                        {BACKGROUND_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => field.onChange(color.value)}
                            className={`w-16 h-16 rounded-lg transition-all hover:scale-110 ${
                              field.value === color.value
                                ? "ring-4 ring-primary ring-offset-2"
                                : "ring-2 ring-border"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a background color for your board
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    "Create Board"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/workspace/${workspaceSlug}/projects/${projectId}/boards`)}
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
