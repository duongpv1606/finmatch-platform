import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlatformStatsService } from './platform-stats.service';

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
}
