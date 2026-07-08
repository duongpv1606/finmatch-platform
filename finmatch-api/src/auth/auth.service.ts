import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User, UserRole } from '../users/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Only these emails (configurable via ADMIN_EMAILS, comma-separated) may
   * ever hold the admin role. Public registration NEVER grants admin/
   * super_admin/bank directly — even if the client sends role: "admin" in
   * the request body, it's ignored unless the email is on this list. This
   * closes a real hole: RegisterDto previously let anyone self-assign any
   * role.
   */
  private isDesignatedAdmin(email: string): boolean {
    const list = (
      this.config.get<string>('ADMIN_EMAILS') ?? 'duongpv1606@gmail.com'
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return list.includes(email.toLowerCase());
  }

  private resolvePublicRole(email: string, requested?: UserRole): UserRole {
    if (this.isDesignatedAdmin(email)) return UserRole.ADMIN;
    // Self-registration can only ever become customer or sale — bank/
    // admin/super_admin must be granted manually, never chosen by the
    // person signing up.
    if (requested === UserRole.SALE) return UserRole.SALE;
    return UserRole.CUSTOMER;
  }

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      role: this.resolvePublicRole(dto.email, dto.role),
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    // Auto-promote: if this email is on the designated-admin list but the
    // existing account (created before this rule, or by any other means)
    // isn't admin yet, upgrade it now. Keeps the "one true admin email"
    // rule enforced even for accounts that already existed.
    if (this.isDesignatedAdmin(user.email) && user.role !== UserRole.ADMIN) {
      await this.users.updateRole(user.id, UserRole.ADMIN);
      user.role = UserRole.ADMIN;
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const stored = await this.users.findByEmail(payload.email); // includes hash via query builder
    if (!stored?.refreshTokenHash) throw new UnauthorizedException();

    const ok = await bcrypt.compare(refreshToken, stored.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Refresh token không hợp lệ');

    return this.issueTokens(stored);
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.users.setRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
