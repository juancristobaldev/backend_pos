import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResolver } from './client.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // 👈 aquí se importa el módulo correcto
  providers: [ClientService, ClientResolver], // 👈 solo providers locales
  exports: [ClientService], // opcional, por si otro módulo lo necesita
})
export class ClientModule {}
