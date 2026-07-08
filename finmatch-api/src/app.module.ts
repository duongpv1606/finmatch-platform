import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { MarketModule } from './market/market.module';
import { AiModule } from './ai/ai.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
  ],
})
export class AppModule {}
