import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { TableModule } from './modules/table/table.module';
import { ChatModule } from './modules/chat/chat.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { ClientModule } from './modules/client/client.module';
import { ProductModule } from './modules/product/product.module';
import { BusinessModule } from './modules/business/business.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { FloorsModule } from './modules/floors/floors.module';
import { FloorService } from './modules/floors/floors.service';
import { join } from 'path';
import { KpiModule } from './modules/kpi/kpi.module';
import { SalesModule } from './modules/sales/sales.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  controllers: [AppController],
  providers: [AppService, FloorService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que ConfigService sea global
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({
        req,
        res, // 🔴 CLAVE
      }),
    }),
    JwtModule.register({
      global: true, // Hace que el JwtService esté disponible globalmente (opcional)
      secret: 'TU_SECRETO_SUPER_SEGURO_Y_LARGO', // ¡Cambia esto por una variable de entorno!
      signOptions: { expiresIn: '60m' }, // Token expira en 60 minutos
    }),
    AuthModule,
    UserModule,
    OrderModule,
    TableModule,
    ChatModule,
    PrismaModule,
    ClientModule,
    ProductModule,
    BusinessModule,
    FloorsModule,
    KpiModule,
    SalesModule,
    NotificationModule,
    ReviewsModule,
    PaymentModule,
  ],
})
export class AppModule {}
