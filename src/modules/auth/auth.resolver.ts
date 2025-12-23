// auth.resolver.ts

import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthInput, AuthPayload } from 'src/entitys/auth.entity';
// Importamos los tipos auxiliares necesarios

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Mutación para iniciar sesión, válida credenciales de User o Client.
   * @param input El email y password proporcionados por el usuario.
   * @returns Un objeto AuthPayload que contiene el accessToken (JWT).
   */

  @Mutation(() => AuthPayload, { name: 'loginClient' })
  async loginClient(@Args('input') input: AuthInput): Promise<AuthPayload> {
    const tokenPayload = await this.authService.validateClient(input);

    console.log({ input, tokenPayload });
    return tokenPayload;
  }

  @Mutation(() => AuthPayload, { name: 'loginUser' })
  async loginUser(@Args('input') input: AuthInput): Promise<AuthPayload> {
    console.log(input)
    const tokenPayload = await this.authService.validateUser(input);

    return tokenPayload;
  }
}
