// user.entity.ts
import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { User as PrismaUser } from '@prisma/client';

@ObjectType()
export class User implements PrismaUser {
  @Field(() => ID)
  id: string;
  @Field(() => ID)
  businessId: string; // ID del negocio al que pertenece
  @Field()
  name: string;
  @Field()
  email: string;
  @Field({ nullable: true })
  password: string; // Nota: En una app real, nunca se debe devolver el password.
  @Field()
  role: string;
  @Field(() => Date, { nullable: true })
  lastLogin: Date | null;
  @Field()
  status: string;
  @Field(() => Date, { nullable: true })
  createdAt: Date; // Opcional en TypeScript
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  // No incluimos 'business', 'orders', etc., aquí, a menos que se definan sus Resolvers
}

// --------------------------------------------------------
// 2. INPUT TYPES (Datos de entrada para las Mutaciones)
// --------------------------------------------------------

@InputType()
export class CreateUserInput {
  @Field(() => ID)
  businessId: string; // Requerido para crear el usuario

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  role: string;

  // NOTA: 'status' y 'lastLogin' se gestionan generalmente en el Service
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  id: string; // ID es necesario para el 'where' en la actualización

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string; // Permite actualizar el estado (e.g., 'Inactive')
}

// Input simple para la eliminación, solo necesita el ID
@InputType()
export class DeleteUserInput {
  @Field(() => ID)
  id: string;
}
