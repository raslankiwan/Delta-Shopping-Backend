import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MoneyType } from '../../catalog/graphql/catalog.types';

/**
 * A shipping zone as exposed to the storefront/admin. Field names mirror the
 * ShippingService view (snake_case) so the resolver returns service results
 * directly. Reuses the catalog domain's MoneyType for the rate.
 */
@ObjectType()
export class ShippingZoneType {
  @Field()
  id!: string;

  /** West Bank governorate code. */
  @Field()
  governorate!: string;

  @Field()
  name!: string;

  @Field(() => MoneyType)
  rate!: MoneyType;

  @Field()
  cod_available!: boolean;

  @Field(() => Int, { nullable: true })
  eta_days!: number | null;

  @Field()
  enabled!: boolean;
}
