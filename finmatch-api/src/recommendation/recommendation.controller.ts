import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecommendationService } from './recommendation.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';

@ApiTags('recommendation')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  // Public by design (matches the original UX — no login needed to try
  // it), but every call triggers real LLM requests (2 of them — summary +
  // per-product reasons), so it needs the same abuse protection as
  // /ai/chat.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post()
  recommend(@Body() dto: RecommendationRequestDto) {
    return this.service.recommend(dto);
  }
}
