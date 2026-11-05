import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card } from "../../../components/ui/Card";
import {
  DashboardOrdersTable,
  type DashboardOrderRow,
} from "../../../components/dashboard/DashboardOrdersTable";
import { getCurrentUser } from "@/lib/server/auth/session";
import { getCustomerOrders } from "@/lib/server/woocommerce/orders";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let orders: Awaited<ReturnType<typeof getCustomerOrders>> = [];
  let ordersError = false;

  if (user.woocommerceCustomerId) {
    try {
      orders = await getCustomerOrders(user.woocommerceCustomerId);
    } catch (error) {
      console.error("DASHBOARD_ORDERS_FETCH_ERROR:", error);
      ordersError = true;
    }
  }

  const orderRows: DashboardOrderRow[] = orders.map((order) => ({
    id: order.id,
    date: new Date(order.date_created).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    itemCount: (order.line_items ?? []).reduce(
      (total, item) => total + item.quantity,
      0
    ),
    currency: order.currency,
    total: order.total,
    status: order.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
        <p className="mt-1 text-primary-400">
          Track production and shipping status for every order.
        </p>
      </div>

      <Card className="overflow-hidden">
        {ordersError ? (
          <div className="px-6 py-12 text-center text-primary-400" role="status">
            Your orders are temporarily unavailable. Please try again later.
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-primary-400">
              You don&apos;t have any orders yet.
            </p>
          </div>
        ) : (
          <DashboardOrdersTable orders={orderRows} />
        )}
      </Card>
    </div>
  );
}