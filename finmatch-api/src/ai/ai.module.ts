import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessageEntity } from './chat-message.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessageEntity]), ProductsModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
