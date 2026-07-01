import { IsArray, IsOptional, IsString } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  sessionId: string;

  @IsArray()
  messages: { role: 'user' | 'assistant'; content: string }[];

  @IsOptional()
  @IsString()
  provider?: 'openai' | 'anthropic' | 'gemini';
}
