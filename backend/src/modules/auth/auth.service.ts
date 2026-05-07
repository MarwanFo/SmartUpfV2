import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authRepository: AuthRepository,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find user with role included
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Compte suspendu ou inactif. Contactez la DSI.');
    }

    // 2. Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    // 3. Build JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      buildingId: user.buildingId ?? undefined,
    };

    // 4. Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret',
        expiresIn: '7d',
      }),
    ]);

    // 5. Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    // 6. Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        buildingId: user.buildingId,
      },
    };
  }

  async logout(refreshToken: string) {
    const token = await this.authRepository.findRefreshToken(refreshToken);
    if (!token || token.isRevoked) {
      throw new UnauthorizedException('Token invalide.');
    }
    await this.authRepository.revokeRefreshToken(refreshToken);
    return { message: 'Déconnexion sécurisée effectuée.' };
  }

  async refresh(refreshToken: string) {
    const stored = await this.authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée. Veuillez vous reconnecter.');
    }

    // Fetch user with role to ensure roleName is available
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: stored.userId },
      include: { role: true },
    });

    const payload = {
      sub: stored.user.id,
      email: stored.user.email,
      roleId: stored.user.roleId,
      roleName: userWithRole?.role?.name ?? '',
      buildingId: stored.user.buildingId ?? undefined,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret',
      expiresIn: '15m',
    });

    return { accessToken };
  }
}
