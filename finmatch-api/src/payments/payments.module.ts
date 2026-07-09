import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { VnpayService } from './vnpay.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [StripeService, VnpayService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
