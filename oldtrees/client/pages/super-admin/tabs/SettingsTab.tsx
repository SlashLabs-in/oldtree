import { ArrowRight } from "lucide-react";

export function SettingsTab() {
  const settings = [
    {
      title: "Email Configuration",
      description: "Configure email service for notifications",
    },
    {
      title: "Payment Gateways",
      description: "Manage payment processor integrations",
    },
    {
      title: "API Configuration",
      description: "Configure API keys and webhooks",
    },
    {
      title: "Security Settings",
      description: "Manage security policies and 2FA",
    },
    {
      title: "Backup & Recovery",
      description: "Configure automated backups",
    },
    {
      title: "System Logs",
      description: "View system logs and audit trails",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Platform Settings
      </h2>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.title}
            className="bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {setting.title}
              </h3>
              <p className="text-slate-600 text-sm">
                {setting.description}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
