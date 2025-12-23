// user.entity.ts
import {
  ObjectType,
  Field,
  InputType,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { User as PrismaUser } from '@prisma/client';

/* --------------------------------------------------------
 * 1. ENUM: ESTADOS DE EMPLEADO
 * -------------------------------------------------------- */

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

registerEnumType(EmployeeStatus, {
  name: 'EmployeeStatus',
  description: 'Estados posibles de un empleado',
});

/* --------------------------------------------------------
 * 2. ENTITY: USER
 * -------------------------------------------------------- */

@ObjectType()
export class User  {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  businessId: string;

  @Field()
  name: string;

  @Field()
  email: string;

  // ⚠️ Nunca se debería exponer en producción real
  @Field({ nullable: true })
  password: string;

  @Field()
  role: string;

  @Field(() => Date, { nullable: true })
  lastLogin: Date | null;

  @Field(() => EmployeeStatus)
  status: EmployeeStatus;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}


@ObjectType()
export class OutputUser  {
  @Field(()=> Boolean)
  success: boolean;
  @Field({nullable:true})
  errors?: string;
  @Field(()=> User,{nullable:true})
  user?: User;

}

/* --------------------------------------------------------
 * 3. INPUT TYPES
 * -------------------------------------------------------- */

@InputType()
export class CreateUserInput {
  @Field(() => ID)
  businessId: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  role: string;

  // status se define en el service (default: ACTIVE)
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  role?: string;

  @Field(() => EmployeeStatus, { nullable: true })
  status?: EmployeeStatus;
}

@InputType()
export class DeleteUserInput {
  @Field(() => ID)
  id: string;
}
