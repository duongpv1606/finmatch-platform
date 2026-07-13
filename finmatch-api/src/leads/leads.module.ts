import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), UsersModule, AiModule, NotificationsModule],
  providers: [LeadsService],
  controllers: [LeadsController],
})
export class LeadsModule {}
