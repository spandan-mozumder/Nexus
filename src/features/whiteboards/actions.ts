"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCanvasSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  workspaceId: z.string(),
  projectId: z.string().optional(),
});

const updateCanvasSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
});

const createLayerSchema = z.object({
  canvasId: z.string(),
  type: z.enum(["RECTANGLE", "ELLIPSE", "PATH", "TEXT", "NOTE"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  data: z.any(),
});

const updateLayerSchema = z.object({
  id: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  data: z.any().optional(),
});

const idSchema = z.object({
  id: z.string(),
});

export async function createCanvas(data: z.infer<typeof createCanvasSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createCanvasSchema.parse(data);

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "You are not a member of this workspace" };
    }

    let projectId = validatedData.projectId;
    if (!projectId) {
      const defaultProject = await db.project.findFirst({
        where: {
          workspaceId: validatedData.workspaceId,
          isDefault: true,
        },
      });

      if (!defaultProject) {
        return { error: "No default project found in workspace" };
      }

      projectId = defaultProject.id;
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return { error: "You don't have access to this project" };
    }

    const canvas = await db.canvas.create({
      data: {
        title: validatedData.title,
        workspaceId: validatedData.workspaceId,
        projectId: projectId,
        createdById: session.user.id,
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
        action: "CREATED",
        entityType: "CANVAS",
        entityId: canvas.id,
        metadata: { message: `Created canvas "${canvas.title}"` },
      },
    });

    revalidatePath(`/workspace/${validatedData.workspaceId}/projects/${projectId}/whiteboards`);

    return { success: true, data: canvas };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating canvas:", error);
    return { error: "Failed to create canvas" };
  }
}

export async function updateCanvas(data: z.infer<typeof updateCanvasSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateCanvasSchema.parse(data);

    const canvas = await db.canvas.findFirst({
      where: { id: validatedData.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!canvas || canvas.workspace.members.length === 0) {
      return { error: "Canvas not found or access denied" };
    }

    const { id, ...updateData } = validatedData;
    const updatedCanvas = await db.canvas.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath(`/workspace/${canvas.workspaceId}/projects/${canvas.projectId}/whiteboards`);
    revalidatePath(
      `/workspace/${canvas.workspaceId}/projects/${canvas.projectId}/whiteboards/${validatedData.id}`,
    );

    return { success: true, data: updatedCanvas };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating canvas:", error);
    return { error: "Failed to update canvas" };
  }
}

export async function deleteCanvas(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const canvas = await db.canvas.findFirst({
      where: { id: validatedData.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        project: true,
      },
    });

    if (!canvas || canvas.workspace.members.length === 0) {
      return { error: "Canvas not found or access denied" };
    }

    if (canvas.project && canvas.project.createdById !== session.user.id) {
      return { error: "Only the project creator can delete whiteboards" };
    }

    await db.canvas.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(`/workspace/${canvas.workspaceId}/projects/${canvas.projectId}/whiteboards`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting canvas:", error);
    return { error: "Failed to delete canvas" };
  }
}

export async function getWorkspaceCanvases(workspaceSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const workspace = await db.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true },
    });

    if (!workspace) {
      return { error: "Workspace not found" };
    }

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "Access denied" };
    }

    const canvases = await db.canvas.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            layers: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: canvases, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting canvases:", error);
    return { error: "Failed to fetch canvases" };
  }
}

export async function getProjectCanvases(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return { error: "You don't have access to this project" };
    }

    const canvases = await db.canvas.findMany({
      where: {
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
        _count: {
          select: {
            layers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: canvases };
  } catch (error) {
    console.error("Error getting project canvases:", error);
    return { error: "Failed to fetch project canvases" };
  }
}

export async function getCanvasById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const canvas = await db.canvas.findFirst({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        layers: {
          orderBy: {
            zIndex: "asc",
          },
        },
      },
    });

    if (!canvas || canvas.workspace.members.length === 0) {
      return { error: "Canvas not found or access denied" };
    }

    return { success: true, data: canvas };
  } catch (error) {
    console.error("Error getting canvas:", error);
    return { error: "Failed to fetch canvas" };
  }
}

export async function createLayer(data: z.infer<typeof createLayerSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createLayerSchema.parse(data);

    const canvas = await db.canvas.findFirst({
      where: { id: validatedData.canvasId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        layers: true,
      },
    });

    if (!canvas || canvas.workspace.members.length === 0) {
      return { error: "Canvas not found or access denied" };
    }

    const maxZIndex = canvas.layers.reduce(
      (max, layer) => Math.max(max, layer.zIndex),
      0,
    );

    const layer = await db.canvasLayer.create({
      data: {
        canvasId: validatedData.canvasId,
        type: validatedData.type,
        x: validatedData.x,
        y: validatedData.y,
        width: validatedData.width,
        height: validatedData.height,
        zIndex: maxZIndex + 1,
        data: validatedData.data,
      },
    });

    return { success: true, data: layer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating layer:", error);
    return { error: "Failed to create layer" };
  }
}

export async function updateLayer(data: z.infer<typeof updateLayerSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateLayerSchema.parse(data);

    const layer = await db.canvasLayer.findFirst({
      where: { id: validatedData.id },
      include: {
        canvas: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!layer || layer.canvas.workspace.members.length === 0) {
      return { error: "Layer not found or access denied" };
    }

    const { id, ...updateData } = validatedData;
    const updatedLayer = await db.canvasLayer.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    return { success: true, data: updatedLayer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating layer:", error);
    return { error: "Failed to update layer" };
  }
}

export async function deleteLayer(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const layer = await db.canvasLayer.findFirst({
      where: { id: validatedData.id },
      include: {
        canvas: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
            project: true,
          },
        },
      },
    });

    if (!layer || layer.canvas.workspace.members.length === 0) {
      return { error: "Layer not found or access denied" };
    }

    if (
      layer.canvas.project &&
      layer.canvas.project.createdById !== session.user.id
    ) {
      return { error: "Only the project creator can delete layers" };
    }

    await db.canvasLayer.delete({
      where: { id: validatedData.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting layer:", error);
    return { error: "Failed to delete layer" };
  }
}

export async function bringLayerToFront(layerId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const layer = await db.canvasLayer.findFirst({
      where: { id: layerId },
      include: {
        canvas: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
            layers: true,
          },
        },
      },
    });

    if (!layer || layer.canvas.workspace.members.length === 0) {
      return { error: "Layer not found or access denied" };
    }

    const maxZIndex = layer.canvas.layers.reduce(
      (max, l) => Math.max(max, l.zIndex),
      0,
    );

    await db.canvasLayer.update({
      where: { id: layerId },
      data: { zIndex: maxZIndex + 1 },
    });

    return { success: true };
  } catch (error) {
    console.error("Error bringing layer to front:", error);
    return { error: "Failed to update layer" };
  }
}
