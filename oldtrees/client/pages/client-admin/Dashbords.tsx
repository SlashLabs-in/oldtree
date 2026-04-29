import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getClientAdminDashboard } from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  totalSales: number;
  pendingOrders: number;
  customers: number;
  products: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: CheckCircle2,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-800",
    icon: AlertCircle,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  sub?: string;
}

function StatCard({ label, value, icon: Icon, gradient, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyOrders() {
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <ShoppingCart className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-600 font-medium">No orders yet</p>
      <p className="text-sm text-slate-400 mt-1">
        Orders will appear here as customers place them
      </p>
    </div>
  );
}

// ─── Main DashboardPage ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tenantId } = useTenant();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientAdminDashboard(tenantId || undefined);
      setData(res.data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load dashboard";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Stats config ───────────────────────────────────────────────────────────

  const stats: StatCardProps[] = [
    {
      label: "Total Sales",
      value: `₹${(data?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      sub: "All time revenue",
    },
    {
      label: "Pending Orders",
      value: data?.pendingOrders || 0,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
      sub: "Awaiting action",
    },
    {
      label: "Customers",
      value: data?.customers || 0,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      sub: "Registered accounts",
    },
    {
      label: "Products",
      value: data?.products || 0,
      icon: Package,
      gradient: "from-amber-500 to-orange-600",
      sub: "Active listings",
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <p className="text-slate-500">Welcome back — here's what's happening in your store</p>
        </div>
        <Button variant="outline" onClick={fetchDashboard} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
              <span className="text-xs text-slate-400 font-medium">
                Last 5 orders
              </span>
            </div>

            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["Order #", "Customer", "Amount", "Status", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentOrders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 text-sm">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{(order.total_amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyOrders />
            )}
          </div>

          {/* Quick Stats Summary */}
          {data && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Order Fulfillment",
                  value:
                    data.recentOrders?.filter((o) => o.status === "delivered")
                      .length || 0,
                  total: data.recentOrders?.length || 0,
                  color: "bg-emerald-500",
                },
                {
                  label: "In Progress",
                  value:
                    data.recentOrders?.filter(
                      (o) => o.status === "processing" || o.status === "shipped"
                    ).length || 0,
                  total: data.recentOrders?.length || 0,
                  color: "bg-blue-500",
                },
                {
                  label: "Pending Review",
                  value:
                    data.recentOrders?.filter((o) => o.status === "pending")
                      .length || 0,
                  total: data.recentOrders?.length || 0,
                  color: "bg-yellow-500",
                },
              ].map((item) => {
                const pct =
                  item.total > 0
                    ? Math.round((item.value / item.total) * 100)
                    : 0;
                return (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-600">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {item.value}/{item.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{pct}% of recent orders</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
