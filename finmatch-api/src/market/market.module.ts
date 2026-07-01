import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldPrice } from './gold-price.entity';
import { ExchangeRate } from './exchange-rate.entity';
import { NewsArticle } from './news-article.entity';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GoldPrice, ExchangeRate, NewsArticle])],
  providers: [MarketService],
  controllers: [MarketController],
})
export class MarketModule {}
