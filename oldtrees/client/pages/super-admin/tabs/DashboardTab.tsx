import { Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface DashboardTabProps {
  analytics: any;
  themes: any[];
}

export function DashboardTab({ analytics, themes }: DashboardTabProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Clients",
            value: analytics?.totalClients || 0,
            icon: Users,
            color: "from-blue-500",
          },
          {
            label: "Active Stores",
            value: analytics?.activeStores || 0,
            icon: TrendingUp,
            color: "from-emerald-500",
          },
          {
            label: "Total Revenue",
            value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "from-amber-500",
          },
          {
            label: "Pending Orders",
            value: analytics?.pendingOrders || 0,
            icon: BarChart3,
            color: "from-purple-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-12 h-12 bg-gradient-to-br ${stat.color} to-purple-600 rounded-lg flex items-center justify-center mb-4`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Top Performing Clients
          </h2>
          {analytics?.topClients && analytics.topClients.length > 0 ? (
            <div className="space-y-4">
              {analytics.topClients.map((client: any) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {client.company_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {client.orderCount || 0} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ₹{(client.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No client data yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Quick Stats
          </h2>
          <div className="space-y-4">
            {[
              { label: "Total Orders", value: analytics?.totalOrders || 0 },
              {
                label: "Average Client Revenue",
                value: analytics?.totalClients
                  ? `₹${Math.round((analytics.totalRevenue || 0) / analytics.totalClients).toLocaleString()}`
                  : "₹0",
              },
              {
                label: "Pending Orders",
                value: analytics?.pendingOrders || 0,
              },
              { label: "Active Themes", value: themes.length },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">
                  {stat.label}
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
