"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const ORDERS_PER_PAGE = 5;

export interface DashboardOrderRow {
  id: number;
  date: string;
  itemCount: number;
  currency: string;
  total: string;
  status: string;
}

export function DashboardOrdersTable({
  orders,
}: {
  orders: DashboardOrderRow[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const firstOrderIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const visibleOrders = orders.slice(
    firstOrderIndex,
    firstOrderIndex + ORDERS_PER_PAGE
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary-50 bg-surfaceMuted text-left text-primary-400">
              <th className="px-6 py-3.5 font-medium">Order</th>
              <th className="px-6 py-3.5 font-medium">Date</th>
              <th className="px-6 py-3.5 font-medium">Items</th>
              <th className="px-6 py-3.5 font-medium">Total</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {visibleOrders.map((order) => (
              <tr key={order.id} className="hover:bg-surfaceMuted/60">
                <td className="px-6 py-4 font-medium text-primary-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 text-primary-400">{order.date}</td>
                <td className="px-6 py-4 text-primary-400">{order.itemCount}</td>
                <td className="px-6 py-4 font-medium text-primary-900">
                  {order.currency} {Number(order.total).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length > ORDERS_PER_PAGE && (
        <nav
          aria-label="Order pagination"
          className="flex flex-col gap-3 border-t border-primary-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-primary-400" aria-live="polite">
            Showing {firstOrderIndex + 1}–
            {Math.min(firstOrderIndex + ORDERS_PER_PAGE, orders.length)} of{" "}
            {orders.length} orders
          </p>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-100 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-surfaceMuted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <span className="text-sm text-primary-400" aria-current="page">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage === pageCount}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-100 px-3 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-surfaceMuted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
