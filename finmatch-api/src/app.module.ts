import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { MarketModule } from './market/market.module';
import { AiModule } from './ai/ai.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { LeadsModule } from './leads/leads.module';
import { MembershipModule } from './membership/membership.module';
import { PaymentsModule } from './payments/payments.module';
import { CommunityModule } from './community/community.module';
import { MessagesModule } from './messages/messages.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    // Global default rate limit — generous enough for normal browsing
    // (product lists, AI chat, etc.) but stops naive scripted abuse.
    // Sensitive endpoints (login/register) set a stricter limit inline
    // via @Throttle() — see auth.controller.ts.
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minute window
        limit: 120, // 120 requests / minute / IP
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'finmatch'),
        autoLoadEntities: true,
        // Forced true — see Railway deploy notes: NODE_ENV wasn't reliably
        // absent on the host, which skipped table creation. Switch to real
        // migrations before this app has production data worth protecting.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    MarketModule,
    AiModule,
    RecommendationModule,
    LeadsModule,
    MembershipModule,
    PaymentsModule,
    CommunityModule,
    MessagesModule,
    UploadModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
