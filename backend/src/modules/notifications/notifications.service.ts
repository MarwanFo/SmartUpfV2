import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdminNotificationDto, TargetScope } from './dto/create-admin-notification.dto';
import { NotifType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway
  ) {}

  async createAdminNotification(dto: CreateAdminNotificationDto, authorId: string) {
    let targetUserIds: string[] = [];

    // 1. Determine targets based on scope
    if (dto.targetScope === TargetScope.ALL) {
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true }
      });
      targetUserIds = users.map(u => u.id);
    } 
    else if (dto.targetScope === TargetScope.ROLE && dto.targetIds) {
      const users = await this.prisma.user.findMany({
        where: { 
          role: { name: { in: dto.targetIds } },
          status: 'ACTIVE'
        },
        select: { id: true }
      });
      targetUserIds = users.map(u => u.id);
    }
    else if (dto.targetScope === TargetScope.BUILDING && dto.targetIds) {
      const users = await this.prisma.user.findMany({
        where: { 
          buildingId: { in: dto.targetIds },
          status: 'ACTIVE'
        },
        select: { id: true }
      });
      targetUserIds = users.map(u => u.id);
    }
    else if (dto.targetScope === TargetScope.PROGRAM && dto.targetIds) {
      // Find students in these programs
      const students = await this.prisma.studentProfile.findMany({
        where: { programId: { in: dto.targetIds } },
        select: { userId: true }
      });
      targetUserIds = students.map(s => s.userId);
    }

    // 2. Bulk create notifications in DB
    const notifications = await Promise.all(
      targetUserIds.map(userId => 
        this.prisma.notification.create({
          data: {
            userId,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            metadata: { 
              authorId, 
              targetScope: dto.targetScope,
              targetIds: dto.targetIds
            }
          }
        })
      )
    );

    // 3. Emit real-time notifications
    notifications.forEach(n => {
      this.notificationsGateway.sendNotificationToUser(n.userId, n);
    });

    this.logger.log(`Admin ${authorId} sent notification "${dto.title}" to ${targetUserIds.length} users.`);
    
    return {
      count: targetUserIds.length,
      success: true
    };
  }

  async getAdminHistory() {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const uniqueBatches = [];
    const seen = new Set();

    for (const n of notifications) {
      const meta = n.metadata as any;
      if (meta?.authorId) {
        const key = `${n.title}-${n.body}-${n.createdAt.getTime()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueBatches.push({
            ...n,
            targetScope: meta.targetScope,
            targetIds: meta.targetIds
          });
        }
      }
    }

    return uniqueBatches;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
