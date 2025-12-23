import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFloorInput, UpdateFloorInput } from 'src/entitys/floor.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FloorService {
  constructor(private prisma: PrismaService) {}

  // Crear un piso
  async create(data: CreateFloorInput) {
    return this.prisma.floor.create({
      data: {
        name: data.name,
        business: { connect: { id: data.businessId } },
      },
    });
  }

  // Editar un piso
  async update(id: string, data: UpdateFloorInput) {
    // Validar existencia (opcional pero recomendado)
    const floor = await this.prisma.floor.findUnique({ where: { id } });
    if (!floor) throw new NotFoundException(`Floor #${id} not found`);

    return this.prisma.floor.update({
      where: { id },
      data: {
        name: data.name, // Solo actualizamos lo que viene definido
      },
    });
  }

  // Eliminar un piso
  async remove(id: string) {
    return this.prisma.floor.delete({
      where: { id },
    });
  }
  async getFloorsByBusinessId(id: string) {
    const floors = await this.prisma.floor.findMany({
      where: { businessId:id },
      include:{
        tables:{
          include:{
            orders:{
              include:{
                items:{
                  include:{
                    product:true
                  }
                }
              }
            }
          }
        }
      }
    });

    floors.forEach((floor) => {

      floor.tables.forEach((table) => {
     table.orders.forEach((order) => {console.log(order)})
      })
    })

    return floors
  }

  // Helper para ResolveField: Obtener mesas de un piso
  async getTablesByFloorId(floorId: string) {
    return this.prisma.table.findMany({
      where: { floorId },
      include:{
        orders:{
          include:{
            items:{
              include:{
                product:true
              }
            }
          }
        }
      }
    });
  }
}
