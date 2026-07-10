import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformStatsService } from './platform-stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('platform')
@Controller('platform')
export class PlatformStatsController {
  constructor(private readonly stats: PlatformStatsService) {}

  @Get('stats')
  getStats() {
    return this.stats.getStats();
  }

  @Get('partner-logos')
  getPartnerLogos() {
    return this.stats.getPartnerLogos();
  }

  @Get('admin-overview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAdminOverview() {
    return this.stats.getAdminOverview();
  }

  @Get('ai-overview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAiOverview() {
    return this.stats.getAiOverview();
  }
}
