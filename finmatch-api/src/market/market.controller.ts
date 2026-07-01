import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarketService } from './market.service';

@ApiTags('market')
@Controller()
export class MarketController {
  constructor(private readonly service: MarketService) {}

  @Get('market/gold')
  gold() {
    return this.service.getGoldPrices();
  }

  @Get('market/fx')
  fx() {
    return this.service.getExchangeRates();
  }

  @Get('news')
  news(@Query('limit') limit?: string) {
    return this.service.getNews(limit ? Number(limit) : 10);
  }
}
