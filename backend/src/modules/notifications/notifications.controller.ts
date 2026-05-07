import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateAdminNotificationDto } from './dto/create-admin-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('admin/send')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateAdminNotificationDto, @Request() req: any) {
    return this.notificationsService.createAdminNotification(dto, req.user.id);
  }

  @Get('admin/history')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  getHistory() {
    return this.notificationsService.getAdminHistory();
  }

  @Get('me')
  getMine(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
