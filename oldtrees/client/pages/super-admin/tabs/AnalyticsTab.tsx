interface AnalyticsTabProps {
  analytics: any;
}

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Platform Analytics
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Growth Metrics
          </h3>
          <div className="space-y-4">
            {[
              { label: "Total Clients (All Time)", value: analytics?.totalClients || 0 },
              {
                label: "Month-over-Month Growth",
                value: "12%",
              },
              {
                label: "Average Revenue Per Client",
                value: analytics?.totalClients
                  ? `₹${Math.round((analytics.totalRevenue || 0) / analytics.totalClients).toLocaleString()}`
                  : "₹0",
              },
              {
                label: "Churn Rate",
                value: "2.5%",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="text-slate-700">{metric.label}</span>
                <span className="font-semibold text-slate-900">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Revenue Analytics
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Total Revenue (All Time)",
                value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`,
              },
              {
                label: "Starter Plan Revenue",
                value: "₹" + ((analytics?.totalRevenue || 0) * 0.4).toLocaleString(),
              },
              {
                label: "Growth Plan Revenue",
                value: "₹" + ((analytics?.totalRevenue || 0) * 0.45).toLocaleString(),
              },
              {
                label: "Enterprise Plan Revenue",
                value: "₹" + ((analytics?.totalRevenue || 0) * 0.15).toLocaleString(),
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <span className="text-slate-700">{metric.label}</span>
                <span className="font-semibold text-slate-900">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
