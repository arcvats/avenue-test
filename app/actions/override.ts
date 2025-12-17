'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function logOverride(
  versionId: string,
  warningType: string,
  reason: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    // Verify user has access
    const version = await prisma.ideaVersion.findUnique({
      where: { id: versionId },
      include: {
        idea: {
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

    if (!version || version.idea.workspace.members.length === 0) {
      throw new Error('Unauthorized');
    }

    // Check if user has edit permissions
    const member = version.idea.workspace.members[0];
    if (member.role === 'VIEWER') {
      throw new Error('Viewers cannot override gates');
    }

    // Log the override
    await prisma.overrideLog.create({
      data: {
        versionId,
        userId: session.user.id,
        warningType,
        reason,
      },
    });

    // Mark all steps as passed for override
    await prisma.stepState.updateMany({
      where: { versionId },
      data: { isGatePassed: true },
    });

    revalidatePath(`/app/ideas/${version.ideaId}/v/${versionId}/start`);

    return { success: true };
  } catch (error) {
    console.error('Error logging override:', error);
    throw error;
  }
}
