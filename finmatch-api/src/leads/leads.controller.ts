import { Body, Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadCrmDto } from './dto/update-lead-crm.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UserRole } from '../users/user.entity';

const SALE_ROLES = [UserRole.SALE, UserRole.AGENCY, UserRole.BANK, UserRole.ADMIN, UserRole.SUPER_ADMIN];

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  // Public — the AI chat flow calls this the moment it captures a
  // name+phone, no login required (matches the original's anonymous
  // lead-capture UX).
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Get('marketplace')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  marketplace() {
    return this.leads.findAvailable();
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  mine(@CurrentUser() user: JwtPayload) {
    return this.leads.findMine(user.sub);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  stats(@CurrentUser() user: JwtPayload) {
    return this.leads.getSaleStats(user.sub);
  }

  @Post(':id/purchase')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  purchase(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.leads.purchase(id, user.sub);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  updateCrm(
    @Param('id') id: string,
    @Body() dto: UpdateLeadCrmDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leads.updateCrm(id, user.sub, dto);
  }

  @Post(':id/content/:type')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SALE_ROLES)
  generateContent(
    @Param('id') id: string,
    @Param('type') type: 'sms' | 'email' | 'zalo' | 'call',
    @CurrentUser() user: JwtPayload,
  ) {
    return this.leads.generateContent(id, user.sub, type).then((content) => ({ content }));
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  allForAdmin() {
    return this.leads.findAllForAdmin();
  }
}
