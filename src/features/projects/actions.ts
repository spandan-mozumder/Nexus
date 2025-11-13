"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(10)
    .toUpperCase(),
  description: z.string().optional(),
  workspaceId: z.string(),
});

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  projectId: z.string(),
  type: z.enum(["TASK", "BUG", "STORY", "EPIC", "FEATURE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
});

const updateIssueSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  type: z.enum(["TASK", "BUG", "STORY", "EPIC", "FEATURE"]).optional(),
  assigneeId: z.string().optional(),
  sprintId: z.string().optional(),
  dueDate: z.string().optional(),
});

const createSprintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  projectId: z.string(),
  goal: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

const idSchema = z.object({
  id: z.string(),
});

export async function createProject(data: z.infer<typeof createProjectSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createProjectSchema.parse(data);

    const workspace = await db.workspace.findUnique({
      where: { id: validatedData.workspaceId },
      select: {
        id: true,
        slug: true,
        members: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!workspace || workspace.members.length === 0) {
      return { error: "You are not a member of this workspace" };
    }

    const existingProject = await db.project.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        key: validatedData.key,
      },
    });

    if (existingProject) {
      return { error: "Project key already exists in this workspace" };
    }

    const result = await db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: validatedData.name,
          key: validatedData.key,
          description: validatedData.description,
          workspaceId: validatedData.workspaceId,
          createdById: session.user.id,
        },
      });

      const defaultChannel = await tx.channel.create({
        data: {
          name: `${project.key.toLowerCase()}-general`,
          description: `General discussion for ${project.name}`,
          workspaceId: validatedData.workspaceId,
          projectId: project.id,
          createdById: session.user.id,
        },
      });

      await tx.channelMember.create({
        data: {
          channelId: defaultChannel.id,
          userId: session.user.id,
        },
      });

      return project;
    });

    const project = result;

    await db.activityLog.create({
      data: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
        action: "CREATED",
        entityType: "PROJECT",
        entityId: project.id,
        metadata: { message: `Created project "${project.name}"` },
      },
    });

    revalidatePath(`/workspace/${validatedData.workspaceId}/projects`);
    revalidateTag(`projects-${workspace.slug}`);

    return { success: true, data: project };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating project:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateProject(data: z.infer<typeof updateProjectSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateProjectSchema.parse(data);

    const project = await db.project.findFirst({
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

    if (!project || project.workspace.members.length === 0) {
      return { error: "Project not found or access denied" };
    }

    const { id, ...updateData } = validatedData;
    const updatedProject = await db.project.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath(`/workspace/${project.workspaceId}/projects`);
    revalidatePath(
      `/workspace/${project.workspaceId}/projects/${validatedData.id}`,
    );

    return { success: true, data: updatedProject };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating project:", error);
    return { error: "Failed to update project" };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const project = await db.project.findFirst({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!project || project.workspace.members.length === 0) {
      return { error: "Project not found or access denied" };
    }

    if (project.isDefault) {
      return { error: "Cannot delete the default project" };
    }

    const userProjectMember = project.members[0];
    if (!userProjectMember || userProjectMember.role !== "ADMIN") {
      return { error: "Only project admins can delete projects" };
    }

    await db.project.delete({
      where: { id: projectId },
    });

    revalidatePath(`/workspace/${project.workspaceId}/projects`);

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "Failed to delete project" };
  }
}

export async function getWorkspaceProjects(workspaceSlug: string) {
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

    const projects = await db.project.findMany({
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
            issues: true,
            sprints: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: projects, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting projects:", error);
    return { error: "Failed to fetch projects" };
  }
}

export async function getProjectById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const project = await db.project.findFirst({
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
        sprints: {
          orderBy: { startDate: "desc" },
          include: {
            _count: {
              select: { issues: true },
            },
          },
        },
        issues: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            sprint: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project || project.workspace.members.length === 0) {
      return { error: "Project not found or access denied" };
    }

    return { success: true, data: project };
  } catch (error) {
    console.error("Error getting project:", error);
    return { error: "Failed to fetch project" };
  }
}

export async function getProjectIssues(projectId: string) {
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

    const issues = await db.issue.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        type: true,
        createdAt: true,
        dueDate: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: issues };
  } catch (error) {
    console.error("Error getting project issues:", error);
    return { error: "Failed to fetch project issues" };
  }
}

