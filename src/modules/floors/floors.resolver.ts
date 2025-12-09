import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import {
  Floor,
  CreateFloorInput,
  UpdateFloorInput,
  DeleteFloorInput,
} from 'src/entitys/floor.entity';
import { Table } from 'src/entitys/table.entity';
import { FloorService } from './floors.service';

@Resolver(() => Floor)
export class FloorsResolver {
  constructor(private readonly floorService: FloorService) {}

  // ==================================================
  // MUTATIONS (Lo que pediste)
  // ==================================================

  @Mutation(() => Floor)
  async createFloor(
    @Args('createFloorInput') createFloorInput: CreateFloorInput,
  ) {
    return this.floorService.create(createFloorInput);
  }

  @Mutation(() => Floor)
  async updateFloor(
    @Args('updateFloorInput') updateFloorInput: UpdateFloorInput,
  ) {
    return this.floorService.update(updateFloorInput.id, updateFloorInput);
  }

  @Mutation(() => Floor)
  async deleteFloor(
    @Args('deleteFloorInput') deleteFloorInput: DeleteFloorInput,
  ) {
    return this.floorService.remove(deleteFloorInput.id);
  }

  // ==================================================
  // FIELDS (La Magia para el Frontend)
  // ==================================================

  // Esto permite hacer query { business { floors { tables { name } } } }
  // Sin esto, tu mapa no pintará las mesas.
  @ResolveField(() => [Table])
  async tables(@Parent() floor: Floor) {
    return this.floorService.getTablesByFloorId(floor.id);
  }
}
