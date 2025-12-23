// business.resolver.ts

import { Resolver, Mutation, Args, ID, Query, Context } from '@nestjs/graphql';
import { BusinessService } from './business.service';
import {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
  DeleteBusinessInput,
} from '../../entitys/business.entity';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Role, Roles } from 'src/common/decorators/roles.decorators';
import { RoleGuard } from 'src/guards/auth/auth.guard';
import { User } from 'src/entitys/user.entity';
import { UserService } from '../user/user.service';
import { OutputClient } from 'src/entitys/client.entity';

@Resolver(() => Business)
export class BusinessResolver {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(RoleGuard) // ✔ luego el Guard
  @Roles(Role.Administrator) // ✔ primero Roles
  @Mutation(() => OutputClient, { name: 'createBusiness' })
  async createBusiness(
    @Args('input') input: CreateBusinessInput,
    @Context() ctx: any,
  ): Promise<OutputClient> {
    const user = ctx.user;

    const businessSameName = await this.businessService.find({

      AND:[
        {
          clientId:user.id
        },{ name:input.name}
      ]
      
    })

    if(businessSameName) return {
      errors:'BUSSINESS SAME NAME',
      success:false
    }

    const bussiness = await  this.businessService.create(input, user.id);
    
    return {
      success:true,
    client:{
      id:user.id,
      businesses:[
        bussiness
      ]
    }
    }
  }

  // 2. MUTACIÓN: ACTUALIZAR NEGOCIO
  /**
   * Modifica los datos de un negocio existente por su ID.
   * @param input ID del negocio y los campos a actualizar.
   * @returns El objeto Business actualizado.
   */
  @Mutation(() => Business, { name: 'updateBusiness' })
  async updateBusiness(
    @Args('input') input: UpdateBusinessInput,
  ): Promise<Business> {
    const { id, ...dataToUpdate } = input;

    // Delega la actualización al BusinessService
    return this.businessService.update(id, dataToUpdate as UpdateBusinessInput);
  }

  // 3. MUTACIÓN: ELIMINAR NEGOCIO
  /**
   * Elimina un negocio por su ID.
   * @param input El ID del negocio a eliminar.
   * @returns El ID del negocio que fue eliminado (String).
   */
  @Mutation(() => ID, { name: 'deleteBusiness' })
  async deleteBusiness(
    @Args('input') input: DeleteBusinessInput,
  ): Promise<string> {
    const isDeleted = await this.businessService.delete(input.id);

    if (!isDeleted) {
      throw new NotFoundException(`Business with ID ${input.id} not found.`);
    }

    // Retorna el ID del negocio eliminado
    return input.id;
  }

  // --- QUERY ADICIONAL (Para completar la funcionalidad CRUD) ---
  /**
   * Obtiene la información de un negocio por su ID.
   * @param id ID del negocio.
   * @returns El objeto Business.
   */
  @Query(() => Business, { name: 'business' })
  async getBusiness(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Business> {
    const business = await this.businessService.findOne(id, {
      floors: {
        include: {
          tables: true,
        },
      },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found.`);
    }
    return business;
  }
}
