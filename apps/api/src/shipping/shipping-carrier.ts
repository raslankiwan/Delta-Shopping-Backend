/**
 * Provider-agnostic shipping/courier port. Fulfillment depends only on this
 * interface, so couriers (Wassel and other West Bank last-mile services) drop in
 * without touching order logic. Rate *quoting* is separate (see ShippingService);
 * this port is about handing a shipment to a carrier and getting tracking back.
 */
export interface ShipmentInput {
  orderRef: string;
  governorate: string;
  addressLine: string;
  phone?: string;
  codAmountMinor?: number;
  currency: string;
}
export interface ShipmentResult {
  trackingNumber: string;
  carrier: string;
}

export interface ShippingCarrier {
  readonly name: string;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
}

/** Manual/self-delivery: no external call, tracking assigned by staff later. */
export class ManualCarrier implements ShippingCarrier {
  readonly name = 'manual';
  async createShipment(_input: ShipmentInput): Promise<ShipmentResult> {
    return { trackingNumber: '', carrier: this.name };
  }
}

/**
 * Wassel (وصّل) West Bank courier adapter — skeleton. Wired when WASSEL_API_KEY is
 * set; fails loudly until the Wassel API is integrated rather than silently no-op.
 */
export class WasselCarrier implements ShippingCarrier {
  readonly name = 'wassel';
  constructor(private readonly apiKey: string) {}
  async createShipment(_input: ShipmentInput): Promise<ShipmentResult> {
    throw new Error('WasselCarrier not implemented yet — integrate the Wassel courier API.');
  }
}
