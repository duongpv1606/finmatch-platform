import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatMessageEntity } from './chat-message.entity';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: AiService,
    @InjectRepository(ChatMessageEntity)
    private readonly chatRepo: Repository<ChatMessageEntity>,
  ) {}

  // Streams plain text chunks (not SSE) — matches the frontend's
  // `res.body.getReader()` + `TextDecoder` loop in services/aiChatService.ts.
  @Post('chat')
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response) {
    const lastUserMsg = dto.messages[dto.messages.length - 1];
    if (lastUserMsg?.role === 'user') {
      await this.chatRepo.save(
        this.chatRepo.create({
          sessionId: dto.sessionId,
          role: 'user',
          content: lastUserMsg.content,
        }),
      );
    }

    let full = '';
    let headersSent = false;
    try {
      for await (const chunk of await this.ai.streamChat(dto.messages)) {
        if (!headersSent) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Transfer-Encoding', 'chunked');
          headersSent = true;
        }
        full += chunk;
        res.write(chunk);
      }
      res.end();
    } catch (err) {
      // Provider/config error (e.g. missing API key). If we already started
      // streaming, the client just sees the stream cut off; otherwise send
      // a proper JSON error so the frontend/dev can see what's wrong.
      if (!headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: (err as Error).message,
        });
      } else {
        res.end();
      }
    } finally {
      if (full) {
        await this.chatRepo.save(
          this.chatRepo.create({
            sessionId: dto.sessionId,
            role: 'assistant',
            content: full,
          }),
        );
      }
    }
  }

  @Get('chat/history')
  history(@Query('sessionId') sessionId: string) {
    return this.chatRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }
}
