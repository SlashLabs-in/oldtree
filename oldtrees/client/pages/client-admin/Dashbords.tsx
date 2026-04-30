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
import Sidebar, { TabType } from "./sidebar";
import Header from "@/components/client_Ui/Header";
// ─── Types ─────────────────────────────────────────────────

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

// ─── Status Config ─────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
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

// ─── Components ────────────────────────────────────────────

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

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md">
      <div className="flex justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>

      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="py-16 text-center">
      <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-3" />
      <p className="text-slate-600">No orders yet</p>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────

export default function DashboardPage() {
  const { tenantId } = useTenant();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");

  // ── Fetch ───────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientAdminDashboard(tenantId || undefined);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Stats ───────────────────────────────────────────────

  const stats = [
    {
      label: "Total Sales",
      value: `₹${(data?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Pending Orders",
      value: data?.pendingOrders || 0,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Customers",
      value: data?.customers || 0,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      label: "Products",
      value: data?.products || 0,
      icon: Package,
      gradient: "from-orange-500 to-amber-600",
    },
  ];

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onLogout={() => console.log("logout")}
        domain="yourstore.com"
        companyName="My Store"
      />

      {/* Main Content */}
      <div
        className={`flex-1 min-h-screen bg-slate-100 p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >

<Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Dashboard"
        />

        {/* Header */}
        {/* <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Overview of your store
            </p>
          </div>

          <Button onClick={fetchDashboard}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div> */}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-5 gap-4 mb-6">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>

            {/* Orders */}
            <div className="bg-white rounded-xl shadow border">
              <div className="p-4 border-b font-semibold">
                Recent Orders
              </div>

              {data?.recentOrders?.length ? (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left">Order</th>
                      <th className="p-3 text-left">Customer</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.recentOrders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-3">{o.order_number}</td>
                        <td className="p-3">{o.customer_name}</td>
                        <td className="p-3">
                          ₹{o.total_amount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyOrders />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}