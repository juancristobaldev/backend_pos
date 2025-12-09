// product.resolver.ts

import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { ProductService } from './product.service';
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput,
} from '../../entitys/product.entity';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => Product, { name: 'createProduct' })
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productService.create(input);
  }

  @Mutation(() => Product, { name: 'updateProduct' })
  async updateProduct(
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    const { id, ...dataToUpdate } = input;
    return this.productService.update(id, dataToUpdate as UpdateProductInput);
  }

  @Mutation(() => ID, { name: 'deleteProduct' })
  async deleteProduct(
    @Args('input') input: DeleteProductInput,
  ): Promise<string> {
    const isDeleted = await this.productService.delete(input.id);

    if (!isDeleted) {
      // El servicio devuelve false si no se encontró, lanzamos excepción GraphQL.
      throw new NotFoundException(`Product with ID ${input.id} not found.`);
    }
    return input.id;
  }

  @Query(() => [Product], { name: 'products' })
  async products(
    @Args('businessId', { type: () => ID }) businessId: string,
  ): Promise<Product[]> {
    // ⚠️ Idealmente, aquí se pasaría el contexto del usuario (userId o businessId)
    // para filtrar los productos y evitar exponer datos de otros negocios.
    return this.productService.findAll(businessId);
  }

  @Query(() => Product, { name: 'product' })
  async getProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    const product = await this.productService.findOne({ id }, {});

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }
}
