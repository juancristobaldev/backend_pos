// table.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Table } from '@prisma/client'; // Tipo de salida de Prisma
import { PrismaService } from '../prisma/prisma.service';
// Importamos las clases de entrada desde la entidad
import {
  CreateTablesBatchInput,
  TableBatchUpdateInput,
  UpdateTableInput,
} from '../../entitys/table.entity';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  // 1. CREAR MESA (Mutación: createTable)
  /**
   * Crea una nueva mesa enlazándola a un negocio.
   * @param input Datos de la mesa (CreateTableInput).
   * @returns El objeto Table recién creado.
   */

  async processBatchUpdate(input: TableBatchUpdateInput): Promise<void> {
    const { floorId, tablesToCreate, tablesToUpdate, tableIdsToDelete } = input;

    // 1. Array para almacenar todas las operaciones (Prisma promises)
    const transactionOperations: Prisma.PrismaPromise<any>[] = [];

    // --- A. Operaciones de CREACIÓN ---
    if (tablesToCreate && tablesToCreate.length > 0) {
      console.log(
        `Creando ${tablesToCreate.length} nuevas mesas en el Floor: ${floorId}`,
      );

      // Mapeamos los inputs a los datos requeridos por Prisma.create
      const createData = tablesToCreate.map((table) => ({
        ...table,
        floorId: floorId, // Aseguramos que todas las nuevas mesas pertenezcan al floorId del input
        status: 'Disponible', // Estado por defecto
        // coordX, coordY, name, capacity, shape, color ya vienen en el input
      }));

      // Usamos createMany para crear en lote si es posible, o map + create
      // createMany es más rápido, pero no dispara 'middleware' o hooks.
      transactionOperations.push(
        this.prisma.table.createMany({
          data: createData,
          skipDuplicates: true, // Ignorar si por alguna razón hay duplicados
        }),
      );
    }

    // --- B. Operaciones de ACTUALIZACIÓN ---
    if (tablesToUpdate && tablesToUpdate.length > 0) {
      console.log(`Actualizando ${tablesToUpdate.length} mesas existentes.`);

      // Para las actualizaciones, necesitamos un UPDATE por cada mesa,
      // ya que la data puede ser diferente para cada una.
      tablesToUpdate.forEach((tableInput) => {
        const { id, ...updateData } = tableInput;

        // Evitamos actualizar el floorId a menos que se mueva de plano
        // y eliminamos el ID del objeto de datos.
        if (id) {
          transactionOperations.push(
            this.prisma.table.update({
              where: { id: id },
              data: updateData,
            }),
          );
        }
      });
    }

    // --- C. Operaciones de ELIMINACIÓN ---
    if (tableIdsToDelete && tableIdsToDelete.length > 0) {
      console.log(`Eliminando ${tableIdsToDelete.length} mesas.`);

      // Usamos deleteMany para una eliminación en lote eficiente
      transactionOperations.push(
        this.prisma.table.deleteMany({
          where: {
            id: {
              in: tableIdsToDelete,
            },
            // Opcional: Asegurar que solo se eliminen mesas de este plano
            floorId: floorId,
          },
        }),
      );
    }

    // --- D. Ejecución de la Transacción ---
    if (transactionOperations.length === 0) {
      console.log('No hay operaciones para ejecutar.');
      return;
    }

    try {
      // 🚨 ¡PUNTO CRÍTICO! Aquí se asegura la atomicidad.
      await this.prisma.$transaction(transactionOperations);

      // Nota: Aquí, o en un middleware de Prisma, se podría agregar la lógica
      // de registro en SyncLog para la replicación offline si aplica a esta entidad.
      // (SyncLog almacena operaciones de escritura [cite: 123, 172]).

      console.log('Transacción de mesas completada exitosamente.');
    } catch (error) {
      console.error('Error durante la transacción de mesas:', error);
      // Prisma deshace automáticamente todas las operaciones si hay un error
      throw new Error(`Fallo en la gestión del plano: ${error.message}`);
    }
  }

  async createMany(input: CreateTablesBatchInput) {
    const { floorId, tables } = input;

    // 1. Validación básica de seguridad
    if (!tables || tables.length === 0) {
      throw new BadRequestException('La lista de mesas no puede estar vacía.');
    }

    // 2. Ejecución Transaccional
    // Mapeamos cada objeto del input a una promesa de creación de Prisma
    return await this.prisma.$transaction(
      tables.map((tableData) => {
        return this.prisma.table.create({
          data: {
            // Relación con el Piso (Foreign Key)
            floorId: floorId,

            // Datos de la mesa
            name: tableData.name,
            coordX: tableData.coordX,
            coordY: tableData.coordY,
            capacity: tableData.capacity,
            status: tableData.status || 'Available', // Default por seguridad

            // Datos de visualización
            shape: tableData.shape,
            color: tableData.color,
          },
        });
      }),
    );
  }

  // 2. ACTUALIZAR MESA (Mutación: updateTable)
  /**
   * Actualiza una mesa existente por su ID.
   * @param id ID de la mesa (String).
   * @param input Los campos opcionales a modificar (UpdateTableInput).
   * @returns El objeto Table actualizado.
   */
  async update(id: string, input: UpdateTableInput): Promise<Table> {
    try {
      // Pasamos el input directamente a 'data', ya que solo contiene los campos
      // que deben actualizarse (excluyendo el 'id' en el resolver).
      const updatedTable = await this.prisma.table.update({
        where: { id: id },
        data: input,
      });

      return updatedTable;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Table with ID ${id} not found.`);
      }
      throw error;
    }
  }

  // 3. ELIMINAR MESA (Mutación: deleteTable)
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.table.delete({
        where: { id: id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  // --- Consulta de ejemplo (Query) ---
  async findOne(id: string): Promise<Table | null> {
    return this.prisma.table.findUnique({
      where: { id: id },
    });
  }

  // --- Consulta de ejemplo (Query) ---
  async findMany(floorId: string): Promise<Table[]> {
    return this.prisma.table.findMany({
      where: { floorId },
    });
  }
}
