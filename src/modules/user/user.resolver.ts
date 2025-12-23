// user.resolver.ts

import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  DeleteUserInput,
  OutputUser,
  EmployeeStatus,
} from '../../entitys/user.entity';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Definimos que este Resolver manejará el tipo de salida 'User'
@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly prismaService:PrismaService) {}

  @Query(() => OutputUser)
  async getUser(
    @Args('userId') userId: string,
  ): Promise<OutputUser> {

 
    return await this.userService.findOne(userId);

  }

  @Query(() => [User], {
    name: 'usersByBusiness',
    description: 'Obtiene todos los empleados de un negocio',
  })
  async usersByBusiness(
    @Args('businessId') businessId: string,
  ): Promise<User[]> {
    return this.userService.findAllByBusiness(businessId);
  }

  // --- MUTACIÓN 1: CREAR USUARIO ---
  /**
   * Crea un nuevo usuario en la base de datos.
   * @param input Los datos necesarios para la creación (businessId, name, email, etc.).
   * @returns El objeto User recién creado.
   */
  @Mutation(() => User, { name: 'createUser' })
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    // Delega la lógica de creación al UserService (que usa Prisma)
    return this.userService.create(input);
  }

  // --- MUTACIÓN 2: EDITAR USUARIO ---
  /**
   * Actualiza un usuario existente por su ID.
   * @param input El ID del usuario y los campos opcionales a modificar.
   * @returns El objeto User actualizado.
   */
  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
    // El 'id' ya viene en el input de tipo string, como requiere Prisma
    const { id, ...dataToUpdate } = input;

    // Delega la lógica de actualización al UserService
    const updatedUser = await this.userService.update(
      id,
      dataToUpdate as UpdateUserInput,
    );

    // Nota: El UserService ya maneja la excepción NotFoundException de Prisma.
    return updatedUser;
  }

  // --- MUTACIÓN 3: ELIMINAR USUARIO ---
  /**
   * Elimina un usuario por su ID.
   * @param input El ID del usuario a eliminar.
   * @returns El ID del usuario que fue eliminado (String).
   */
  @Mutation(() => ID, { name: 'deleteUser' })
  async deleteUser(@Args('input') input: DeleteUserInput): Promise<string> {
    const isDeleted = await this.userService.delete(input.id);

    if (!isDeleted) {
      // Si el UserService devuelve 'false', el usuario no fue encontrado
      throw new NotFoundException(`User with ID ${input.id} not found.`);
    }

    // Retorna el ID del usuario eliminado
    return input.id;
  }
}
