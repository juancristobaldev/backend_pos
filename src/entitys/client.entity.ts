// client.entity.ts

import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { Client as PrismaClient } from '@prisma/client';
import { Business } from './business.entity';

// OUTPUT TYPE (La entidad que se devuelve)
@ObjectType()
export class Client implements PrismaClient {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string; // Nota: En producción, se debe excluir de los Outputs reales

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  status: string;
  @Field(() => [Business], { nullable: true })
  businesses?: Business[];
}

// INPUT PARA CREACIÓN
@InputType()
export class CreateClientInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

// INPUT PARA EDICIÓN
@InputType()
export class UpdateClientInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  status?: string;
}

// INPUT PARA ELIMINACIÓN
@InputType()
export class DeleteClientInput {
  @Field(() => ID)
  id: string;
}
