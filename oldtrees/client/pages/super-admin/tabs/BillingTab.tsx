import { DollarSign } from "lucide-react";

interface BillingTabProps {
  billing: any[];
}

export function BillingTab({ billing }: BillingTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Billing Information
      </h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {billing.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Subscription Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Renewal Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {billing.map((item: any) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {item.company_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {item.billing_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(item.subscription_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.renewal_date
                      ? new Date(item.renewal_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-900">
                    {item.totalOrders || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    ₹{(item.totalRevenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No billing data</p>
          </div>
        )}
      </div>
    </div>
  );
}
