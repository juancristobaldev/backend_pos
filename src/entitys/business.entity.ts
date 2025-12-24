import { ObjectType, Field, InputType, ID, Float, Int } from '@nestjs/graphql';
import { Business as PrismaBusiness } from '@prisma/client';
import { Floor } from './floor.entity';

// 1. OUTPUT TYPE (Lo que devuelve la API)
@ObjectType()
export class Business {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  clientId: string;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  phone: string;

  @Field()
  currency: string;

  @Field(() => Float)
  taxRate: number;

  @Field(() => Int)
  maxTables: number;

  @Field(() => [Floor])
  floors: Floor[];
  @Field(() => String, { nullable: true })
  theme?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field()
  status: string;
}

// 2. INPUT PARA CREACIÓN
@InputType()
export class CreateBusinessInput {
  @Field()
  name: string;

  @Field() // Asumimos que clientId viene del Context/JWT, no del input manual
  address: string;

  @Field()
  phone: string;

  @Field(() => String, { nullable: true })
  theme?: string | null;
}

// 3. INPUT PARA EDICIÓN
@InputType()
export class UpdateBusinessInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field(() => Int, { nullable: true })
  maxTables?: number;

  @Field(() => String, { nullable: true })
  theme?: string | null;

  @Field({ nullable: true })
  status?: string;
}

// 4. INPUT PARA ELIMINACIÓN
@InputType()
export class DeleteBusinessInput {
  @Field(() => ID)
  id: string;
}
