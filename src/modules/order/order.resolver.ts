// order.resolver.ts

import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  DeleteOrderInput,
  // OrderItem y otras entidades relacionadas (si se necesitan queries específicas)
} from '../../entitys/order.entity';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { ProductService } from '../product/product.service';
// Asume que tienes un tipo de contexto o AuthGuard para obtener el businessId
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService, // Servicio para obtener businessId si no está en el contexto
  ) {}

  // =========================================================
  // MUTATIONS
  // =========================================================

  // 1. CREAR PEDIDO
  /**
   * Crea un nuevo pedido con ítems. Asume que el businessId se obtiene del contexto.
   * Por simplicidad, aquí simulamos el businessId. En un proyecto real, usarías @CurrentUser.
   * @param input Datos del pedido (mesa, usuario, ítems, etc.).
   * @returns El objeto Order recién creado.
   */
  @Mutation(() => Order, { name: 'createOrder' })
  async createOrder(
    @Args('input') input: CreateOrderInput,
    // @CurrentUser('businessId') businessId: string, // Idealmente se obtiene del usuario autenticado
  ): Promise<Order> {
    // --- Lógica de negocio simulada para obtener el BusinessId ---
    // En una aplicación real, el businessId se obtendría del usuario logueado o del contexto.
    // Aquí, lo inferimos temporalmente de uno de los productos para la simulación:
    if (input.items.length === 0) {
      throw new NotFoundException(`Order must contain at least one item.`);
    }
    // Asume que todos los productos pertenecen al mismo negocio.
    const productCheck = await this.productService.findOne(
      {
        id: input.items[0].productId,
      },
      {},
    );

    if (!productCheck) {
      throw new NotFoundException(
        `Product with ID ${input.items[0].productId} not found.`,
      );
    }
    const businessId = productCheck.businessId;
    // -----------------------------------------------------------

    return await this.orderService.create(input, businessId);
  }

  // 2. ACTUALIZAR ESTADO DE PEDIDO
  /**
   * Cambia el estado de un pedido y registra el cambio en el historial.
   * @param input ID del pedido, nuevo estado y ID del usuario.
   * @returns El objeto Order actualizado.
   */
  @Mutation(() => Order, { name: 'updateOrderStatus' })
  async updateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<Order> {
    try {
      return await this.orderService.updateStatus(input);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // 3. ELIMINAR PEDIDO
  /**
   * Elimina un pedido por su ID.
   * @param input El ID del pedido a eliminar.
   * @returns El ID (String) del pedido eliminado.
   */
  @Mutation(() => ID, { name: 'deleteOrder' })
  async deleteOrder(@Args('input') input: DeleteOrderInput): Promise<string> {
    const isDeleted = await this.orderService.delete(input.id);

    if (!isDeleted) {
      throw new NotFoundException(`Order with ID ${input.id} not found.`);
    }
    return input.id;
  }

  // =========================================================
  // QUERIES (Ejemplos básicos)
  // =========================================================

  // 1. OBTENER PEDIDO POR ID
  @Query(() => Order, { name: 'order' })
  async getOrder(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    // Nota: Necesitas añadir el método findOne en OrderService
    const order = await this.orderService.findOne(
      {
        id,
      },
      { items: true },
    );

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }

  // 2. OBTENER TODOS LOS PEDIDOS (filtrar por negocio en la implementación real)
  @Query(() => [Order], { name: 'allOrders' })
  async getAllOrders(@Args('tableId') tableId: string): Promise<Order[] | []> {
    // Nota: Necesitas añadir el método findAll en OrderService
    return await this.orderService.findAll(
      { tableId },
      {
        items: true,
      },
    );
  }
}
