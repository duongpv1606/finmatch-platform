import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

@ApiTags('recommendation')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Post()
  recommend(@Body() dto: RecommendationRequestDto) {
    return this.service.recommend(dto);
  }
}
