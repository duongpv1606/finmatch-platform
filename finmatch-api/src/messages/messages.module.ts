import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './direct-message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage]), UsersModule, NotificationsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
