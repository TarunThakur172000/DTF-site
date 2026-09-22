import "server-only";

import { wooCommerceRequest } from "./client";

export interface WooCustomerAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;

  billing: WooCustomerAddress;
  shipping: WooCustomerAddress;
}

interface CreateWooCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export async function findWooCustomerByEmail(
  email: string
): Promise<WooCustomer | null> {
  const customers = await wooCommerceRequest<WooCustomer[]>(
    `/customers?email=${encodeURIComponent(email)}`
  );

  return customers.length > 0 ? customers[0] : null;
}

export async function getWooCustomer(
  customerId: number
): Promise<WooCustomer> {
  return wooCommerceRequest<WooCustomer>(
    `/customers/${customerId}`
  );
}

export async function updateWooCustomer(
  customerId: number,
  data: {
    billing?: WooCustomerAddress;
    shipping?: WooCustomerAddress;
  }
): Promise<WooCustomer> {
  return wooCommerceRequest<WooCustomer>(
    `/customers/${customerId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function createWooCustomer(
  data: CreateWooCustomerInput
): Promise<WooCustomer> {
  return wooCommerceRequest<WooCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      username: data.email,
      first_name: data.firstName,
      last_name: data.lastName,

      billing: {
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.businessName || "",
        email: data.email,
      },

      shipping: {
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.businessName || "",
      },
    }),
  });
}