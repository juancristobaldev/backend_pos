import { SetMetadata } from '@nestjs/common';

export enum Role {
  Administrator = 'Admin',
  Waiter = 'Waiter',
  Kitchen = 'Kitchen',
}

export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles permitidos a un handler.
 *
 * @example
 * @Roles(Role.Administrator, Role.Waiter)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
