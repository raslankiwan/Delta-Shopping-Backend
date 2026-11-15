import { Field, InputType, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL types for the customers domain. Object type field names mirror the
 * service output (snake_case for profile/address rows) so resolvers can return
 * service results directly without a mapping layer.
 */

@ObjectType()
export class CustomerSummaryType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name!: string | null;
}

@ObjectType()
export class CustomerSessionType {
  @Field()
  access!: string;

  @Field()
  expiresIn!: number;

  @Field(() => CustomerSummaryType)
  customer!: CustomerSummaryType;
}

@ObjectType()
export class CustomerProfileType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  name!: string | null;

  @Field()
  locale!: string;

  @Field()
  accepts_marketing!: boolean;
}

@ObjectType()
export class CustomerAddressType {
  @Field()
  id!: string;

  @Field({ nullable: true })
  name!: string | null;

  @Field()
  line1!: string;

  @Field({ nullable: true })
  line2!: string | null;

  @Field()
  city!: string;

  @Field({ nullable: true })
  region!: string | null;

  @Field({ nullable: true })
  postal_code!: string | null;

  @Field()
  country!: string;

  @Field({ nullable: true })
  phone!: string | null;

  @Field()
  is_default!: boolean;
}

@ObjectType()
export class AddressIdType {
  @Field()
  id!: string;
}

@InputType()
export class RegisterGqlInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  acceptsMarketing?: boolean;
}

@InputType()
export class CustomerLoginGqlInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UpdateProfileGqlInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  acceptsMarketing?: boolean;
}

@InputType()
export class AddressGqlInput {
  @Field({ nullable: true })
  name?: string;

  @Field()
  line1!: string;

  @Field({ nullable: true })
  line2?: string;

  @Field()
  city!: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field()
  country!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  isDefault?: boolean;
}
