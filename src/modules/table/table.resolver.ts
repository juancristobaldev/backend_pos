// table.resolver.ts

import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { TableService } from './table.service';
import {
  Table,
  CreateTablesBatchInput,
  UpdateTableInput,
  DeleteTableInput,
  TableBatchUpdateInput,
} from '../../entitys/table.entity';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly tableService: TableService) {}

  // 1. MUTACIÓN: CREAR MESA
  @Mutation(() => [Table])
  async createTables(@Args('input') input: CreateTablesBatchInput) {
    // input.floorId -> ID del piso
    // input.tables  -> Array con los datos de las mesas
    return this.tableService.createMany(input);
  }
  // 2. MUTACIÓN: ACTUALIZAR MESA

  @Mutation(() => Boolean, { name: 'manageFloorTables' })
  async manageFloorTables(
    @Args('input') input: TableBatchUpdateInput,
  ): Promise<boolean> {
    // El Servicio debe contener toda la lógica de Prisma para ejecutar
    // las transacciones de creación, actualización y eliminación
    await this.tableService.processBatchUpdate(input);

    // Retornamos true si la operación masiva fue exitosa
    return true;
  }

  // ... (Aquí irí

  @Mutation(() => Table, { name: 'updateTable' })
  async updateTable(@Args('input') input: UpdateTableInput): Promise<Table> {
    // Separamos el 'id' para usarlo en el 'where' de Prisma
    const { id, ...dataToUpdate } = input;

    // Le pasamos el 'id' y el resto de los campos para la actualización
    return this.tableService.update(id, dataToUpdate as UpdateTableInput);
  }

  // 3. MUTACIÓN: ELIMINAR MESA
  @Mutation(() => ID, { name: 'deleteTable' })
  async deleteTable(@Args('input') input: DeleteTableInput): Promise<string> {
    const isDeleted = await this.tableService.delete(input.id);

    if (!isDeleted) {
      throw new NotFoundException(`Table with ID ${input.id} not found.`);
    }
    return input.id;
  }

  // --- QUERY ADICIONAL: Buscar por ID ---
  @Query(() => Table, { name: 'table' })
  async getTable(@Args('id', { type: () => ID }) id: string): Promise<Table> {
    const table = await this.tableService.findOne(id);

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found.`);
    }
    return table;
  }

  @Query(() => [Table], { name: 'table' })
  async getTablesFromBusiness(
    @Args('idBusiness', { type: () => ID }) idBusiness: string,
  ): Promise<Table[]> {
    const tables = await this.tableService.findMany(idBusiness);

    return tables;
  }
}
