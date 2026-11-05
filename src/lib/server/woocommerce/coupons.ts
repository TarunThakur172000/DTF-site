import "server-only";

import { wooCommerceRequest } from "./client";
import { getProduct, type WooProduct } from "./products";

interface WooCoupon {
  id: number;
  code: string;
  description: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product" | string;
  amount: string;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number;
  usage_limit_per_user: number;
  minimum_amount: string;
  maximum_amount: string;
  product_ids: number[];
  excluded_product_ids: number[];
  product_categories: number[];
  excluded_product_categories: number[];
  email_restrictions: string[];
  exclude_sale_items: boolean;
}

interface WooOrderCouponUsage {
  status: string;
  billing?: { email?: string };
  coupon_lines?: { code: string }[];
}

type CartProduct = WooProduct & { quantity: number };

export interface CheckoutCoupon {
  code: string;
  description: string;
  discountLabel: string;
}

function isCouponAvailable(
  coupon: WooCoupon,
  products: CartProduct[],
  email: string
) {
  const expiresAt = coupon.date_expires
    ? Date.parse(coupon.date_expires)
    : null;
  if (
    !coupon.code ||
    !Number.isFinite(Number(coupon.amount)) ||
    Number(coupon.amount) <= 0 ||
    !["percent", "fixed_cart", "fixed_product"].includes(
      coupon.discount_type
    ) ||
    (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) ||
    (expiresAt !== null &&
      (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) ||
    (coupon.usage_limit_per_user > 0 && !email)
  ) {
    return false;
  }

  if (
    coupon.email_restrictions.length &&
    !coupon.email_restrictions.some((restriction) => {
      const allowed = restriction.toLowerCase();
      const customerEmail = email.toLowerCase();
      return allowed.startsWith("*@")
        ? customerEmail.endsWith(allowed.slice(1))
        : customerEmail === allowed;
    })
  ) {
    return false;
  }

  const eligibleProducts = products.filter((product) => {
    const categoryIds = product.categories.map((category) => category.id);
    return (
      !coupon.excluded_product_ids.includes(product.id) &&
      (!coupon.product_ids.length ||
        coupon.product_ids.includes(product.id)) &&
      (!coupon.product_categories.length ||
        categoryIds.some((id) => coupon.product_categories.includes(id))) &&
      !categoryIds.some((id) =>
        coupon.excluded_product_categories.includes(id)
      ) &&
      !(coupon.exclude_sale_items && product.on_sale)
    );
  });
  if (!eligibleProducts.length) {
    return false;
  }

  const subtotal = products.reduce(
    (total, product) => total + Number(product.price) * product.quantity,
    0
  );
  const minimum = Number(coupon.minimum_amount || 0);
  const maximum = Number(coupon.maximum_amount || 0);
  return (
    Number.isFinite(subtotal) &&
    products.every(
      (product) =>
        Number.isFinite(Number(product.price)) && Number(product.price) >= 0
    ) &&
    Number.isFinite(minimum) &&
    Number.isFinite(maximum) &&
    subtotal > 0 &&
    subtotal >= minimum &&
    (!maximum || subtotal <= maximum)
  );
}

async function getPerUserCouponUsage(email: string) {
  const usage = new Map<string, number>();
  const normalizedEmail = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const orders = await wooCommerceRequest<WooOrderCouponUsage[]>(
      `/orders?search=${encodeURIComponent(email)}&per_page=100&page=${page}`
    );
    if (!Array.isArray(orders)) {
      throw new Error("INVALID_WOOCOMMERCE_ORDERS");
    }
    for (const order of orders) {
      if (
        order.billing?.email?.toLowerCase() !== normalizedEmail ||
        ["cancelled", "failed", "refunded", "trash"].includes(order.status)
      ) {
        continue;
      }
      for (const line of order.coupon_lines ?? []) {
        const code = line.code.toLowerCase();
        usage.set(code, (usage.get(code) ?? 0) + 1);
      }
    }
    if (orders.length < 100) return usage;
  }
  throw new Error("WOOCOMMERCE_ORDER_SEARCH_LIMIT_EXCEEDED");
}

