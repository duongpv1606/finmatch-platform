import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CommunityService } from './community.service';
import { CreateCommentDto, CreatePostDto } from './dto/community.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(
    private readonly community: CommunityService,
    private readonly users: UsersService,
  ) {}

  // Public — anyone can read the community, matching the original's
  // "browse without login, must log in to post/comment" UX.
  @Get('posts')
  async findAll(@Req() req: Request) {
    // Best-effort: if a valid token happens to be present, use it to mark
    // `likedByMe` correctly; otherwise just show public data. Not guarded
    // because reading posts must not require login.
    const auth = req.headers.authorization;
    let userId: string | undefined;
    if (auth?.startsWith('Bearer ')) {
      try {
        const payload = JSON.parse(
          Buffer.from(auth.split('.')[1] ?? '', 'base64').toString('utf-8'),
        );
        userId = payload.sub;
      } catch {
        /* not a valid token — treat as anonymous, no big deal for a public read */
      }
    }
    return this.community.findAll(userId);
  }

  @Get('top-members')
  topMembers() {
    return this.community.getTopMembers();
  }

  @Get('hot-topics')
  hotTopics() {
    return this.community.getHotTopics();
  }

  @Get('ai-summary')
  aiSummary() {
    return this.community.getAiSummary().then((summary) => ({ summary }));
  }

  @Post('posts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() dto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    const full = await this.users.findById(user.sub);
    return this.community.createPost(user.sub, full?.name ?? 'Người dùng', user.role, dto);
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const full = await this.users.findById(user.sub);
    return this.community.addComment(id, user.sub, full?.name ?? 'Người dùng', user.role, dto);
  }

  @Post('posts/:id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.community.toggleLike(id, user.sub);
  }
}
