import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSuperAdminDashboardStats() {
    // Count all users grouped by their role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      _count: {
        id: true,
      },
    });

    // Get roles mapping
    const roles = await this.prisma.role.findMany();
    const roleMap = new Map(roles.map(r => [r.id, r.name]));

    let students = 0;
    let professors = 0;
    let staff = 0;

    for (const group of usersByRole) {
      const roleName = roleMap.get(group.roleId);
      if (roleName === 'ETUDIANT') students += group._count.id;
      else if (roleName === 'PROFESSEUR') professors += group._count.id;
      else if (['SUPER_ADMIN', 'ADMIN_ETABLISSEMENT', 'STAFF_SCOLARITE'].includes(roleName || '')) staff += group._count.id;
    }

    const buildingsCount = await this.prisma.building.count({
      where: { isActive: true },
    });

    // Get recent 5 active users
    const recentLogins = await this.prisma.user.findMany({
      where: { lastLoginAt: { not: null } },
      orderBy: { lastLoginAt: 'desc' },
      take: 5,
      include: { role: true },
    });

    return {
      counts: {
        students,
        professors,
        staff,
        buildings: buildingsCount,
      },
      recentActivity: recentLogins.map(user => ({
        id: user.id,
        user: `${user.firstName} ${user.lastName}`,
        role: user.role.name,
        action: 'Connexion au portail',
        date: user.lastLoginAt,
      })),
    };
  }
}
