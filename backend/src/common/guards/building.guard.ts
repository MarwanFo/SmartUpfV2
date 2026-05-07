import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BUILDING_SCOPED_KEY } from '../decorators/building.decorator';

@Injectable()
export class BuildingGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isBuildingScoped = this.reflector.getAllAndOverride<boolean>(BUILDING_SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isBuildingScoped) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins bypass building isolation
    if (user?.roleName === 'SUPER_ADMIN') {
      return true;
    }

    if (!user?.buildingId) {
      throw new ForbiddenException('User is not assigned to a building');
    }

    // Inject buildingId into the request for downstream use
    request.buildingId = user.buildingId;
    return true;
  }
}
