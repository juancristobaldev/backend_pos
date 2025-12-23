import {
  Resolver,
  Mutation,
  Args,
  ID,
  Query,
} from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { ProductService } from '../product/product.service';
import { Table } from 'src/entitys/table.entity';
import {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  DeleteOrderInput,
  UpdateOrderItemsInput,
} from '../../entitys/order.entity';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  @Mutation(() => Table)
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Table> {
    if (!input.items.length)
      throw new NotFoundException('Order must contain at least one item');

    const product = await this.productService.findOne({ id: input.items[0].productId });
    if (!product) throw new NotFoundException(`Product ${input.items[0].productId} not found`);

    const order = await this.orderService.create(input, product.businessId);

    return { id: input.tableId, orders: [order] };
  }

  @Mutation(() => Order)
  async updateOrderStatus(@Args('input') input: UpdateOrderStatusInput): Promise<Order> {
    return this.orderService.updateStatus(input);
  }

  @Mutation(() => Order)
  async updateOrderItems(@Args('input') input: UpdateOrderItemsInput): Promise<Order> {
    const updatedOrder = await this.orderService.updateItems(input.orderId, input.items);
    if (!updatedOrder) throw new NotFoundException(`Order ${input.orderId} not found`);
    return updatedOrder;
  }

  @Mutation(() => ID)
  async deleteOrder(@Args('input') input: DeleteOrderInput): Promise<string> {
    const deleted = await this.orderService.delete(input.id);
    if (!deleted) throw new NotFoundException(`Order ${input.id} not found`);
    return input.id;
  }

  @Mutation(() => Table)
  async createSaleFromTableOrders(
    @Args('tableId', { type: () => ID }) tableId: string,
    @Args('businessId', { type: () => ID }) businessId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Table> {
    this.orderService.createSaleFromTableOrders({
      tableId,
      businessId,
      userId,
    });
    return {
      id:tableId,
      status:'PAID'
    };
  }

  @Query(() => Order)
  async order(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    const order = await this.orderService.findOne({ where: { id }, include: { items: {
      include:{
        product:true
      }
    } } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  @Query(() => [Order])
  async allOrders(
    @Args('businessId', { type: () => ID }) businessId: string,
    @Args('tableId', { type: () => ID, nullable: true }) tableId?: string,
  ): Promise<Order[]> {
    return this.orderService.findAll({
      where: { businessId, ...(tableId ? { tableId } : {}) },
      include: { items: {
        include:{
          product:true
        }
      } },
    });
  }
}
