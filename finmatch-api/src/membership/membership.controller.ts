import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MEMBERSHIP_PLANS } from './membership-plans';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(private readonly users: UsersService) {}

  @Get('plans')
  plans() {
    return MEMBERSHIP_PLANS;
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    const full = await this.users.findById(user.sub);
    return {
      tier: full?.membershipTier ?? 'free',
      expiresAt: full?.membershipExpiresAt ?? null,
    };
  }
}
