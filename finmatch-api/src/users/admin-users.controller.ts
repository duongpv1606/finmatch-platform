import { Body, Controller, ForbiddenException, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './user.entity';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async findAll() {
    const list = await this.users.findAll();
    // passwordHash/refreshTokenHash are select:false on the entity already,
    // so a plain find() here never returns them — safe to send as-is.
    return list;
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    const user = await this.users.findById(id);
    if (!user) throw new ForbiddenException('Không tìm thấy người dùng');
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Không thể đổi quyền của tài khoản Admin qua đây');
    }
    await this.users.updateRole(id, dto.role);
    return this.users.findById(id);
  }
}
