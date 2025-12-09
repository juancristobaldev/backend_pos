// product.entity.ts

import { ObjectType, Field, InputType, ID, Float } from '@nestjs/graphql';
import { Product as PrismaProduct } from '@prisma/client';

// 1. OUTPUT TYPE (Entidad 'Product')
@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  businessId: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  available: boolean;

  @Field()
  category: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// 2. INPUT PARA CREACIÓN
@InputType()
export class CreateProductInput {
  @Field(() => ID)
  businessId: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  available: boolean;

  @Field()
  category: string;
}

// 3. INPUT PARA EDICIÓN
@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  available?: boolean;

  @Field({ nullable: true })
  category?: string;
}

// 4. INPUT PARA ELIMINACIÓN
@InputType()
export class DeleteProductInput {
  @Field(() => ID)
  id: string;
}
