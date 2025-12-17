import { prisma } from '@/lib/prisma';
import type { WorkspaceRole } from '@prisma/client';

export class RBACService {

  static async getUserWorkspaceRole(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceRole | null> {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    return member?.role || null;
  }

  static async canUserAccessWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    const role = await this.getUserWorkspaceRole(userId, workspaceId);
    return role !== null;
  }

  static async canUserEditWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    const role = await this.getUserWorkspaceRole(userId, workspaceId);
    return role === 'OWNER' || role === 'COLLABORATOR';
  }

  static async canUserManageWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    const role = await this.getUserWorkspaceRole(userId, workspaceId);
    return role === 'OWNER';
  }

  static async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                ideas: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map(m => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  static async addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    inviterId: string
  ): Promise<void> {
    const canManage = await this.canUserManageWorkspace(inviterId, workspaceId);
    if (!canManage) {
      throw new Error('Unauthorized: Only workspace owners can add members');
    }

    await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }

  static async updateWorkspaceMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
    requesterId: string
  ): Promise<void> {
    const canManage = await this.canUserManageWorkspace(requesterId, workspaceId);
    if (!canManage) {
      throw new Error('Unauthorized: Only workspace owners can update member roles');
    }

    await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
      data: { role: newRole },
    });
  }

  static async removeWorkspaceMember(
    workspaceId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    const canManage = await this.canUserManageWorkspace(requesterId, workspaceId);
    if (!canManage) {
      throw new Error('Unauthorized: Only workspace owners can remove members');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
    });

    if (member?.role === 'OWNER') {
      const ownerCount = await prisma.workspaceMember.count({
        where: {
          workspaceId,
          role: 'OWNER',
        },
      });

      if (ownerCount === 1) {
        throw new Error('Cannot remove the last owner of a workspace');
      }
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUserId,
        },
      },
    });
  }
}
