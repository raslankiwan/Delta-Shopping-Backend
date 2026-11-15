import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { address, customer, withStore, type DbHandle } from '@mercato/db';
import { DB_HANDLE } from '../db/database.module';
import { isUniqueViolation } from '../common/pg-errors';
import { hashPassword, verifyPassword } from '../auth/password';
import { signCustomerToken } from '../auth/jwt';
import type { AddressInput, CustomerLoginInput, RegisterInput, UpdateProfileInput } from './dto';

export interface CustomerSession {
  access: string;
  expiresIn: number;
  customer: { id: string; email: string; name: string | null };
}

@Injectable()
export class CustomersService {
  constructor(@Inject(DB_HANDLE) private readonly app: DbHandle) {}

  async register(storeId: string, input: RegisterInput): Promise<CustomerSession> {
    const passwordHash = await hashPassword(input.password);
    let row;
    try {
      row = await withStore(this.app.db, storeId, async (tx) => {
        const [c] = await tx
          .insert(customer)
          .values({
            storeId,
            email: input.email,
            passwordHash,
            name: input.name,
            acceptsMarketing: input.acceptsMarketing ?? false,
          })
          .returning({ id: customer.id, email: customer.email, name: customer.name });
        return c!;
      });
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException({ code: 'email_taken', detail: 'That email is already registered.' });
      }
      throw e;
    }
    return this.session(storeId, row);
  }

  async login(storeId: string, input: CustomerLoginInput): Promise<CustomerSession> {
    const invalid = () =>
      new UnauthorizedException({ code: 'invalid_credentials', detail: 'Invalid email or password.' });
    const row = await withStore(this.app.db, storeId, async (tx) => {
      const [c] = await tx
        .select({ id: customer.id, email: customer.email, name: customer.name, hash: customer.passwordHash, status: customer.status })
        .from(customer)
        .where(eq(customer.email, input.email))
        .limit(1);
      return c;
    });
    if (!row || row.status !== 'active' || !row.hash) {
      await hashPassword(input.password);
      throw invalid();
    }
    if (!(await verifyPassword(input.password, row.hash))) throw invalid();
    return this.session(storeId, { id: row.id, email: row.email, name: row.name });
  }

  getProfile(storeId: string, customerId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const [c] = await tx
        .select({
          id: customer.id,
          email: customer.email,
          name: customer.name,
          locale: customer.locale,
          accepts_marketing: customer.acceptsMarketing,
        })
        .from(customer)
        .where(eq(customer.id, customerId))
        .limit(1);
      if (!c) throw new NotFoundException({ code: 'customer_not_found', detail: 'Account not found.' });
      return c;
    });
  }

  async updateProfile(storeId: string, customerId: string, input: UpdateProfileInput): Promise<void> {
    await withStore(this.app.db, storeId, async (tx) => {
      await tx
        .update(customer)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(customer.id, customerId));
    });
  }

  listAddresses(storeId: string, customerId: string) {
    return withStore(this.app.db, storeId, async (tx) => {
      const rows = await tx
        .select({
          id: address.id,
          name: address.name,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          region: address.region,
          postal_code: address.postalCode,
          country: address.country,
          phone: address.phone,
          is_default: address.isDefault,
        })
        .from(address)
        .where(eq(address.customerId, customerId));
      return { data: rows };
    });
  }

  async addAddress(storeId: string, customerId: string, input: AddressInput): Promise<{ id: string }> {
    return withStore(this.app.db, storeId, async (tx) => {
      if (input.isDefault) {
        await tx.update(address).set({ isDefault: false }).where(eq(address.customerId, customerId));
      }
      const [row] = await tx
        .insert(address)
        .values({ storeId, customerId, ...input })
        .returning({ id: address.id });
      return { id: row!.id };
    });
  }

  async deleteAddress(storeId: string, customerId: string, addressId: string): Promise<void> {
    await withStore(this.app.db, storeId, async (tx) => {
      await tx.delete(address).where(and(eq(address.id, addressId), eq(address.customerId, customerId)));
    });
  }

  private async session(
    storeId: string,
    c: { id: string; email: string; name: string | null },
  ): Promise<CustomerSession> {
    const { token, expiresIn } = await signCustomerToken({ customerId: c.id, storeId });
    return { access: token, expiresIn, customer: c };
  }
}
