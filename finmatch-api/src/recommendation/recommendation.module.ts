import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { AiModule } from '../ai/ai.module';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [ProductsModule, AiModule],
  providers: [RecommendationService],
  controllers: [RecommendationController],
})
export class RecommendationModule {}