export async function createIssue(data: z.infer<typeof createIssueSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createIssueSchema.parse(data);

    const project = await db.project.findFirst({
      where: { id: validatedData.projectId },
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

    if (!project || project.workspace.members.length === 0) {
      return { error: "Project not found or access denied" };
    }

    const maxPosition = await db.issue.aggregate({
      where: { projectId: validatedData.projectId },
      _max: { position: true },
    });

    const issue = await db.issue.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        workspaceId: project.workspaceId,
        projectId: validatedData.projectId,
        type: validatedData.type,
        priority: validatedData.priority || "MEDIUM",
        status: validatedData.status || "TODO",
        reporterId: session.user.id,
        assigneeId: validatedData.assigneeId,
        sprintId: validatedData.sprintId,
        position: (maxPosition._max.position || 0) + 1,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: project.workspaceId,
        userId: session.user.id,
        action: "CREATED",
        entityType: "ISSUE",
        entityId: issue.id,
        metadata: { message: `Created issue "${issue.title}"` },
      },
    });

    revalidatePath(
      `/workspace/${project.workspaceId}/projects/${validatedData.projectId}`,
    );

    return { success: true, data: issue };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating issue:", error);
    return { error: "Failed to create issue" };
  }
}

export async function updateIssue(data: z.infer<typeof updateIssueSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateIssueSchema.parse(data);

    const issue = await db.issue.findFirst({
      where: { id: validatedData.id },
      include: {
        project: {
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

    if (!issue || issue.project.workspace.members.length === 0) {
      return { error: "Issue not found or access denied" };
    }

    const { id, ...updateData } = validatedData;

    const dataToUpdate: any = { ...updateData };
    if (updateData.dueDate) {
      dataToUpdate.dueDate = new Date(updateData.dueDate);
    }

    const updatedIssue = await db.issue.update({
      where: { id: validatedData.id },
      data: dataToUpdate,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    revalidatePath(
      `/workspace/${issue.project.workspaceId}/projects/${issue.projectId}`,
    );

    return { success: true, data: updatedIssue };
  } catch (error) {
    console.error("Error updating issue:", error);
    return { error: "Failed to update issue" };
  }
}

export async function deleteIssue(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const issue = await db.issue.findFirst({
      where: { id: validatedData.id },
      include: {
        project: {
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

    if (!issue || issue.project.workspace.members.length === 0) {
      return { error: "Issue not found or access denied" };
    }

    if (issue.project.createdById !== session.user.id) {
      return { error: "Only the project creator can delete issues" };
    }

    await db.issue.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(
      `/workspace/${issue.project.workspaceId}/projects/${issue.projectId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting issue:", error);
    return { error: "Failed to delete issue" };
  }
}

export async function createSprint(data: z.infer<typeof createSprintSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createSprintSchema.parse(data);

    const project = await db.project.findFirst({
      where: { id: validatedData.projectId },
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

    if (!project || project.workspace.members.length === 0) {
      return { error: "Project not found or access denied" };
    }

    const sprint = await db.sprint.create({
      data: {
        name: validatedData.name,
        goal: validatedData.goal,
        projectId: validatedData.projectId,
        status: "PLANNING",
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    });

    revalidatePath(
      `/workspace/${project.workspaceId}/projects/${validatedData.projectId}`,
    );

    return { success: true, data: sprint };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating sprint:", error);
    return { error: "Failed to create sprint" };
  }
}

export async function updateSprintStatus(
  sprintId: string,
  status: "PLANNING" | "ACTIVE" | "COMPLETED",
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const sprint = await db.sprint.findFirst({
      where: { id: sprintId },
      include: {
        project: {
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

    if (!sprint || sprint.project.workspace.members.length === 0) {
      return { error: "Sprint not found or access denied" };
    }

    const updateData: any = { status };
    if (status === "ACTIVE" && !sprint.startDate) {
      updateData.startDate = new Date();
    }
    if (status === "COMPLETED" && !sprint.endDate) {
      updateData.endDate = new Date();
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: updateData,
    });

    revalidatePath(
      `/workspace/${sprint.project.workspaceId}/projects/${sprint.projectId}`,
    );

    return { success: true, data: updatedSprint };
  } catch (error) {
    console.error("Error updating sprint status:", error);
    return { error: "Failed to update sprint status" };
  }
}

const addProjectMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional().default("MEMBER"),
});

const removeProjectMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
});

export async function addProjectMember(
  data: z.infer<typeof addProjectMemberSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = addProjectMemberSchema.parse(data);

    const currentUserMember = await db.projectMember.findFirst({
      where: {
        projectId: validatedData.projectId,
        userId: session.user.id,
        role: "ADMIN",
      },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!currentUserMember) {
      return { error: "You must be a project admin to add members" };
    }

    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: currentUserMember.project.workspaceId,
        userId: validatedData.userId,
      },
    });

    if (!workspaceMember) {
      return { error: "User is not a member of this workspace" };
    }

    const existingMember = await db.projectMember.findFirst({
      where: {
        projectId: validatedData.projectId,
        userId: validatedData.userId,
      },
    });

    if (existingMember) {
      return { error: "User is already a project member" };
    }

    const projectMember = await db.projectMember.create({
      data: {
        projectId: validatedData.projectId,
        userId: validatedData.userId,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    revalidatePath(
      `/workspace/${currentUserMember.project.workspaceId}/projects/${validatedData.projectId}`,
    );

    return { success: true, data: projectMember };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error adding project member:", error);
    return { error: "Failed to add project member" };
  }
}

export async function removeProjectMember(
  data: z.infer<typeof removeProjectMemberSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = removeProjectMemberSchema.parse(data);

    const currentUserMember = await db.projectMember.findFirst({
      where: {
        projectId: validatedData.projectId,
        userId: session.user.id,
        role: "ADMIN",
      },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!currentUserMember) {
      return { error: "You must be a project admin to remove members" };
    }

    if (validatedData.userId === session.user.id) {
      const adminCount = await db.projectMember.count({
        where: {
          projectId: validatedData.projectId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return { error: "Cannot remove the last admin from the project" };
      }
    }

    await db.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
        },
      },
    });

    revalidatePath(
      `/workspace/${currentUserMember.project.workspaceId}/projects/${validatedData.projectId}`,
    );

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error removing project member:", error);
    return { error: "Failed to remove project member" };
  }
}

export async function getProjectMembers(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, data: [], error: "Unauthorized" };
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return {
        success: false,
        data: [],
        error: "You don't have access to this project",
      };
    }

    const members = await db.projectMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return { success: true, data: members };
  } catch (error) {
    console.error("Error getting project members:", error);
    return { success: false, data: [], error: "Failed to get project members" };
  }
}

export async function getWorkspaceMembers(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, data: [], error: "Unauthorized" };
    }

    const project = await db.project.findFirst({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return { success: false, data: [], error: "Project not found" };
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return {
        success: false,
        data: [],
        error: "You don't have access to this project",
      };
    }

    const existingProjectMemberIds = await db.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    });

    const existingIds = existingProjectMemberIds.map((m) => m.userId);
    const availableMembers = project.workspace.members.filter(
      (member) => !existingIds.includes(member.userId),
    );

    return { success: true, data: availableMembers };
  } catch (error) {
    console.error("Error getting workspace members:", error);
    return {
      success: false,
      data: [],
      error: "Failed to get workspace members",
    };
  }
}
