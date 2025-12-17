import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import type { ArtifactType } from '@prisma/client';

export class SharingService {

  static async createShareLink(
    versionId: string,
    artifactType: ArtifactType,
    password?: string,
    expiresAt?: Date
  ): Promise<string> {
    const token = generateToken(32);
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    await prisma.shareLink.create({
      data: {
        versionId,
        token,
        artifactType,
        passwordHash,
        expiresAt,
        isActive: true,
        permissions: 'read',
      },
    });

    return token;
  }

  static async verifyShareLink(
    token: string,
    password?: string
  ): Promise<{ valid: boolean; shareLink?: any; error?: string }> {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        version: {
          include: {
            idea: true,
            intakeData: true,
            marketData: {
              include: {
                competitors: true,
                segments: true,
              },
            },
            icpData: true,
            validationTests: {
              include: {
                attachments: true,
              },
            },
            positioningData: true,
            scoreRuns: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
            overrideLogs: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shareLink) {
      return { valid: false, error: 'Share link not found' };
    }

    if (!shareLink.isActive) {
      return { valid: false, error: 'Share link has been deactivated' };
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return { valid: false, error: 'Share link has expired' };
    }

    if (shareLink.passwordHash) {
      if (!password) {
        return { valid: false, error: 'Password required' };
      }

      const isPasswordValid = await bcrypt.compare(password, shareLink.passwordHash);
      if (!isPasswordValid) {
        return { valid: false, error: 'Invalid password' };
      }
    }

    return { valid: true, shareLink };
  }

  static async deactivateShareLink(token: string): Promise<void> {
    await prisma.shareLink.update({
      where: { token },
      data: { isActive: false },
    });
  }

  static async getShareLinksForVersion(versionId: string) {
    return prisma.shareLink.findMany({
      where: { versionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
