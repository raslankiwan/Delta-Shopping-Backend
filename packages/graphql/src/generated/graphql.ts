import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSONObject: { input: any; output: any; }
};

export type AddImageInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  url: Scalars['String']['input'];
  variantId?: InputMaybe<Scalars['String']['input']>;
};

export type AddLineInputType = {
  quantity: Scalars['Int']['input'];
  variantId: Scalars['String']['input'];
};

export type AddOptionInput = {
  name: Scalars['String']['input'];
  values: Array<Scalars['String']['input']>;
};

export type AddressGqlInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  line1: Scalars['String']['input'];
  line2?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};

export type AddressIdType = {
  __typename?: 'AddressIdType';
  id: Scalars['String']['output'];
};

export type AddressInputType = {
  city: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  governorate?: InputMaybe<Scalars['String']['input']>;
  line1: Scalars['String']['input'];
  line2?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};

export type AdjustInventoryInput = {
  delta: Scalars['Int']['input'];
  reorderPoint?: InputMaybe<Scalars['Int']['input']>;
  variantId: Scalars['String']['input'];
};

export type AdminPriceListType = {
  __typename?: 'AdminPriceListType';
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AdminProductDetailType = {
  __typename?: 'AdminProductDetailType';
  category?: Maybe<CategoryRefType>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  images: Array<ProductImageType>;
  options: Array<ProductOptionType>;
  requires_shipping: Scalars['Boolean']['output'];
  seo_description?: Maybe<Scalars['String']['output']>;
  seo_title?: Maybe<Scalars['String']['output']>;
  service_duration_minutes?: Maybe<Scalars['Int']['output']>;
  service_location?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  translations: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
  variants: Array<VariantDetailType>;
  vendor?: Maybe<Scalars['String']['output']>;
};

export type AdminProductListItemType = {
  __typename?: 'AdminProductListItemType';
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ApplyDiscountInputType = {
  code: Scalars['String']['input'];
};

export type AuthPayloadType = {
  __typename?: 'AuthPayloadType';
  access_token: Scalars['String']['output'];
  expires_in: Scalars['Float']['output'];
  principal: PrincipalType;
  refresh_token: Scalars['String']['output'];
  token_type: Scalars['String']['output'];
};

export type CartLineType = {
  __typename?: 'CartLineType';
  id: Scalars['String']['output'];
  line_total: MoneyType;
  quantity: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  title: Scalars['String']['output'];
  unit_price: MoneyType;
  variant_id: Scalars['String']['output'];
};

export type CartRefType = {
  __typename?: 'CartRefType';
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type CartType = {
  __typename?: 'CartType';
  currency: Scalars['String']['output'];
  discount: MoneyType;
  discount_code?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lines: Array<CartLineType>;
  status: Scalars['String']['output'];
  subtotal: MoneyType;
  total: MoneyType;
};

export type CategoryRefType = {
  __typename?: 'CategoryRefType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type CategoryType = {
  __typename?: 'CategoryType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parent_id?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
};

export type CheckoutOrderLineType = {
  __typename?: 'CheckoutOrderLineType';
  quantity: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  title: Scalars['String']['output'];
  total_minor: Scalars['Int']['output'];
  unit_price_minor: Scalars['Int']['output'];
};

export type CompleteCheckoutInputType = {
  billingAddress?: InputMaybe<AddressInputType>;
  cartId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  shippingAddress: AddressInputType;
};

export type CreateCartInputType = {
  currency?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCategoryInput = {
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
};

export type CreateDiscountCodeInputType = {
  code: Scalars['String']['input'];
  endsAt?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  perCustomerLimit?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateDiscountCodeResultType = {
  __typename?: 'CreateDiscountCodeResultType';
  id: Scalars['String']['output'];
};

export type CreateLocationInputType = {
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateLocationResultType = {
  __typename?: 'CreateLocationResultType';
  id: Scalars['String']['output'];
};

export type CreateProductInput = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  requiresShipping?: InputMaybe<Scalars['Boolean']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  serviceDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  serviceLocation?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  vendor?: InputMaybe<Scalars['String']['input']>;
};

export type CreateStoreInputType = {
  currencies?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultCurrency: Scalars['String']['input'];
  defaultLocale: Scalars['String']['input'];
  locales?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  timezone: Scalars['String']['input'];
};

export type CreateStoreResultType = {
  __typename?: 'CreateStoreResultType';
  id: Scalars['String']['output'];
};

export type CreateVariantInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  optionValues?: InputMaybe<Scalars['JSONObject']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  sku: Scalars['String']['input'];
  weightGrams?: InputMaybe<Scalars['Int']['input']>;
};

export type CustomerAddressType = {
  __typename?: 'CustomerAddressType';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  id: Scalars['String']['output'];
  is_default: Scalars['Boolean']['output'];
  line1: Scalars['String']['output'];
  line2?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
};

export type CustomerLoginGqlInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type CustomerProfileType = {
  __typename?: 'CustomerProfileType';
  accepts_marketing: Scalars['Boolean']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type CustomerSessionType = {
  __typename?: 'CustomerSessionType';
  access: Scalars['String']['output'];
  customer: CustomerSummaryType;
  expiresIn: Scalars['Float']['output'];
};

export type CustomerSummaryType = {
  __typename?: 'CustomerSummaryType';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type DiscountCodeType = {
  __typename?: 'DiscountCodeType';
  action: Scalars['JSONObject']['output'];
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  usage_limit?: Maybe<Scalars['Int']['output']>;
  used_count: Scalars['Int']['output'];
};

export type FulfillOrderInput = {
  carrier?: InputMaybe<Scalars['String']['input']>;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type FulfillResultType = {
  __typename?: 'FulfillResultType';
  id: Scalars['String']['output'];
};

export type GenerateVariantsResultType = {
  __typename?: 'GenerateVariantsResultType';
  created: Scalars['Int']['output'];
};

export type IdResultType = {
  __typename?: 'IdResultType';
  id: Scalars['String']['output'];
};

export type InventoryAdjustResultType = {
  __typename?: 'InventoryAdjustResultType';
  on_hand: Scalars['Int']['output'];
};

export type InventoryItemType = {
  __typename?: 'InventoryItemType';
  available: Scalars['Int']['output'];
  location_id: Scalars['String']['output'];
  on_hand: Scalars['Int']['output'];
  reorder_point: Scalars['Int']['output'];
  reserved: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  variant_id: Scalars['String']['output'];
};

export type InventoryReportType = {
  __typename?: 'InventoryReportType';
  low_stock: Scalars['Int']['output'];
  skus: Scalars['Int']['output'];
  total_on_hand: Scalars['Int']['output'];
  total_reserved: Scalars['Int']['output'];
};

export type LocationType = {
  __typename?: 'LocationType';
  id: Scalars['String']['output'];
  is_default: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type LoginInputType = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LowStockItemType = {
  __typename?: 'LowStockItemType';
  on_hand: Scalars['Int']['output'];
  reorder_point: Scalars['Int']['output'];
  reserved: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  variant_id: Scalars['String']['output'];
};

export type MediaUploadResultType = {
  __typename?: 'MediaUploadResultType';
  filename: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type MoneyType = {
  __typename?: 'MoneyType';
  amount_minor: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  accountAddAddress: AddressIdType;
  accountRemoveAddress: Scalars['Boolean']['output'];
  accountUpdateProfile: Scalars['Boolean']['output'];
  addProductImage: IdResultType;
  addProductOption: IdResultType;
  addVariant: IdResultType;
  cancelOrder: Scalars['Boolean']['output'];
  cartAddLine: CartType;
  cartApplyDiscount: CartType;
  cartRemoveDiscount: CartType;
  cartRemoveLine: CartType;
  cartUpdateLine: CartType;
  checkoutComplete: OrderType;
  createCart: CartRefType;
  createCategory: IdResultType;
  createDiscountCode: CreateDiscountCodeResultType;
  createLocation: CreateLocationResultType;
  createProduct: IdResultType;
  createStore: CreateStoreResultType;
  customerLogin: CustomerSessionType;
  customerRegister: CustomerSessionType;
  deleteProduct: Scalars['Boolean']['output'];
  fulfillOrder: FulfillResultType;
  generateVariants: GenerateVariantsResultType;
  inventoryAdjust: InventoryAdjustResultType;
  logout: Scalars['Boolean']['output'];
  mediaUpload: MediaUploadResultType;
  operatorSetStoreStatus: Scalars['Boolean']['output'];
  refreshToken: AuthPayloadType;
  refundOrder: RefundResultType;
  removeProductImage: Scalars['Boolean']['output'];
  setProductTranslations: Scalars['Boolean']['output'];
  setVariantPrice: IdResultType;
  staffLogin: AuthPayloadType;
  staffRegister: AuthPayloadType;
  updateProduct: Scalars['Boolean']['output'];
  updateStore: Scalars['Boolean']['output'];
};


export type MutationAccountAddAddressArgs = {
  input: AddressGqlInput;
};


export type MutationAccountRemoveAddressArgs = {
  id: Scalars['String']['input'];
};


export type MutationAccountUpdateProfileArgs = {
  input: UpdateProfileGqlInput;
};


export type MutationAddProductImageArgs = {
  input: AddImageInput;
  productId: Scalars['String']['input'];
};


export type MutationAddProductOptionArgs = {
  input: AddOptionInput;
  productId: Scalars['String']['input'];
};


export type MutationAddVariantArgs = {
  input: CreateVariantInput;
  productId: Scalars['String']['input'];
};


export type MutationCancelOrderArgs = {
  id: Scalars['String']['input'];
};


export type MutationCartAddLineArgs = {
  cartId: Scalars['String']['input'];
  input: AddLineInputType;
};


export type MutationCartApplyDiscountArgs = {
  cartId: Scalars['String']['input'];
  input: ApplyDiscountInputType;
};


export type MutationCartRemoveDiscountArgs = {
  cartId: Scalars['String']['input'];
};


export type MutationCartRemoveLineArgs = {
  cartId: Scalars['String']['input'];
  lineId: Scalars['String']['input'];
};


export type MutationCartUpdateLineArgs = {
  cartId: Scalars['String']['input'];
  input: UpdateLineInputType;
  lineId: Scalars['String']['input'];
};


export type MutationCheckoutCompleteArgs = {
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  input: CompleteCheckoutInputType;
};


export type MutationCreateCartArgs = {
  input?: InputMaybe<CreateCartInputType>;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateDiscountCodeArgs = {
  input: CreateDiscountCodeInputType;
};


export type MutationCreateLocationArgs = {
  input: CreateLocationInputType;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateStoreArgs = {
  input: CreateStoreInputType;
};


export type MutationCustomerLoginArgs = {
  input: CustomerLoginGqlInput;
};


export type MutationCustomerRegisterArgs = {
  input: RegisterGqlInput;
};


export type MutationDeleteProductArgs = {
  id: Scalars['String']['input'];
};


export type MutationFulfillOrderArgs = {
  id: Scalars['String']['input'];
  input: FulfillOrderInput;
};


export type MutationGenerateVariantsArgs = {
  productId: Scalars['String']['input'];
};


export type MutationInventoryAdjustArgs = {
  input: AdjustInventoryInput;
};


export type MutationLogoutArgs = {
  input: RefreshInputType;
};


export type MutationMediaUploadArgs = {
  contentBase64: Scalars['String']['input'];
  filename: Scalars['String']['input'];
};


export type MutationOperatorSetStoreStatusArgs = {
  status: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type MutationRefreshTokenArgs = {
  input: RefreshInputType;
};


export type MutationRefundOrderArgs = {
  id: Scalars['String']['input'];
  input: RefundOrderInput;
};


export type MutationRemoveProductImageArgs = {
  imageId: Scalars['String']['input'];
};


export type MutationSetProductTranslationsArgs = {
  input: SetTranslationsInput;
  productId: Scalars['String']['input'];
};


export type MutationSetVariantPriceArgs = {
  input: SetPriceInput;
  variantId: Scalars['String']['input'];
};


export type MutationStaffLoginArgs = {
  input: LoginInputType;
};


export type MutationStaffRegisterArgs = {
  input: SignupInputType;
};


export type MutationUpdateProductArgs = {
  id: Scalars['String']['input'];
  input: UpdateProductInput;
};


export type MutationUpdateStoreArgs = {
  id: Scalars['String']['input'];
  input: UpdateStoreInputType;
};

export type OrderDetailType = {
  __typename?: 'OrderDetailType';
  fulfillments: Array<OrderFulfillmentType>;
  lines: Array<OrderLineType>;
  order: OrderSummaryType;
  payments: Array<OrderPaymentType>;
  refunds: Array<OrderRefundType>;
};

export type OrderFulfillmentType = {
  __typename?: 'OrderFulfillmentType';
  carrier?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tracking_number?: Maybe<Scalars['String']['output']>;
};

export type OrderLineType = {
  __typename?: 'OrderLineType';
  quantity: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  title: Scalars['String']['output'];
  total_minor: Scalars['Int']['output'];
  unit_price_minor: Scalars['Int']['output'];
};

export type OrderListItemType = {
  __typename?: 'OrderListItemType';
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  financial_status: Scalars['String']['output'];
  fulfillment_status: Scalars['String']['output'];
  id: Scalars['String']['output'];
  number: Scalars['String']['output'];
  placed_at: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  total_minor: Scalars['Int']['output'];
};

export type OrderPaymentType = {
  __typename?: 'OrderPaymentType';
  amount_minor: Scalars['Int']['output'];
  provider: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type OrderRefundType = {
  __typename?: 'OrderRefundType';
  amount_minor: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type OrderSummaryType = {
  __typename?: 'OrderSummaryType';
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  financial_status: Scalars['String']['output'];
  fulfillment_status: Scalars['String']['output'];
  id: Scalars['String']['output'];
  number: Scalars['String']['output'];
  placed_at: Scalars['DateTime']['output'];
  shipping_minor: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  subtotal_minor: Scalars['Int']['output'];
  tax_minor: Scalars['Int']['output'];
  total_minor: Scalars['Int']['output'];
};

export type OrderType = {
  __typename?: 'OrderType';
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  financial_status: Scalars['String']['output'];
  fulfillment_status: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lines: Array<CheckoutOrderLineType>;
  number: Scalars['String']['output'];
  shipping: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  subtotal: Scalars['Int']['output'];
  tax: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type OrganizationType = {
  __typename?: 'OrganizationType';
  billing_status: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type PaymentMethodType = {
  __typename?: 'PaymentMethodType';
  capture: Scalars['String']['output'];
  method: Scalars['String']['output'];
};

export type PrincipalType = {
  __typename?: 'PrincipalType';
  organization_id: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  store_ids: Array<Scalars['String']['output']>;
  user_id: Scalars['String']['output'];
};

export type ProductDetailType = {
  __typename?: 'ProductDetailType';
  category?: Maybe<CategoryRefType>;
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  images: Array<ProductImageType>;
  locale: Scalars['String']['output'];
  options: Array<ProductOptionType>;
  requires_shipping: Scalars['Boolean']['output'];
  seo_description?: Maybe<Scalars['String']['output']>;
  seo_title?: Maybe<Scalars['String']['output']>;
  service_duration_minutes?: Maybe<Scalars['Int']['output']>;
  service_location?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  variants: Array<VariantDetailType>;
  vendor?: Maybe<Scalars['String']['output']>;
};

export type ProductImageType = {
  __typename?: 'ProductImageType';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

export type ProductOptionType = {
  __typename?: 'ProductOptionType';
  name: Scalars['String']['output'];
  values: Array<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  accountAddresses: Array<CustomerAddressType>;
  accountProfile: CustomerProfileType;
  adminCategories: Array<CategoryType>;
  adminPriceLists: Array<AdminPriceListType>;
  adminProduct: AdminProductDetailType;
  adminProducts: Array<AdminProductListItemType>;
  adminStores: Array<StoreType>;
  cart: CartType;
  categories: Array<CategoryType>;
  discountCodes: Array<DiscountCodeType>;
  inventory: Array<InventoryItemType>;
  inventoryLowStock: Array<LowStockItemType>;
  locations: Array<LocationType>;
  me: PrincipalType;
  order: OrderDetailType;
  orders: Array<OrderListItemType>;
  organizations: Array<OrganizationType>;
  paymentMethods: Array<PaymentMethodType>;
  product?: Maybe<ProductDetailType>;
  products: Array<StorefrontProductType>;
  reportInventory: InventoryReportType;
  reportSales: SalesReportType;
  reportTopProducts: Array<TopProductType>;
  searchProducts: Array<StorefrontProductType>;
  shippingZones: Array<ShippingZoneType>;
  storeConfig: StorefrontConfigType;
  stores: Array<StoreType>;
};


export type QueryAdminProductArgs = {
  id: Scalars['String']['input'];
};


export type QueryCartArgs = {
  id: Scalars['String']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  categorySlug?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReportSalesArgs = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};


export type QueryReportTopProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchProductsArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  q: Scalars['String']['input'];
};

export type RefreshInputType = {
  refreshToken: Scalars['String']['input'];
};

export type RefundOrderInput = {
  amountMinor?: InputMaybe<Scalars['Int']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type RefundResultType = {
  __typename?: 'RefundResultType';
  id: Scalars['String']['output'];
};

export type RegisterGqlInput = {
  acceptsMarketing?: InputMaybe<Scalars['Boolean']['input']>;
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export type SalesReportType = {
  __typename?: 'SalesReportType';
  aov_minor: Scalars['Int']['output'];
  orders_count: Scalars['Int']['output'];
  revenue_minor: Scalars['Int']['output'];
};

export type SetPriceInput = {
  amountMinor: Scalars['Int']['input'];
  compareAtAmountMinor?: InputMaybe<Scalars['Int']['input']>;
  endsAt?: InputMaybe<Scalars['String']['input']>;
  minQuantity?: InputMaybe<Scalars['Int']['input']>;
  priceListId: Scalars['String']['input'];
  startsAt?: InputMaybe<Scalars['String']['input']>;
};

export type SetTranslationsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  locale: Scalars['String']['input'];
  seo_description?: InputMaybe<Scalars['String']['input']>;
  seo_title?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingZoneType = {
  __typename?: 'ShippingZoneType';
  cod_available: Scalars['Boolean']['output'];
  enabled: Scalars['Boolean']['output'];
  eta_days?: Maybe<Scalars['Int']['output']>;
  governorate: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rate: MoneyType;
};

export type SignupInputType = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type StoreType = {
  __typename?: 'StoreType';
  default_currency: Scalars['String']['output'];
  default_locale: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type StorefrontConfigType = {
  __typename?: 'StorefrontConfigType';
  currencies: Array<Scalars['String']['output']>;
  default_currency: Scalars['String']['output'];
  default_locale: Scalars['String']['output'];
  locales: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  tax_bps: Scalars['Int']['output'];
};

export type StorefrontProductType = {
  __typename?: 'StorefrontProductType';
  from_price?: Maybe<MoneyType>;
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type TopProductType = {
  __typename?: 'TopProductType';
  revenue_minor: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
  title: Scalars['String']['output'];
  units: Scalars['Int']['output'];
};

export type UpdateLineInputType = {
  quantity: Scalars['Int']['input'];
};

export type UpdateProductInput = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  requiresShipping?: InputMaybe<Scalars['Boolean']['input']>;
  seoDescription?: InputMaybe<Scalars['String']['input']>;
  seoTitle?: InputMaybe<Scalars['String']['input']>;
  serviceDurationMinutes?: InputMaybe<Scalars['Int']['input']>;
  serviceLocation?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  vendor?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileGqlInput = {
  acceptsMarketing?: InputMaybe<Scalars['Boolean']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreInputType = {
  defaultCurrency?: InputMaybe<Scalars['String']['input']>;
  defaultLocale?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type VariantDetailType = {
  __typename?: 'VariantDetailType';
  compare_at?: Maybe<MoneyType>;
  id: Scalars['String']['output'];
  option_values: Scalars['JSONObject']['output'];
  price?: Maybe<MoneyType>;
  sku: Scalars['String']['output'];
};

export type PrincipalFFragment = { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> };

export type AuthPayloadFFragment = { __typename?: 'AuthPayloadType', access_token: string, refresh_token: string, token_type: string, expires_in: number, principal: { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> } };

export type StaffLoginMutationVariables = Exact<{
  input: LoginInputType;
}>;


export type StaffLoginMutation = { __typename?: 'Mutation', staffLogin: { __typename?: 'AuthPayloadType', access_token: string, refresh_token: string, token_type: string, expires_in: number, principal: { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> } } };

export type StaffRegisterMutationVariables = Exact<{
  input: SignupInputType;
}>;


export type StaffRegisterMutation = { __typename?: 'Mutation', staffRegister: { __typename?: 'AuthPayloadType', access_token: string, refresh_token: string, token_type: string, expires_in: number, principal: { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> } } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshInputType;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayloadType', access_token: string, refresh_token: string, token_type: string, expires_in: number, principal: { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> } } };

export type LogoutMutationVariables = Exact<{
  input: RefreshInputType;
}>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'PrincipalType', user_id: string, organization_id: string, store_ids: Array<string>, permissions: Array<string> } };

export type AdminProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminProductsQuery = { __typename?: 'Query', adminProducts: Array<{ __typename?: 'AdminProductListItemType', id: string, slug: string, title: string, status: string }> };

export type AdminProductQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AdminProductQuery = { __typename?: 'Query', adminProduct: { __typename?: 'AdminProductDetailType', id: string, slug: string, title: string, subtitle?: string | null, description?: string | null, type: string, requires_shipping: boolean, service_duration_minutes?: number | null, service_location?: string | null, vendor?: string | null, tags: Array<string>, seo_title?: string | null, seo_description?: string | null, status: string, translations: any, category?: { __typename?: 'CategoryRefType', id: string, slug: string, name: string } | null, images: Array<{ __typename?: 'ProductImageType', id: string, url: string, alt?: string | null, position: number }>, options: Array<{ __typename?: 'ProductOptionType', name: string, values: Array<string> }>, variants: Array<{ __typename?: 'VariantDetailType', id: string, sku: string, option_values: any, price?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null, compare_at?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null }> } };

export type AdminPriceListsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPriceListsQuery = { __typename?: 'Query', adminPriceLists: Array<{ __typename?: 'AdminPriceListType', id: string, name: string, currency: string }> };

export type AdminCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCategoriesQuery = { __typename?: 'Query', adminCategories: Array<{ __typename?: 'CategoryType', id: string, slug: string, name: string, parent_id?: string | null, position: number }> };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryInput;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory: { __typename?: 'IdResultType', id: string } };

export type AdminShippingZonesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminShippingZonesQuery = { __typename?: 'Query', shippingZones: Array<{ __typename?: 'ShippingZoneType', id: string, governorate: string, name: string, cod_available: boolean, eta_days?: number | null, enabled: boolean, rate: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> };

export type CreateProductMutationVariables = Exact<{
  input: CreateProductInput;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct: { __typename?: 'IdResultType', id: string } };

export type UpdateProductMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateProductInput;
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct: boolean };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: boolean };

export type AddProductOptionMutationVariables = Exact<{
  productId: Scalars['String']['input'];
  input: AddOptionInput;
}>;


export type AddProductOptionMutation = { __typename?: 'Mutation', addProductOption: { __typename?: 'IdResultType', id: string } };

export type GenerateVariantsMutationVariables = Exact<{
  productId: Scalars['String']['input'];
}>;


export type GenerateVariantsMutation = { __typename?: 'Mutation', generateVariants: { __typename?: 'GenerateVariantsResultType', created: number } };

export type AddProductImageMutationVariables = Exact<{
  productId: Scalars['String']['input'];
  input: AddImageInput;
}>;


export type AddProductImageMutation = { __typename?: 'Mutation', addProductImage: { __typename?: 'IdResultType', id: string } };

export type RemoveProductImageMutationVariables = Exact<{
  imageId: Scalars['String']['input'];
}>;


export type RemoveProductImageMutation = { __typename?: 'Mutation', removeProductImage: boolean };

export type SetProductTranslationsMutationVariables = Exact<{
  productId: Scalars['String']['input'];
  input: SetTranslationsInput;
}>;


export type SetProductTranslationsMutation = { __typename?: 'Mutation', setProductTranslations: boolean };

export type SetVariantPriceMutationVariables = Exact<{
  variantId: Scalars['String']['input'];
  input: SetPriceInput;
}>;


export type SetVariantPriceMutation = { __typename?: 'Mutation', setVariantPrice: { __typename?: 'IdResultType', id: string } };

export type MediaUploadMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  contentBase64: Scalars['String']['input'];
}>;


export type MediaUploadMutation = { __typename?: 'Mutation', mediaUpload: { __typename?: 'MediaUploadResultType', url: string, filename: string, size: number } };

export type InventoryQueryVariables = Exact<{ [key: string]: never; }>;


export type InventoryQuery = { __typename?: 'Query', inventory: Array<{ __typename?: 'InventoryItemType', variant_id: string, sku: string, location_id: string, on_hand: number, reserved: number, reorder_point: number, available: number }> };

export type InventoryLowStockQueryVariables = Exact<{ [key: string]: never; }>;


export type InventoryLowStockQuery = { __typename?: 'Query', inventoryLowStock: Array<{ __typename?: 'LowStockItemType', variant_id: string, sku: string, on_hand: number, reserved: number, reorder_point: number }> };

export type InventoryAdjustMutationVariables = Exact<{
  input: AdjustInventoryInput;
}>;


export type InventoryAdjustMutation = { __typename?: 'Mutation', inventoryAdjust: { __typename?: 'InventoryAdjustResultType', on_hand: number } };

export type LocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type LocationsQuery = { __typename?: 'Query', locations: Array<{ __typename?: 'LocationType', id: string, name: string, is_default: boolean }> };

export type CreateLocationMutationVariables = Exact<{
  input: CreateLocationInputType;
}>;


export type CreateLocationMutation = { __typename?: 'Mutation', createLocation: { __typename?: 'CreateLocationResultType', id: string } };

export type OrdersQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrdersQuery = { __typename?: 'Query', orders: Array<{ __typename?: 'OrderListItemType', id: string, number: string, email: string, currency: string, status: string, financial_status: string, fulfillment_status: string, total_minor: number, placed_at: string }> };

export type OrderQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OrderQuery = { __typename?: 'Query', order: { __typename?: 'OrderDetailType', order: { __typename?: 'OrderSummaryType', id: string, number: string, email: string, currency: string, status: string, financial_status: string, fulfillment_status: string, subtotal_minor: number, tax_minor: number, shipping_minor: number, total_minor: number, placed_at: string }, lines: Array<{ __typename?: 'OrderLineType', sku: string, title: string, quantity: number, unit_price_minor: number, total_minor: number }>, payments: Array<{ __typename?: 'OrderPaymentType', provider: string, status: string, amount_minor: number }>, fulfillments: Array<{ __typename?: 'OrderFulfillmentType', status: string, tracking_number?: string | null, carrier?: string | null }>, refunds: Array<{ __typename?: 'OrderRefundType', amount_minor: number, reason?: string | null, status: string }> } };

export type CancelOrderMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type CancelOrderMutation = { __typename?: 'Mutation', cancelOrder: boolean };

export type RefundOrderMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: RefundOrderInput;
}>;


export type RefundOrderMutation = { __typename?: 'Mutation', refundOrder: { __typename?: 'RefundResultType', id: string } };

export type FulfillOrderMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: FulfillOrderInput;
}>;


export type FulfillOrderMutation = { __typename?: 'Mutation', fulfillOrder: { __typename?: 'FulfillResultType', id: string } };

export type DiscountCodesQueryVariables = Exact<{ [key: string]: never; }>;


export type DiscountCodesQuery = { __typename?: 'Query', discountCodes: Array<{ __typename?: 'DiscountCodeType', id: string, code: string, used_count: number, usage_limit?: number | null, status: string, action: any }> };

export type CreateDiscountCodeMutationVariables = Exact<{
  input: CreateDiscountCodeInputType;
}>;


export type CreateDiscountCodeMutation = { __typename?: 'Mutation', createDiscountCode: { __typename?: 'CreateDiscountCodeResultType', id: string } };

export type ReportSalesQueryVariables = Exact<{
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
}>;


export type ReportSalesQuery = { __typename?: 'Query', reportSales: { __typename?: 'SalesReportType', orders_count: number, revenue_minor: number, aov_minor: number } };

export type ReportTopProductsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ReportTopProductsQuery = { __typename?: 'Query', reportTopProducts: Array<{ __typename?: 'TopProductType', sku: string, title: string, units: number, revenue_minor: number }> };

export type ReportInventoryQueryVariables = Exact<{ [key: string]: never; }>;


export type ReportInventoryQuery = { __typename?: 'Query', reportInventory: { __typename?: 'InventoryReportType', skus: number, total_on_hand: number, total_reserved: number, low_stock: number } };

export type AdminStoresQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminStoresQuery = { __typename?: 'Query', adminStores: Array<{ __typename?: 'StoreType', id: string, slug: string, name: string, status: string, default_locale: string, default_currency: string }> };

export type CreateStoreMutationVariables = Exact<{
  input: CreateStoreInputType;
}>;


export type CreateStoreMutation = { __typename?: 'Mutation', createStore: { __typename?: 'CreateStoreResultType', id: string } };

export type UpdateStoreMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateStoreInputType;
}>;


export type UpdateStoreMutation = { __typename?: 'Mutation', updateStore: boolean };

export type OrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationsQuery = { __typename?: 'Query', organizations: Array<{ __typename?: 'OrganizationType', id: string, name: string, slug: string, plan: string, billing_status: string }> };

export type OperatorSetStoreStatusMutationVariables = Exact<{
  storeId: Scalars['String']['input'];
  status: Scalars['String']['input'];
}>;


export type OperatorSetStoreStatusMutation = { __typename?: 'Mutation', operatorSetStoreStatus: boolean };

export type MoneyFFragment = { __typename?: 'MoneyType', amount_minor: number, currency: string };

export type CartFFragment = { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> };

export type StoreConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type StoreConfigQuery = { __typename?: 'Query', storeConfig: { __typename?: 'StorefrontConfigType', name: string, default_locale: string, default_currency: string, tax_bps: number, locales: Array<string>, currencies: Array<string> } };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'CategoryType', id: string, slug: string, name: string, parent_id?: string | null, position: number }> };

export type ShippingZonesQueryVariables = Exact<{ [key: string]: never; }>;


export type ShippingZonesQuery = { __typename?: 'Query', shippingZones: Array<{ __typename?: 'ShippingZoneType', id: string, governorate: string, name: string, cod_available: boolean, eta_days?: number | null, enabled: boolean, rate: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> };

export type PaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type PaymentMethodsQuery = { __typename?: 'Query', paymentMethods: Array<{ __typename?: 'PaymentMethodType', method: string, capture: string }> };

export type ProductsQueryVariables = Exact<{
  locale?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  categorySlug?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductsQuery = { __typename?: 'Query', products: Array<{ __typename?: 'StorefrontProductType', id: string, slug: string, title: string, type: string, status: string, from_price?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null }> };

export type SearchProductsQueryVariables = Exact<{
  q: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
}>;


export type SearchProductsQuery = { __typename?: 'Query', searchProducts: Array<{ __typename?: 'StorefrontProductType', id: string, slug: string, title: string, type: string, from_price?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null }> };

export type ProductQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductQuery = { __typename?: 'Query', product?: { __typename?: 'ProductDetailType', id: string, slug: string, title: string, subtitle?: string | null, description?: string | null, type: string, requires_shipping: boolean, service_duration_minutes?: number | null, service_location?: string | null, vendor?: string | null, tags: Array<string>, status: string, currency: string, locale: string, seo_title?: string | null, seo_description?: string | null, category?: { __typename?: 'CategoryRefType', id: string, slug: string, name: string } | null, images: Array<{ __typename?: 'ProductImageType', id: string, url: string, alt?: string | null, position: number }>, options: Array<{ __typename?: 'ProductOptionType', name: string, values: Array<string> }>, variants: Array<{ __typename?: 'VariantDetailType', id: string, sku: string, option_values: any, price?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null, compare_at?: { __typename?: 'MoneyType', amount_minor: number, currency: string } | null }> } | null };

export type CartQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type CartQuery = { __typename?: 'Query', cart: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CreateCartMutationVariables = Exact<{
  input?: InputMaybe<CreateCartInputType>;
}>;


export type CreateCartMutation = { __typename?: 'Mutation', createCart: { __typename?: 'CartRefType', id: string, currency: string } };

export type CartAddLineMutationVariables = Exact<{
  cartId: Scalars['String']['input'];
  input: AddLineInputType;
}>;


export type CartAddLineMutation = { __typename?: 'Mutation', cartAddLine: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CartUpdateLineMutationVariables = Exact<{
  cartId: Scalars['String']['input'];
  lineId: Scalars['String']['input'];
  input: UpdateLineInputType;
}>;


export type CartUpdateLineMutation = { __typename?: 'Mutation', cartUpdateLine: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CartRemoveLineMutationVariables = Exact<{
  cartId: Scalars['String']['input'];
  lineId: Scalars['String']['input'];
}>;


export type CartRemoveLineMutation = { __typename?: 'Mutation', cartRemoveLine: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CartApplyDiscountMutationVariables = Exact<{
  cartId: Scalars['String']['input'];
  input: ApplyDiscountInputType;
}>;


export type CartApplyDiscountMutation = { __typename?: 'Mutation', cartApplyDiscount: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CartRemoveDiscountMutationVariables = Exact<{
  cartId: Scalars['String']['input'];
}>;


export type CartRemoveDiscountMutation = { __typename?: 'Mutation', cartRemoveDiscount: { __typename?: 'CartType', id: string, currency: string, status: string, discount_code?: string | null, subtotal: { __typename?: 'MoneyType', amount_minor: number, currency: string }, discount: { __typename?: 'MoneyType', amount_minor: number, currency: string }, total: { __typename?: 'MoneyType', amount_minor: number, currency: string }, lines: Array<{ __typename?: 'CartLineType', id: string, variant_id: string, sku: string, title: string, quantity: number, unit_price: { __typename?: 'MoneyType', amount_minor: number, currency: string }, line_total: { __typename?: 'MoneyType', amount_minor: number, currency: string } }> } };

export type CheckoutCompleteMutationVariables = Exact<{
  input: CompleteCheckoutInputType;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
}>;


export type CheckoutCompleteMutation = { __typename?: 'Mutation', checkoutComplete: { __typename?: 'OrderType', id: string, number: string, email: string, currency: string, status: string, financial_status: string, fulfillment_status: string, subtotal: number, tax: number, shipping: number, total: number, lines: Array<{ __typename?: 'CheckoutOrderLineType', sku: string, title: string, quantity: number, unit_price_minor: number, total_minor: number }> } };

export type CustomerRegisterMutationVariables = Exact<{
  input: RegisterGqlInput;
}>;


export type CustomerRegisterMutation = { __typename?: 'Mutation', customerRegister: { __typename?: 'CustomerSessionType', access: string, expiresIn: number, customer: { __typename?: 'CustomerSummaryType', id: string, email: string, name?: string | null } } };

export type CustomerLoginMutationVariables = Exact<{
  input: CustomerLoginGqlInput;
}>;


export type CustomerLoginMutation = { __typename?: 'Mutation', customerLogin: { __typename?: 'CustomerSessionType', access: string, expiresIn: number, customer: { __typename?: 'CustomerSummaryType', id: string, email: string, name?: string | null } } };

export type AccountProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountProfileQuery = { __typename?: 'Query', accountProfile: { __typename?: 'CustomerProfileType', id: string, email: string, name?: string | null, locale: string, accepts_marketing: boolean } };

export type AccountUpdateProfileMutationVariables = Exact<{
  input: UpdateProfileGqlInput;
}>;


export type AccountUpdateProfileMutation = { __typename?: 'Mutation', accountUpdateProfile: boolean };

export type AccountAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountAddressesQuery = { __typename?: 'Query', accountAddresses: Array<{ __typename?: 'CustomerAddressType', id: string, name?: string | null, line1: string, line2?: string | null, city: string, region?: string | null, postal_code?: string | null, country: string, phone?: string | null, is_default: boolean }> };

export type AccountAddAddressMutationVariables = Exact<{
  input: AddressGqlInput;
}>;


export type AccountAddAddressMutation = { __typename?: 'Mutation', accountAddAddress: { __typename?: 'AddressIdType', id: string } };

export type AccountRemoveAddressMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type AccountRemoveAddressMutation = { __typename?: 'Mutation', accountRemoveAddress: boolean };

export const PrincipalFFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]} as unknown as DocumentNode<PrincipalFFragment, unknown>;
export const AuthPayloadFFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthPayloadF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthPayloadType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"principal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrincipalF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]} as unknown as DocumentNode<AuthPayloadFFragment, unknown>;
export const MoneyFFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<MoneyFFragment, unknown>;
export const CartFFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<CartFFragment, unknown>;
export const StaffLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StaffLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staffLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthPayloadF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthPayloadF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthPayloadType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"principal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrincipalF"}}]}}]}}]} as unknown as DocumentNode<StaffLoginMutation, StaffLoginMutationVariables>;
export const StaffRegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StaffRegister"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignupInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staffRegister"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthPayloadF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthPayloadF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthPayloadType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"principal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrincipalF"}}]}}]}}]} as unknown as DocumentNode<StaffRegisterMutation, StaffRegisterMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AuthPayloadF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AuthPayloadF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AuthPayloadType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"refresh_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"principal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrincipalF"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrincipalF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrincipalF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrincipalType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization_id"}},{"kind":"Field","name":{"kind":"Name","value":"store_ids"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const AdminProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminProductsQuery, AdminProductsQueryVariables>;
export const AdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"requires_shipping"}},{"kind":"Field","name":{"kind":"Name","value":"service_duration_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"service_location"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"seo_title"}},{"kind":"Field","name":{"kind":"Name","value":"seo_description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"translations"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"option_values"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compare_at"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AdminProductQuery, AdminProductQueryVariables>;
export const AdminPriceListsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPriceLists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminPriceLists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<AdminPriceListsQuery, AdminPriceListsQueryVariables>;
export const AdminCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]} as unknown as DocumentNode<AdminCategoriesQuery, AdminCategoriesQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const AdminShippingZonesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminShippingZones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingZones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"governorate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cod_available"}},{"kind":"Field","name":{"kind":"Name","value":"eta_days"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<AdminShippingZonesQuery, AdminShippingZonesQueryVariables>;
export const CreateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductMutation, DeleteProductMutationVariables>;
export const AddProductOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddProductOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddOptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addProductOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddProductOptionMutation, AddProductOptionMutationVariables>;
export const GenerateVariantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateVariants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateVariants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"created"}}]}}]}}]} as unknown as DocumentNode<GenerateVariantsMutation, GenerateVariantsMutationVariables>;
export const AddProductImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddProductImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddImageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addProductImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AddProductImageMutation, AddProductImageMutationVariables>;
export const RemoveProductImageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveProductImage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeProductImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"imageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"imageId"}}}]}]}}]} as unknown as DocumentNode<RemoveProductImageMutation, RemoveProductImageMutationVariables>;
export const SetProductTranslationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetProductTranslations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetTranslationsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setProductTranslations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SetProductTranslationsMutation, SetProductTranslationsMutationVariables>;
export const SetVariantPriceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetVariantPrice"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetPriceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setVariantPrice"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"variantId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"variantId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SetVariantPriceMutation, SetVariantPriceMutationVariables>;
export const MediaUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MediaUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentBase64"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mediaUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentBase64"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentBase64"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"filename"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<MediaUploadMutation, MediaUploadMutationVariables>;
export const InventoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Inventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"location_id"}},{"kind":"Field","name":{"kind":"Name","value":"on_hand"}},{"kind":"Field","name":{"kind":"Name","value":"reserved"}},{"kind":"Field","name":{"kind":"Name","value":"reorder_point"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]} as unknown as DocumentNode<InventoryQuery, InventoryQueryVariables>;
export const InventoryLowStockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InventoryLowStock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inventoryLowStock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"on_hand"}},{"kind":"Field","name":{"kind":"Name","value":"reserved"}},{"kind":"Field","name":{"kind":"Name","value":"reorder_point"}}]}}]}}]} as unknown as DocumentNode<InventoryLowStockQuery, InventoryLowStockQueryVariables>;
export const InventoryAdjustDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InventoryAdjust"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdjustInventoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inventoryAdjust"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"on_hand"}}]}}]}}]} as unknown as DocumentNode<InventoryAdjustMutation, InventoryAdjustMutationVariables>;
export const LocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]} as unknown as DocumentNode<LocationsQuery, LocationsQueryVariables>;
export const CreateLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLocationInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateLocationMutation, CreateLocationMutationVariables>;
export const OrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Orders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"financial_status"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillment_status"}},{"kind":"Field","name":{"kind":"Name","value":"total_minor"}},{"kind":"Field","name":{"kind":"Name","value":"placed_at"}}]}}]}}]} as unknown as DocumentNode<OrdersQuery, OrdersQueryVariables>;
export const OrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Order"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"financial_status"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillment_status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal_minor"}},{"kind":"Field","name":{"kind":"Name","value":"tax_minor"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_minor"}},{"kind":"Field","name":{"kind":"Name","value":"total_minor"}},{"kind":"Field","name":{"kind":"Name","value":"placed_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price_minor"}},{"kind":"Field","name":{"kind":"Name","value":"total_minor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fulfillments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_number"}},{"kind":"Field","name":{"kind":"Name","value":"carrier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"refunds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const CancelOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<CancelOrderMutation, CancelOrderMutationVariables>;
export const RefundOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefundOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefundOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refundOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<RefundOrderMutation, RefundOrderMutationVariables>;
export const FulfillOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FulfillOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FulfillOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fulfillOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<FulfillOrderMutation, FulfillOrderMutationVariables>;
export const DiscountCodesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiscountCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"discountCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"used_count"}},{"kind":"Field","name":{"kind":"Name","value":"usage_limit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"action"}}]}}]}}]} as unknown as DocumentNode<DiscountCodesQuery, DiscountCodesQueryVariables>;
export const CreateDiscountCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDiscountCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDiscountCodeInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDiscountCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateDiscountCodeMutation, CreateDiscountCodeMutationVariables>;
export const ReportSalesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReportSales"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportSales"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders_count"}},{"kind":"Field","name":{"kind":"Name","value":"revenue_minor"}},{"kind":"Field","name":{"kind":"Name","value":"aov_minor"}}]}}]}}]} as unknown as DocumentNode<ReportSalesQuery, ReportSalesQueryVariables>;
export const ReportTopProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReportTopProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportTopProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"units"}},{"kind":"Field","name":{"kind":"Name","value":"revenue_minor"}}]}}]}}]} as unknown as DocumentNode<ReportTopProductsQuery, ReportTopProductsQueryVariables>;
export const ReportInventoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReportInventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportInventory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"skus"}},{"kind":"Field","name":{"kind":"Name","value":"total_on_hand"}},{"kind":"Field","name":{"kind":"Name","value":"total_reserved"}},{"kind":"Field","name":{"kind":"Name","value":"low_stock"}}]}}]}}]} as unknown as DocumentNode<ReportInventoryQuery, ReportInventoryQueryVariables>;
export const AdminStoresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminStores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminStores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"default_locale"}},{"kind":"Field","name":{"kind":"Name","value":"default_currency"}}]}}]}}]} as unknown as DocumentNode<AdminStoresQuery, AdminStoresQueryVariables>;
export const CreateStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStoreInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateStoreMutation, CreateStoreMutationVariables>;
export const UpdateStoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStoreInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UpdateStoreMutation, UpdateStoreMutationVariables>;
export const OrganizationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"billing_status"}}]}}]}}]} as unknown as DocumentNode<OrganizationsQuery, OrganizationsQueryVariables>;
export const OperatorSetStoreStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OperatorSetStoreStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operatorSetStoreStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}]}}]} as unknown as DocumentNode<OperatorSetStoreStatusMutation, OperatorSetStoreStatusMutationVariables>;
export const StoreConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"default_locale"}},{"kind":"Field","name":{"kind":"Name","value":"default_currency"}},{"kind":"Field","name":{"kind":"Name","value":"tax_bps"}},{"kind":"Field","name":{"kind":"Name","value":"locales"}},{"kind":"Field","name":{"kind":"Name","value":"currencies"}}]}}]}}]} as unknown as DocumentNode<StoreConfigQuery, StoreConfigQueryVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const ShippingZonesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShippingZones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shippingZones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"governorate"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cod_available"}},{"kind":"Field","name":{"kind":"Name","value":"eta_days"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<ShippingZonesQuery, ShippingZonesQueryVariables>;
export const PaymentMethodsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"capture"}}]}}]}}]} as unknown as DocumentNode<PaymentMethodsQuery, PaymentMethodsQueryVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currency"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categorySlug"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}},{"kind":"Argument","name":{"kind":"Name","value":"currency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currency"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"categorySlug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categorySlug"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"from_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currency"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}},{"kind":"Argument","name":{"kind":"Name","value":"currency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currency"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"from_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const ProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Product"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"currency"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"locale"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}},{"kind":"Argument","name":{"kind":"Name","value":"currency"},"value":{"kind":"Variable","name":{"kind":"Name","value":"currency"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"requires_shipping"}},{"kind":"Field","name":{"kind":"Name","value":"service_duration_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"service_location"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"seo_title"}},{"kind":"Field","name":{"kind":"Name","value":"seo_description"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"position"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"option_values"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compare_at"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]} as unknown as DocumentNode<ProductQuery, ProductQueryVariables>;
export const CartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartQuery, CartQueryVariables>;
export const CreateCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCartInputType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}}]}}]} as unknown as DocumentNode<CreateCartMutation, CreateCartMutationVariables>;
export const CartAddLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CartAddLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddLineInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartAddLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartAddLineMutation, CartAddLineMutationVariables>;
export const CartUpdateLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CartUpdateLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateLineInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartUpdateLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartUpdateLineMutation, CartUpdateLineMutationVariables>;
export const CartRemoveLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CartRemoveLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartRemoveLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lineId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartRemoveLineMutation, CartRemoveLineMutationVariables>;
export const CartApplyDiscountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CartApplyDiscount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplyDiscountInputType"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartApplyDiscount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartApplyDiscountMutation, CartApplyDiscountMutationVariables>;
export const CartRemoveDiscountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CartRemoveDiscount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartRemoveDiscount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cartId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cartId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartF"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoneyF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoneyType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount_minor"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartF"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"discount_code"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}},{"kind":"Field","name":{"kind":"Name","value":"line_total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoneyF"}}]}}]}}]}}]} as unknown as DocumentNode<CartRemoveDiscountMutation, CartRemoveDiscountMutationVariables>;
export const CheckoutCompleteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CheckoutComplete"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteCheckoutInputType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutComplete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"idempotencyKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idempotencyKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"financial_status"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillment_status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"tax"}},{"kind":"Field","name":{"kind":"Name","value":"shipping"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price_minor"}},{"kind":"Field","name":{"kind":"Name","value":"total_minor"}}]}}]}}]}}]} as unknown as DocumentNode<CheckoutCompleteMutation, CheckoutCompleteMutationVariables>;
export const CustomerRegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CustomerRegister"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterGqlInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerRegister"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerRegisterMutation, CustomerRegisterMutationVariables>;
export const CustomerLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CustomerLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLoginGqlInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerLoginMutation, CustomerLoginMutationVariables>;
export const AccountProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"accepts_marketing"}}]}}]}}]} as unknown as DocumentNode<AccountProfileQuery, AccountProfileQueryVariables>;
export const AccountUpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountUpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileGqlInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountUpdateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AccountUpdateProfileMutation, AccountUpdateProfileMutationVariables>;
export const AccountAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AccountAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"postal_code"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]} as unknown as DocumentNode<AccountAddressesQuery, AccountAddressesQueryVariables>;
export const AccountAddAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountAddAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressGqlInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountAddAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<AccountAddAddressMutation, AccountAddAddressMutationVariables>;
export const AccountRemoveAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AccountRemoveAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accountRemoveAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AccountRemoveAddressMutation, AccountRemoveAddressMutationVariables>;