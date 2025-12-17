'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWorkspace(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;

  if (!name || name.length < 1) {
    return { error: 'Workspace name is required' };
  }

  const slug = generateSlug(name);

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString(36)}`, // Add timestamp to ensure uniqueness
        plan: 'FREE',
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
    });

    revalidatePath('/app');
    redirect('/app');
  } catch (error) {
    console.error('Error creating workspace:', error);
    return { error: 'Failed to create workspace' };
  }
}

export async function createIdea(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const workspaceId = formData.get('workspaceId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name || name.length < 1) {
    return { error: 'Idea name is required' };
  }

  if (!workspaceId) {
    return { error: 'Workspace ID is required' };
  }

  try {
    // Verify user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member || member.role === 'VIEWER') {
      return { error: 'Unauthorized' };
    }

    const idea = await prisma.idea.create({
      data: {
        workspaceId,
        name,
        description: description || null,
        versions: {
          create: {
            versionNumber: 1,
            label: 'Initial validation',
            flowMode: 'NORMAL',
            persona: 'SOLO_FOUNDER',
            status: 'DRAFT',
            stepStates: {
              createMany: {
                data: [
                  { step: 'INTAKE', isGatePassed: false },
                  { step: 'MARKET', isGatePassed: false },
                  { step: 'ICP', isGatePassed: false },
                  { step: 'VALIDATION', isGatePassed: false },
                  { step: 'POSITIONING', isGatePassed: false },
                  { step: 'SUMMARY', isGatePassed: false },
                ],
              },
            },
          },
        },
      },
    });

    revalidatePath('/app');
    redirect(`/app/ideas/${idea.id}`);
  } catch (error) {
    console.error('Error creating idea:', error);
    return { error: 'Failed to create idea' };
  }
}
