import { useState, useEffect, useCallback } from "react";
import { Phone, RefreshCw, Save, MapPin, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { getContactUs, updateContactUs } from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkingHours {
  monday_friday: string;
  saturday: string;
  sunday: string;
}

interface ContactUsForm {
  email: string;
  phone: string;
  address: string;
  map_code: string;
  working_hours: WorkingHours;
}

const EMPTY_FORM: ContactUsForm = {
  email: "",
  phone: "",
  address: "",
  map_code: "",
  working_hours: {
    monday_friday: "",
    saturday: "",
    sunday: "",
  },
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

// ─── Main ContactUsPage Component ─────────────────────────────────────────────

export default function ContactUsPage() {
  const { tenantId } = useTenant();

  const [form, setForm] = useState<ContactUsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchContactUs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getContactUs(tenantId || undefined);
      if (data.data) {
        setForm({
          email: data.data.email || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          map_code: data.data.map_code || "",
          working_hours: data.data.working_hours || {
            monday_friday: "",
            saturday: "",
            sunday: "",
          },
        });
      }
    } catch (err) {
      toast.error("Failed to load contact information");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchContactUs();
  }, [fetchContactUs]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateContactUs(form, tenantId || undefined);
      toast.success("Contact information saved successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save contact information";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const setWorkingHours = (key: keyof WorkingHours, value: string) => {
    setForm((prev) => ({
      ...prev,
      working_hours: { ...prev.working_hours, [key]: value },
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-slate-500 mt-1">
            Manage your store's contact information displayed to customers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchContactUs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact Details */}
        <SectionCard
          icon={Phone}
          title="Contact Details"
          description="Primary contact information for your customers"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </span>
              </label>
              <Input
                type="email"
                placeholder="contact@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </span>
              </label>
              <Input
                type="tel"
                placeholder="+91-9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard
          icon={MapPin}
          title="Address"
          description="Your physical store or office location"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Address
            </label>
            <textarea
              placeholder="Enter your complete address including street, city, state, pin code"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Google Maps Embed Code
            </label>
            <textarea
              placeholder='Paste your Google Maps embed iframe code here&#10;e.g. <iframe src="https://www.google.com/maps/embed?...">'
              value={form.map_code}
              onChange={(e) => setForm({ ...form, map_code: e.target.value })}
              rows={5}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
              <span className="mt-0.5">💡</span>
              <span>
                Get the embed code from Google Maps: Search your location → Click "Share" → "Embed a map" → Copy the iframe code
              </span>
            </p>
          </div>

          {/* Map Preview */}
          {form.map_code && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Map Preview</p>
              <div
                className="w-full rounded-lg overflow-hidden border border-slate-200"
                dangerouslySetInnerHTML={{ __html: form.map_code }}
              />
            </div>
          )}
        </SectionCard>

        {/* Working Hours */}
        <SectionCard
          icon={Clock}
          title="Working Hours"
          description="Let customers know when you're available"
        >
          <div className="space-y-4">
            {[
              { key: "monday_friday" as keyof WorkingHours, label: "Monday – Friday", placeholder: "9:00 AM – 6:00 PM" },
              { key: "saturday" as keyof WorkingHours, label: "Saturday", placeholder: "9:00 AM – 2:00 PM" },
              { key: "sunday" as keyof WorkingHours, label: "Sunday", placeholder: "Closed" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-36 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                </div>
                <Input
                  placeholder={placeholder}
                  value={form.working_hours[key]}
                  onChange={(e) => setWorkingHours(key, e.target.value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          {/* Preview Card */}
          {(form.working_hours.monday_friday || form.working_hours.saturday || form.working_hours.sunday) && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Preview</p>
              <div className="space-y-2 text-sm">
                {form.working_hours.monday_friday && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mon – Fri</span>
                    <span className="font-medium text-slate-900">{form.working_hours.monday_friday}</span>
                  </div>
                )}
                {form.working_hours.saturday && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Saturday</span>
                    <span className="font-medium text-slate-900">{form.working_hours.saturday}</span>
                  </div>
                )}
                {form.working_hours.sunday && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sunday</span>
                    <span className="font-medium text-slate-900">{form.working_hours.sunday}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Contact Information"}
          </Button>
        </div>
      </form>
    </div>
  );
}