function mapCoupon(coupon: WooCoupon): CheckoutCoupon {
  const amount = Number(coupon.amount);
  const discountLabel =
    coupon.discount_type === "percent" && Number.isFinite(amount)
      ? `${amount}% off`
      : coupon.discount_type.startsWith("fixed_") &&
          Number.isFinite(amount)
        ? "Fixed amount off"
        : "Discount";
  return {
    code: coupon.code,
    description: coupon.description.replace(/<[^>]*>/g, "").trim().slice(0, 300),
    discountLabel,
  };
}

async function getCoupons() {
  const coupons: WooCoupon[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await wooCommerceRequest<WooCoupon[]>(
      `/coupons?per_page=100&page=${page}`
    );
    if (!Array.isArray(batch)) {
      throw new Error("INVALID_WOOCOMMERCE_COUPONS");
    }
    coupons.push(...batch);
    if (batch.length < 100) return coupons;
  }
  throw new Error("WOOCOMMERCE_COUPON_LIST_LIMIT_EXCEEDED");
}

async function getCartProducts(
  productIds: number[]
): Promise<CartProduct[]> {
  return Promise.all(
    [...new Set(productIds)].map(async (id) => {
      const product = await getProduct(String(id));
      return { ...product, quantity: 0 };
    })
  );
}

export async function getAvailableCheckoutCoupons(
  productIds: number[],
  quantities: number[],
  email: string
): Promise<CheckoutCoupon[]> {
  const [coupons, products] = await Promise.all([
    getCoupons(),
    getCartProducts(productIds),
  ]);
  const quantityById = new Map<number, number>();
  productIds.forEach((id, index) => {
    quantityById.set(id, (quantityById.get(id) ?? 0) + quantities[index]);
  });
  const cartProducts = products.map((product) => ({
    ...product,
    quantity: quantityById.get(product.id) ?? 0,
  }));
  const eligibleCoupons = coupons.filter((coupon) =>
    isCouponAvailable(coupon, cartProducts, email)
  );
  const userUsage =
    email && eligibleCoupons.some((coupon) => coupon.usage_limit_per_user > 0)
      ? await getPerUserCouponUsage(email)
      : new Map<string, number>();
  const availableCoupons = eligibleCoupons.filter(
    (coupon) =>
      !coupon.usage_limit_per_user ||
      (userUsage.get(coupon.code.toLowerCase()) ?? 0) <
        coupon.usage_limit_per_user
  );
  return availableCoupons.map(mapCoupon);
}

export async function validateCheckoutCoupon(
  code: string,
  productIds: number[],
  quantities: number[],
  email: string
): Promise<CheckoutCoupon | null> {
  const matchingCoupons = await wooCommerceRequest<WooCoupon[]>(
    `/coupons?code=${encodeURIComponent(code)}`
  );
  if (!Array.isArray(matchingCoupons)) {
    throw new Error("INVALID_WOOCOMMERCE_COUPONS");
  }
  const coupon = matchingCoupons.find(
    (candidate) => candidate.code.toLowerCase() === code.toLowerCase()
  );
  if (!coupon) return null;

  const products = await getCartProducts(productIds);
  const quantityById = new Map<number, number>();
  productIds.forEach((id, index) => {
    quantityById.set(id, (quantityById.get(id) ?? 0) + quantities[index]);
  });
  const cartProducts = products.map((product) => ({
    ...product,
    quantity: quantityById.get(product.id) ?? 0,
  }));
  if (!isCouponAvailable(coupon, cartProducts, email)) return null;
  if (coupon.usage_limit_per_user > 0) {
    const usage = await getPerUserCouponUsage(email);
    if ((usage.get(coupon.code.toLowerCase()) ?? 0) >= coupon.usage_limit_per_user) {
      return null;
    }
  }
  return mapCoupon(coupon);
}
