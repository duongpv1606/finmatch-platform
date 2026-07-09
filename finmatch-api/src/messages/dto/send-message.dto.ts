import { IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  toUserId: string;

  @IsString()
  @MinLength(1)
  text: string;
}
