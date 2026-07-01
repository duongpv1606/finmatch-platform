import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AnthropicProvider,
  ChatTurn,
  FINANCE_SYSTEM_PROMPT,
  GeminiProvider,
  OpenAIProvider,
} from './ai-providers';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  private getProvider(): AIProvider {
    const providerName = this.config.get<string>('AI_PROVIDER', 'openai');

    try {
      switch (providerName) {
        case 'anthropic':
          return new AnthropicProvider(
            this.config.getOrThrow<string>('ANTHROPIC_API_KEY'),
          );
        case 'gemini':
          return new GeminiProvider(this.config.getOrThrow<string>('GOOGLE_API_KEY'));
        default:
          return new OpenAIProvider(this.config.getOrThrow<string>('OPENAI_API_KEY'));
      }
    } catch {
      throw new InternalServerErrorException(
        `Chưa cấu hình API key cho AI_PROVIDER=${providerName}. ` +
          'Thêm OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_API_KEY vào .env.',
      );
    }
  }

  streamChat(messages: ChatTurn[]) {
    return this.getProvider().streamChat(messages, FINANCE_SYSTEM_PROMPT);
  }
}
