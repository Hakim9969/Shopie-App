import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule, AuthModule, UserModule, ProductModule, CartModule, PrismaModule, OrderModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
