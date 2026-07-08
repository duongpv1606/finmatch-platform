import { IsEmail, IsEnum, IsOptional, Matches, MinLength } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @MinLength(2)
  name: string;

  // Vietnamese mobile number: starts with 0, 9-10 digits total (matches
  // the 10-digit format used by all VN carriers since the 2018 migration).
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)',
  })
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class RefreshDto {
  refreshToken: string;
}
