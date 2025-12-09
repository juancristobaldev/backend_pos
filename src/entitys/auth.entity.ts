// auth.input.ts

import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class AuthInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AuthPayload {
  @Field(() => String, { nullable: false })
  accessToken: string;
}
