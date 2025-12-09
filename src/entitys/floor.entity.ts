import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { Floor as PrismaFloor } from '@prisma/client';
import { Table } from './table.entity';
// Si necesitas devolver las mesas dentro del piso en alguna consulta,
// podrías importar Table aquí, pero cuidado con las dependencias circulares.
// import { Table } from '../../table/entities/table.entity';

// =========================================================
// 1. OUTPUT TYPE (La Entidad 'Floor')
// =========================================================
@ObjectType()
export class Floor implements PrismaFloor {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  businessId: string; // Enlace con el Negocio principal

  @Field()
  name: string; // Ej: "Terraza", "Salón Principal", "Segundo Piso"

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
  @Field(() => [Table], { nullable: true })
  tables?: Table[];
  // NOTA: Si quieres que al consultar un Piso te traiga sus mesas automáticamente,
  // deberías agregar este campo (y resolverlo en el FloorResolver).
  // @Field(() => [Table], { nullable: true })
  // tables?: Table[];
}

// =========================================================
// 2. INPUT TYPES (Mutaciones)
// =========================================================

// --- Input para CREAR un nuevo Piso ---
@InputType()
export class CreateFloorInput {
  @Field(() => ID)
  businessId: string; // Obligatorio: ¿A qué restaurante pertenece este piso?

  @Field()
  name: string; // Obligatorio: "Barra", "Patio", etc.
}

// --- Input para EDITAR un Piso existente ---
@InputType()
export class UpdateFloorInput {
  @Field(() => ID)
  id: string; // Identificador del piso a editar

  @Field({ nullable: true })
  name?: string; // Solo permitimos cambiar el nombre por ahora
}

// --- Input para ELIMINAR un Piso ---
@InputType()
export class DeleteFloorInput {
  @Field(() => ID)
  id: string;
}
