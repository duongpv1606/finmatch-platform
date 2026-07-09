import { IsIn, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsIn(['question', 'share', 'review'])
  type: 'question' | 'share' | 'review';

  @IsString()
  @MinLength(3)
  text: string;
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  text: string;
}
