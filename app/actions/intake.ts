'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GatingService } from '@/lib/services/gating';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveIntakeData(versionId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Extract form data
  const problemStatement = formData.get('problemStatement') as string;
  const targetCustomer = formData.get('targetCustomer') as string;
  const currentSolution = formData.get('currentSolution') as string;
  const proposedSolution = formData.get('proposedSolution') as string;
  const uniqueValue = formData.get('uniqueValue') as string;
  const founderExperience = formData.get('founderExperience') as string;
  const domainExpertise = formData.get('domainExpertise') as string;

  // Parse arrays
  const assumptions = formData.get('assumptions') as string;
  const assumptionsArray = assumptions ? assumptions.split('\n').filter(a => a.trim()) : [];

  const riskFactors = formData.get('riskFactors') as string;
  const riskFactorsArray = riskFactors ? riskFactors.split('\n').filter(r => r.trim()) : [];

  const relevantSkills = formData.get('relevantSkills') as string;
  const relevantSkillsArray = relevantSkills ? relevantSkills.split('\n').filter(s => s.trim()) : [];

  try {
    // Verify user has access to this version
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

    // Upsert intake data
    await prisma.intakeData.upsert({
      where: { versionId },
      update: {
        problemStatement,
        targetCustomer: targetCustomer || null,
        currentSolution: currentSolution || null,
        proposedSolution: proposedSolution || null,
        uniqueValue: uniqueValue || null,
        assumptions: assumptionsArray,
        riskFactors: riskFactorsArray,
        founderExperience: founderExperience || null,
        domainExpertise: domainExpertise || null,
        relevantSkills: relevantSkillsArray,
      },
      create: {
        versionId,
        problemStatement,
        targetCustomer: targetCustomer || null,
        currentSolution: currentSolution || null,
        proposedSolution: proposedSolution || null,
        uniqueValue: uniqueValue || null,
        assumptions: assumptionsArray,
        riskFactors: riskFactorsArray,
        founderExperience: founderExperience || null,
        domainExpertise: domainExpertise || null,
        relevantSkills: relevantSkillsArray,
      },
    });

    // Check gate
    await GatingService.checkGate(versionId, 'INTAKE');

    revalidatePath(`/app/ideas/${version.ideaId}/v/${versionId}/start`);
    redirect(`/app/ideas/${version.ideaId}/v/${versionId}/start`);
  } catch (error) {
    console.error('Error saving intake data:', error);
    throw error;
  }
}
