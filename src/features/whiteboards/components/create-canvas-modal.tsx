"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createCanvas } from "../actions";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
});

interface CreateCanvasModalProps {
  workspaceId: string;
  workspaceSlug: string;
  projectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCanvasModal({
  workspaceId,
  workspaceSlug,
  projectId,
  open,
  onOpenChange,
}: CreateCanvasModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      createCanvas({ ...data, workspaceId, projectId }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Whiteboard created successfully");
        queryClient.invalidateQueries({ queryKey: ["canvases", workspaceId] });
        onOpenChange(false);
        form.reset();

        if (result.data) {
          router.push(`/workspace/${workspaceSlug}/projects/${projectId}/whiteboards/${result.data.id}`);
          router.refresh();
        }
      }
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Whiteboard</DialogTitle>
          <DialogDescription>
            Create a new collaborative whiteboard for visual brainstorming
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="My Whiteboard" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Whiteboard
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
