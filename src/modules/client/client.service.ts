import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  CreateClientInput,
  OutputClient,
  UpdateClientInput,
} from 'src/entitys/client.entity';
import { GraphQLError } from 'graphql';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  /* =====================================================
     Buscar cliente por email
  ===================================================== */
  async findByEmail(
    email: string,
    include?: Prisma.ClientInclude | {},
  ): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: { email }, include });
  }

  /* =====================================================
     CREAR CLIENTE (POST PAGO)
  ===================================================== */
  async create(
    input: {name:string,email:string,password:string},
    saleToken: string,
  ): Promise<OutputClient> {
    try {
      const { name, email, password } = input;
  
      /**
       * 1️⃣ Buscar PaymentIntent por token de venta
       */
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id: saleToken },
      });
  
      if (!paymentIntent) {
        return {
          success: false,
          errors: 'VENTA_NO_EXISTE',
        };
      }
  
      /**
       * 2️⃣ Validaciones del estado del pago
       */
      if (paymentIntent.status === 'CONSUMED') {
        return {
          success: false,
          errors: 'VENTA_YA_UTILIZADA',
        };
      }
  
      if (paymentIntent.status !== 'PAID') {
        return {
          success: false,
          errors: 'PAGO_NO_APROBADO',
        };
      }
  
      /**
       * 3️⃣ Validar que el email coincida con el pago
       */
      if (paymentIntent.clientEmail !== email) {
        return {
          success: false,
          errors: 'EMAIL_NO_COINCIDE_CON_PAGO',
        };
      }
  
      /**
       * 4️⃣ Verificar si el cliente ya existe
       */
      const existingClient = await this.prisma.client.findFirst({
        where: { email },
      });
  
      if (existingClient) {
        return {
          success: false,
          errors: 'USUARIO_YA_EXISTE',
        };
      }
  
      /**
       * 5️⃣ Crear cliente
       */
      const hashedPassword = await this.authService.hashPassword(password);
  
      const newClient = await this.prisma.client.create({
        data: {
          name,
          email,
          password: hashedPassword,
          status: 'Active',
        },
      });
  
      /**
       * 6️⃣ Marcar el PaymentIntent como CONSUMED
       */
      await this.prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: {
          status: 'CONSUMED',
        },
      });
  
      /**
       * 7️⃣ Respuesta
       */
      return {
        success: true,
        client: newClient,
      };
    } catch (e) {
      throw new GraphQLError(e.message);
    }
  }
  
  /* =====================================================
     ACTUALIZAR CLIENTE
  ===================================================== */
  async update(id: string, input: UpdateClientInput): Promise<Client> {
    const dataToUpdate: any = { ...input };

    if (input.password) {
      dataToUpdate.password = await this.authService.hashPassword(
        input.password,
      );
    }

    try {
      return await this.prisma.client.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found.`);
      }
      throw error;
    }
  }

  /* =====================================================
     ELIMINAR CLIENTE
  ===================================================== */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.client.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error.code === 'P2025') return false;
      throw error;
    }
  }
}
