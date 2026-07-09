import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityPost } from './community-post.entity';
import { CommunityComment } from './community-comment.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityPost, CommunityComment, CommunityPostLike]),
    UsersModule,
    AiModule,
  ],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
