import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  RefreshCw,
  Save,
  Server,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { getEmailSettings, updateEmailSettings } from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailSettingsForm {
  smtp_host: string;
  smtp_port: number | string;
  smtp_username: string;
  smtp_password: string;
  sender_email: string;
  target_email: string;
  email_notify_enabled: boolean;
}

const EMPTY_FORM: EmailSettingsForm = {
  smtp_host: "",
  smtp_port: "",
  smtp_username: "",
  smtp_password: "",
  sender_email: "",
  target_email: "",
  email_notify_enabled: false,
};

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Password Input ───────────────────────────────────────────────────────────

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Provider Presets ─────────────────────────────────────────────────────────

const SMTP_PRESETS = [
  { name: "Gmail", host: "smtp.gmail.com", port: 587 },
  { name: "Outlook", host: "smtp.office365.com", port: 587 },
  { name: "Yahoo", host: "smtp.mail.yahoo.com", port: 587 },
  { name: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
  { name: "Mailgun", host: "smtp.mailgun.org", port: 587 },
  { name: "Zoho", host: "smtp.zoho.com", port: 587 },
];

// ─── Main EmailSettingsPage Component ────────────────────────────────────────

export default function EmailSettingsPage() {
  const { tenantId } = useTenant();

  const [form, setForm] = useState<EmailSettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmailSettings(tenantId || undefined);
      if (data.data) {
        setForm({
          smtp_host: data.data.smtp_host || "",
          smtp_port: data.data.smtp_port || "",
          smtp_username: data.data.smtp_username || "",
          smtp_password: data.data.smtp_password || "",
          sender_email: data.data.sender_email || "",
          target_email: data.data.target_email || "",
          email_notify_enabled: data.data.email_notify_enabled || false,
        });
      }
    } catch (err) {
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEmailSettings(
        { ...form, smtp_port: Number(form.smtp_port) },
        tenantId || undefined
      );
      toast.success("Email settings saved successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save email settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: (typeof SMTP_PRESETS)[0]) => {
    setForm((prev) => ({ ...prev, smtp_host: preset.host, smtp_port: preset.port }));
    toast.success(`Applied ${preset.name} preset`);
  };

  const update = (key: keyof EmailSettingsForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading email settings...</p>
        </div>
      </div>
    );
  }

  const isConfigured = form.smtp_host && form.smtp_username && form.smtp_password && form.sender_email;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Settings</h1>
          <p className="text-slate-500 mt-1">
            Configure SMTP to enable order notifications and customer emails
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Configured
            </div>
          )}
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Quick Presets ── */}
        <SectionCard
          icon={Send}
          title="Quick Setup Presets"
          description="Click a provider to auto-fill host and port settings"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SMTP_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-sm ${
                  form.smtp_host === preset.host
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            💡 For Gmail, use an App Password (not your regular password). Go to Google Account → Security → 2-Step Verification → App passwords.
          </p>
        </SectionCard>

        {/* ── SMTP Configuration ── */}
        <SectionCard
          icon={Server}
          title="SMTP Configuration"
          description="Your outgoing mail server credentials"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 sm:grid sm:grid-cols-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Host</label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={form.smtp_host}
                  onChange={(e) => update("smtp_host", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Port</label>
                <Input
                  type="number"
                  placeholder="587"
                  value={form.smtp_port}
                  onChange={(e) => update("smtp_port", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Username</label>
              <Input
                type="email"
                placeholder="your-email@gmail.com"
                value={form.smtp_username}
                onChange={(e) => update("smtp_username", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Password</label>
              <PasswordInput
                value={form.smtp_password}
                onChange={(v) => update("smtp_password", v)}
                placeholder="Your SMTP password or App Password"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sender Email Address</label>
              <Input
                type="email"
                placeholder="noreply@yourcompany.com"
                value={form.sender_email}
                onChange={(e) => update("sender_email", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                This is the "From" address customers will see in emails
              </p>
            </div>
          </div>

          {/* Connection Status Preview */}
          {form.smtp_host && (
            <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Configuration Preview</p>
              <div className="space-y-1 text-sm">
                {[
                  { label: "Host", value: form.smtp_host },
                  { label: "Port", value: String(form.smtp_port) },
                  { label: "Username", value: form.smtp_username },
                  { label: "Sender", value: form.sender_email },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Notification Settings ── */}
        <SectionCard
          icon={Bell}
          title="Notification Settings"
          description="Control when and where email notifications are sent"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Target Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@yourcompany.com"
                value={form.target_email}
                onChange={(e) => update("target_email", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                New order notifications will be sent to this email address
              </p>
            </div>

            {/* Toggle */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                form.email_notify_enabled
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
              onClick={() => update("email_notify_enabled", !form.email_notify_enabled)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.email_notify_enabled ? "bg-emerald-100" : "bg-slate-100"}`}>
                  <Bell className={`w-5 h-5 ${form.email_notify_enabled ? "text-emerald-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">
                    {form.email_notify_enabled
                      ? "You will receive an email when new orders are placed"
                      : "Email notifications are currently disabled"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  form.email_notify_enabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.email_notify_enabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>

            {/* Notification types info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "🛍️", label: "New Orders", description: "When a customer places an order" },
                { icon: "📦", label: "Order Updates", description: "When order status changes" },
                { icon: "👤", label: "New Customers", description: "When a new customer registers" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    form.email_notify_enabled
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50 opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Help Section ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">?</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How to get Gmail App Password</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to your Google Account → Security</li>
                <li>Enable 2-Step Verification (if not done)</li>
                <li>Search for "App passwords" in your Google Account settings</li>
                <li>Create a new app password for "Mail"</li>
                <li>Use this 16-character password as your SMTP password</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Email Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
