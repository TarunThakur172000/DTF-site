import Link from "next/link";
import {
  Package,
  Clock3,
  ArrowUpRight,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/dashboard/StatusBadge";

import { getCurrentUser } from "@/lib/server/auth/session";
import { connectDB } from "@/lib/server/db";
import Order from "@/models/Order";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connectDB();

  /*
   * Get all orders belonging to the logged-in user.
   *
   * IMPORTANT:
   * We use user._id from the authenticated session.
   * We never accept a userId/customerId from the browser.
   */
  const orders = await Order.find({
    userId: user._id,
  })
    .sort({ dateCreated: -1 })
    .lean();

  /*
   * Dashboard statistics
   */
  const totalOrders = orders.length;

  const processingOrders = orders.filter(
    (order) => order.status === "processing"
  ).length;

  /*
   * Get only the latest 3 orders for the dashboard.
   */
  const recentOrders = orders.slice(0, 3);

  const stats = [
    {
      label: "Orders in Production",
      value: processingOrders,
      icon: Clock3,
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>

        <p className="text-primary-400 mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600">
              <stat.icon size={18} />
            </span>

            <p className="mt-4 text-2xl font-bold text-primary-900">
              {stat.value}
            </p>

            <p className="text-sm text-primary-400 mt-0.5">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">
            Recent Orders
          </h2>

          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-accent-600 hover:underline flex items-center gap-1"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center">
              <Package
                size={28}
                className="mx-auto text-primary-300"
              />

              <p className="mt-3 text-sm text-primary-400">
                You don&apos;t have any orders yet.
              </p>

              <Link
                href="/shop"
                className="inline-block mt-4 text-sm font-semibold text-accent-600 hover:underline"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-primary-400 border-b border-primary-50">
                  <th className="pb-3 font-medium">
                    Order
                  </th>

                  <th className="pb-3 font-medium">
                    Date
                  </th>

                  <th className="pb-3 font-medium">
                    Items
                  </th>

                  <th className="pb-3 font-medium">
                    Total
                  </th>

                  <th className="pb-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-primary-50">
                {recentOrders.map((order) => (
                  <tr key={order._id.toString()}>
                    <td className="py-3.5 font-medium text-primary-900">
                      #{order.wooCommerceOrderId}
                    </td>

                    <td className="py-3.5 text-primary-400">
                      {new Date(
                        order.dateCreated
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 text-primary-400">
                      {order.lineItems.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </td>

                    <td className="py-3.5 font-medium text-primary-900">
                      {order.currency}{" "}
                      {Number(order.total).toFixed(2)}
                    </td>

                    <td className="py-3.5">
                      <StatusBadge
                        status={order.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

