import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messages: MessagesService,
    private readonly users: UsersService,
  ) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: JwtPayload) {
    return this.messages.getConversations(user.sub);
  }

  @Get('thread/:userId')
  getThread(@Param('userId') partnerId: string, @CurrentUser() user: JwtPayload) {
    return this.messages.getThread(user.sub, partnerId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: JwtPayload) {
    const count = await this.messages.getTotalUnread(user.sub);
    return { count };
  }

  @Post()
  async send(@Body() dto: SendMessageDto, @CurrentUser() user: JwtPayload) {
    const full = await this.users.findById(user.sub);
    return this.messages.send(user.sub, full?.name ?? 'Người dùng', user.role, dto.toUserId, dto.text);
  }
}
