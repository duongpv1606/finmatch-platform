import { IsIn } from 'class-validator';
import { UserRole } from '../user.entity';

// Admins can promote/demote between ordinary roles, but NEVER grant
// admin/super_admin here — that stays locked to the designated email
// (see auth.service.ts isDesignatedAdmin), otherwise this endpoint would
// undermine that protection.
const ASSIGNABLE_ROLES = [
  UserRole.CUSTOMER,
  UserRole.SALE,
  UserRole.AGENCY,
  UserRole.BANK,
];

export class UpdateUserRoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role: UserRole;
}

