import { Field, InputType, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object/input types for staff auth. Object field names mirror the
 * REST `toAuthResponse` shape (snake_case) so the resolver can build the same
 * response shape as the controller. Inputs mirror the zod dto shapes
 * (camelCase args are fine for inputs; zod refinements don't run under
 * GraphQL — that's acceptable for now).
 */

@ObjectType()
export class PrincipalType {
  @Field()
  user_id!: string;

  @Field()
  organization_id!: string;

  @Field(() => [String])
  store_ids!: string[];

  @Field(() => [String])
  permissions!: string[];
}

@ObjectType()
export class AuthPayloadType {
  @Field()
  access_token!: string;

  @Field()
  refresh_token!: string;

  @Field()
  token_type!: string;

  @Field()
  expires_in!: number;

  @Field(() => PrincipalType)
  principal!: PrincipalType;
}

@InputType()
export class SignupInputType {
  @Field()
  organizationName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  name!: string;
}

@InputType()
export class LoginInputType {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RefreshInputType {
  @Field()
  refreshToken!: string;
}
