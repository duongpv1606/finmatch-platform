import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MembershipController],
})
export class MembershipModule {}
