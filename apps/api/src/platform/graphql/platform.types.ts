import { Field, ObjectType } from '@nestjs/graphql';

/**
 * GraphQL object types for the internal operator surface. Field names mirror
 * the service output (snake_case) so resolvers can return service results
 * directly without a mapping layer.
 */

@ObjectType()
export class OrganizationType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field()
  plan!: string;

  @Field()
  billing_status!: string;
}
