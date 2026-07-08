import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .addSelect('u.refreshTokenHash')
      .where('u.email = :email', { email })
      .getOne();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    await this.repo.update(userId, { refreshTokenHash: hash ?? undefined });
  }

  async updateRole(userId: string, role: UserRole) {
    await this.repo.update(userId, { role });
  }

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    // Atomic conditional update — only deducts if enough balance, avoids a
    // race where two purchases both read "enough credits" before either
    // writes back.
    const result = await this.repo
      .createQueryBuilder()
      .update(User)
      .set({ credits: () => `credits - ${amount}` })
      .where('id = :userId AND credits >= :amount', { userId, amount })
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
