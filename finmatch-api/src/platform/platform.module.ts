import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Lead } from '../leads/lead.entity';
import { ChatMessageEntity } from '../ai/chat-message.entity';
import { PlatformStatsService } from './platform-stats.service';
import { PlatformStatsController } from './platform-stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Lead, ChatMessageEntity])],
  providers: [PlatformStatsService],
  controllers: [PlatformStatsController],
})
export class PlatformModule {}
