"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  workspaceId: z.string(),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  coverImage: z.string().url().optional(),
});

const updateDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  icon: z.string().optional(),
  coverImage: z.string().url().optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

const documentIdSchema = z.object({
  id: z.string(),
});

export async function createDocument(
  data: z.infer<typeof createDocumentSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createDocumentSchema.parse(data);

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

    if (validatedData.parentId) {
      const parentDoc = await db.document.findFirst({
        where: {
          id: validatedData.parentId,
          workspaceId: validatedData.workspaceId,
        },
      });

      if (!parentDoc) {
        return { error: "Parent document not found" };
      }
    }

    const document = await db.document.create({
      data: {
        title: validatedData.title,
        workspaceId: validatedData.workspaceId,
        projectId: projectId,
        createdById: session.user.id,
        parentId: validatedData.parentId,
        icon: validatedData.icon,
        coverImage: validatedData.coverImage,
        content: "",
        isPublished: false,
        isArchived: false,
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
        action: "CREATED",
        entityType: "DOCUMENT",
        entityId: document.id,
        metadata: { message: `Created document "${document.title || "Untitled"}"` },
      },
    });

    if (projectId) {
      revalidatePath(`/workspace/${validatedData.workspaceId}/projects/${projectId}/documents`);
    } else {
      revalidatePath(`/workspace/${validatedData.workspaceId}/projects`);
    }

    return { success: true, data: document };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating document:", error);
    return { error: "Failed to create document" };
  }
}

export async function updateDocument(
  data: z.infer<typeof updateDocumentSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateDocumentSchema.parse(data);

    const existingDoc = await db.document.findFirst({
      where: {
        id: validatedData.id,
      },
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

    if (!existingDoc) {
      return { error: "Document not found" };
    }

    if (existingDoc.workspace.members.length === 0) {
      return { error: "You don't have access to this document" };
    }

    const { id, ...updateData } = validatedData;
    const updatedDocument = await db.document.update({
      where: { id: validatedData.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    if (validatedData.isPublished !== undefined) {
      await db.activityLog.create({
        data: {
          workspaceId: existingDoc.workspaceId,
          userId: session.user.id,
          action: "UPDATED",
          entityType: "DOCUMENT",
          entityId: updatedDocument.id,
          metadata: {
            message: `${validatedData.isPublished ? "Published" : "Unpublished"} document "${updatedDocument.title}"`,
          },
        },
      });
    }

    if (existingDoc.projectId) {
      revalidatePath(`/workspace/${existingDoc.workspaceId}/projects/${existingDoc.projectId}/documents`);
      revalidatePath(`/workspace/${existingDoc.workspaceId}/projects/${existingDoc.projectId}/documents/${validatedData.id}`);
    } else {
      revalidatePath(`/workspace/${existingDoc.workspaceId}/projects`);
    }

    return { success: true, data: updatedDocument };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating document:", error);
    return { error: "Failed to update document" };
  }
}

export async function deleteDocument(data: z.infer<typeof documentIdSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = documentIdSchema.parse(data);

    const document = await db.document.findFirst({
      where: {
        id: validatedData.id,
      },
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

    if (!document) {
      return { error: "Document not found" };
    }

    if (document.workspace.members.length === 0) {
      return { error: "You don't have access to this document" };
    }

    if (document.project && document.project.createdById !== session.user.id) {
      return { error: "Only the project creator can delete documents" };
    }

    await db.document.update({
      where: { id: validatedData.id },
      data: {
        isArchived: true,
        updatedAt: new Date(),
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: document.workspaceId,
        userId: session.user.id,
        action: "DELETED",
        entityType: "DOCUMENT",
        entityId: document.id,
        metadata: { message: `Archived document "${document.title}"` },
      },
    });

    if (document.projectId) {
      revalidatePath(`/workspace/${document.workspaceId}/projects/${document.projectId}/documents`);
    } else {
      revalidatePath(`/workspace/${document.workspaceId}/projects`);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error deleting document:", error);
    return { error: "Failed to delete document" };
  }
}

export async function restoreDocument(data: z.infer<typeof documentIdSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = documentIdSchema.parse(data);

    const document = await db.document.findFirst({
      where: {
        id: validatedData.id,
      },
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

    if (!document) {
      return { error: "Document not found" };
    }

    if (document.workspace.members.length === 0) {
      return { error: "You don't have access to this document" };
    }

    await db.document.update({
      where: { id: validatedData.id },
      data: {
        isArchived: false,
        updatedAt: new Date(),
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: document.workspaceId,
        userId: session.user.id,
        action: "UPDATED",
        entityType: "DOCUMENT",
        entityId: document.id,
        metadata: { message: `Restored document "${document.title}"` },
      },
    });

    if (document.projectId) {
      revalidatePath(`/workspace/${document.workspaceId}/projects/${document.projectId}/documents`);
    } else {
      revalidatePath(`/workspace/${document.workspaceId}/projects`);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error restoring document:", error);
    return { error: "Failed to restore document" };
  }
}

export async function getWorkspaceDocuments(workspaceSlug: string) {
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
      return { error: "You are not a member of this workspace" };
    }

    const documents = await db.document.findMany({
      where: {
        workspaceId: workspace.id,
        isArchived: false,
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
            children: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: documents, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting workspace documents:", error);
    return { error: "Failed to fetch documents" };
  }
}

export async function getProjectDocuments(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const projectMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });

    if (!projectMember) {
      return { error: "Access denied" };
    }

    const documents = await db.document.findMany({
      where: {
        projectId,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        icon: true,
        isPublished: true,
        createdAt: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: documents };
  } catch (error) {
    console.error("Error getting project documents:", error);
    return { error: "Failed to fetch project documents" };
  }
}

export async function getDocumentById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const document = await db.document.findFirst({
      where: {
        id,
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
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
        children: {
          where: {
            isArchived: false,
          },
          select: {
            id: true,
            title: true,
            icon: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!document) {
      return { error: "Document not found" };
    }

    if (!document.isPublished && document.workspace.members.length === 0) {
      return { error: "You don't have access to this document" };
    }

    return { success: true, data: document };
  } catch (error) {
    console.error("Error getting document:", error);
    return { error: "Failed to fetch document" };
  }
}

export async function getArchivedDocuments(workspaceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "You are not a member of this workspace" };
    }

    const documents = await db.document.findMany({
      where: {
        workspaceId,
        isArchived: true,
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
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: documents };
  } catch (error) {
    console.error("Error getting archived documents:", error);
    return { error: "Failed to fetch archived documents" };
  }
}
