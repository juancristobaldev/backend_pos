// client.resolver.ts

import { Resolver, Mutation, Args, ID, Context, Query } from '@nestjs/graphql';
import { ClientService } from './client.service';
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
  DeleteClientInput,
  OutputClient,
} from '../../entitys/client.entity';
import {
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RoleGuard } from 'src/guards/auth/auth.guard';
import { Role, Roles } from 'src/common/decorators/roles.decorators';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => Client)
export class ClientResolver {
  constructor(
    private readonly clientService: ClientService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. MUTACIÓN: CREAR CLIENTE
  @Query(() => Client)
  @Roles(Role.Administrator) // ✔ primero Roles
  @UseGuards(RoleGuard) // ✔ luego el Guard
  async getAuthenticatedClient(@Context() ctx: any) {
    const user = ctx.req.user;
    const userEmail = user.email;
    console.log(userEmail);
    const client = await this.clientService.findByEmail(userEmail, {
      businesses: true,
    });

    return client;
  }

  @Mutation(() => OutputClient, { name: 'createClient' })
  async createClient(
    @Args('input') input: CreateClientInput,
  ): Promise<OutputClient> {
    const { name, email, password, saleToken } = input;

    return this.clientService.create({ name, email, password }, saleToken);
  }

  // 2. MUTACIÓN: ACTUALIZAR CLIENTE
  @Mutation(() => Client, { name: 'updateClient' })
  async updateClient(@Args('input') input: UpdateClientInput): Promise<Client> {
    const { id, ...dataToUpdate } = input;
    return this.clientService.update(id, dataToUpdate as UpdateClientInput);
  }

  // 3. MUTACIÓN: ELIMINAR CLIENTE
  @Mutation(() => ID, { name: 'deleteClient' })
  async deleteClient(@Args('input') input: DeleteClientInput): Promise<string> {
    const isDeleted = await this.clientService.delete(input.id);
    if (!isDeleted) {
      throw new NotFoundException(`Client with ID ${input.id} not found.`);
    }
    return input.id;
  }
}
