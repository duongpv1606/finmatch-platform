import { IsArray } from 'class-validator';

export class ExtractProfileDto {
  @IsArray()
  messages: { role: 'user' | 'assistant'; content: string }[];
}
