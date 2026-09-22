import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card } from "../../../components/ui/Card";
import { StatusBadge } from "../../../components/dashboard/StatusBadge";

import { getCurrentUser } from "@/lib/server/auth/session";
import { connectDB } from "@/lib/server/db";
import Order from "@/models/Order";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connectDB();

  /*
   * Only fetch orders belonging to the logged-in user.
   *
   * We use MongoDB userId instead of accepting a
   * customer ID from the browser.
   */
  const orders = await Order.find({
    userId: user._id,
  })
    .sort({ dateCreated: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Your Orders
        </h1>

        <p className="text-primary-400 mt-1">
          Track production and shipping status for every order.
        </p>
      </div>

      <Card className="overflow-hidden">
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-primary-400">
              You don&apos;t have any orders yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-primary-400 border-b border-primary-50 bg-surfaceMuted">
                  <th className="px-6 py-3.5 font-medium">
                    Order
                  </th>

                  <th className="px-6 py-3.5 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-3.5 font-medium">
                    Items
                  </th>

                  <th className="px-6 py-3.5 font-medium">
                    Total
                  </th>

                  <th className="px-6 py-3.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-primary-50">
                {orders.map((order) => {
                  const itemCount = order.lineItems.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  );

                  return (
                    <tr
                      key={order._id.toString()}
                      className="hover:bg-surfaceMuted/60"
                    >
                      <td className="px-6 py-4 font-medium text-primary-900">
                        #{order.wooCommerceOrderId}
                      </td>

                      <td className="px-6 py-4 text-primary-400">
                        {new Date(
                          order.dateCreated
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-primary-400">
                        {itemCount}
                      </td>

                      <td className="px-6 py-4 font-medium text-primary-900">
                        {order.currency}{" "}
                        {Number(order.total).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={order.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

