import { prisma } from '@/lib/prisma';

export class AnalyticsService {

  static async trackEvent(
    workspaceId: string,
    eventName: string,
    eventData?: any,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        workspaceId,
        eventName,
        eventData,
        userId,
        sessionId,
      },
    });
  }

  static async getEventsByWorkspace(workspaceId: string, limit: number = 100) {
    return prisma.analyticsEvent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getEventCounts(workspaceId: string) {
    const events = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: { workspaceId },
      _count: {
        id: true,
      },
    });

    return events.map(e => ({
      eventName: e.eventName,
      count: e._count.id,
    }));
  }
}
