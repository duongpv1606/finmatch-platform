import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './direct-message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage]), UsersModule],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
