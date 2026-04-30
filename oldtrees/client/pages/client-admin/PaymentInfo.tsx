import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  RefreshCw,
  Save,
  Building2,
  Smartphone,
  QrCode,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { getPaymentInfo, updatePaymentInfo, uploadProductImage,getBusinessDetails, getSuperAdminPricing } from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

import Sidebar, { TabType } from "./sidebar";


// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentImage {
  image_url: string;
  image_type?: string;
}

interface PaymentInfoForm {
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch: string;
  gpay_name: string;
  gpay_number: string;
  upi_name: string;
  upi_id: string;
  upi_image_url: string;
  images: PaymentImage[];
}

const EMPTY_FORM: PaymentInfoForm = {
  bank_account_name: "",
  bank_account_number: "",
  bank_name: "",
  ifsc_code: "",
  branch: "",
  gpay_name: "",
  gpay_number: "",
  upi_name: "",
  upi_id: "",
  upi_image_url: "",
  images: [],
};

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accent = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: "primary" | "green" | "purple";
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
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

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
// function ProfilePlanButton({ pricing }: { pricing: any[] }) {
//   const [show, setShow] = useState(false);

//   // Get the first/current plan name from pricing data
//   const currentPlan = pricing?.[0]?.name || "No Plan";
function ProfilePlanButton({ pricing, businessDetails }: { pricing: any[]; businessDetails: any }) {
  const [show, setShow] = useState(false);

  // Match client's billing_plan key against pricing list
  const billingPlanKey = businessDetails?.billing_plan || businessDetails?.billingPlan || "";
  const matchedPlan = pricing.find(
    (p) => p.name?.toLowerCase() === billingPlanKey?.toLowerCase()
  );
  const currentPlan = matchedPlan?.name || billingPlanKey || "No Plan";
  return (
    <div className="relative">
      <button
        onClick={() => setShow((v) => !v)}
        className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400"
        title="View current plan"
      >
        M
      </button>

      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 top-11 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
            <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
              Current Plan
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                ✦ {currentPlan}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Manage your plan in account settings.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
// ─── Main PaymentInfoPage Component ──────────────────────────────────────────

export default function PaymentInfoPage() {
  const [pricing, setPricing] = useState<any[]>([]);
const [businessDetails, setBusinessDetails] = useState<any>(null);
  const { tenantId } = useTenant();

  const [form, setForm] = useState<PaymentInfoForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);


   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [currentTab, setCurrentTab] = useState<TabType>("payment-info");
  
  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPaymentInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentInfo(tenantId || undefined);
      if (data.data) {
        setForm({
          bank_account_name: data.data.bank_account_name || "",
          bank_account_number: data.data.bank_account_number || "",
          bank_name: data.data.bank_name || "",
          ifsc_code: data.data.ifsc_code || "",
          branch: data.data.branch || "",
          gpay_name: data.data.gpay_name || "",
          gpay_number: data.data.gpay_number || "",
          upi_name: data.data.upi_name || "",
          upi_id: data.data.upi_id || "",
          upi_image_url: data.data.upi_image_url || "",
          images: Array.isArray(data.data.images) ? data.data.images : [],
        });
      }
    } catch (err) {
      toast.error("Failed to load payment information");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // useEffect(() => {
  //   fetchPaymentInfo();
  // }, [fetchPaymentInfo]);
  useEffect(() => {
  fetchPaymentInfo();

  getBusinessDetails(tenantId || undefined)
    .then((d) => setBusinessDetails(d.data))
    .catch(() => {});

  getSuperAdminPricing()
    .then((d) => setPricing(d.data || []))
    .catch(() => {});
}, [fetchPaymentInfo, tenantId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePaymentInfo(form, tenantId || undefined);
      toast.success("Payment information saved successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save payment information";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const uploaded: PaymentImage[] = [];
    try {
      for (const file of Array.from(files)) {
        const result = await uploadProductImage(file, tenantId || undefined);
        if (result.success && result.data?.imageUrl) {
          uploaded.push({ image_url: result.data.imageUrl });
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      if (uploaded.length > 0) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
        toast.success(`${uploaded.length} image(s) uploaded`);
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const update = (key: keyof PaymentInfoForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
         {/* Sidebar */}
         {/* <Sidebar
           open={sidebarOpen}
           onToggle={() => setSidebarOpen(!sidebarOpen)}
           currentTab={currentTab}
           onTabChange={(tab) => setCurrentTab(tab)}
           onLogout={() => console.log("logout")}
           domain="yourstore.com"
           companyName="My Store"
         /> */}
            <Sidebar
                         open={sidebarOpen}
                         onToggle={() => setSidebarOpen(!sidebarOpen)}
                         onLogout={() => console.log("logout")}
                       />
   
         {/* Main Content */}
         <div
           className={`flex-1 min-h-screen bg-slate-100 p-6 transition-all duration-300 ${
             sidebarOpen ? "ml-64" : "ml-20"
           }`}
         >
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Information</h1>
          <p className="text-slate-500 mt-1">
            Configure bank, GPay, and UPI payment details for your customers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchPaymentInfo} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <ProfilePlanButton pricing={pricing} businessDetails={businessDetails} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bank Account */}
        <SectionCard
          icon={Building2}
          title="Bank Account Details"
          description="Direct bank transfer information"
          accent="primary"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Account Holder Name">
              <Input
                placeholder="COBRA TRADERS"
                value={form.bank_account_name}
                onChange={(e) => update("bank_account_name", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Account Number">
              <Input
                placeholder="41813993341"
                value={form.bank_account_number}
                onChange={(e) => update("bank_account_number", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Bank Name">
              <Input
                placeholder="State Bank of India"
                value={form.bank_name}
                onChange={(e) => update("bank_name", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="IFSC Code">
              <Input
                placeholder="SBIN0000975"
                value={form.ifsc_code}
                onChange={(e) => update("ifsc_code", e.target.value.toUpperCase())}
              />
            </FieldRow>
            <div className="sm:col-span-2">
              <FieldRow label="Branch">
                <Input
                  placeholder="Sivakasi"
                  value={form.branch}
                  onChange={(e) => update("branch", e.target.value)}
                />
              </FieldRow>
            </div>
          </div>

          {/* Preview */}
          {(form.bank_account_name || form.bank_name) && (
            <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Preview</p>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: "Account Name", value: form.bank_account_name },
                  { label: "Account Number", value: form.bank_account_number },
                  { label: "Bank", value: form.bank_name },
                  { label: "IFSC", value: form.ifsc_code },
                  { label: "Branch", value: form.branch },
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

        {/* GPay */}
        <SectionCard
          icon={Smartphone}
          title="GPay Details"
          description="Google Pay payment information"
          accent="green"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldRow label="Name">
              <Input
                placeholder="Soundharya"
                value={form.gpay_name}
                onChange={(e) => update("gpay_name", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Phone Number">
              <Input
                type="tel"
                placeholder="9344746164"
                value={form.gpay_number}
                onChange={(e) => update("gpay_number", e.target.value)}
              />
            </FieldRow>
          </div>

          {(form.gpay_name || form.gpay_number) && (
            <div className="mt-4 inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              <div>
                {form.gpay_name && <p className="font-semibold text-slate-900 text-sm">{form.gpay_name}</p>}
                {form.gpay_number && <p className="text-slate-600 text-sm">{form.gpay_number}</p>}
              </div>
            </div>
          )}
        </SectionCard>

        {/* UPI */}
        <SectionCard
          icon={QrCode}
          title="UPI Details"
          description="UPI payment ID and QR code"
          accent="purple"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FieldRow label="UPI Name">
              <Input
                placeholder="Harisudhan"
                value={form.upi_name}
                onChange={(e) => update("upi_name", e.target.value)}
              />
            </FieldRow>
            <FieldRow label="UPI ID">
              <Input
                placeholder="9677833373@gopherrc"
                value={form.upi_id}
                onChange={(e) => update("upi_id", e.target.value)}
              />
            </FieldRow>
          </div>

          {/* Legacy UPI Image */}
          {form.upi_image_url && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 inline-block">
              <p className="text-xs font-medium text-slate-500 mb-2">UPI QR Code</p>
              <img
                src={form.upi_image_url}
                alt="UPI QR Code"
                className="max-w-[180px] max-h-[180px] rounded"
              />
            </div>
          )}

          {/* Payment Images */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Payment Method Images</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload QR codes, payment screenshots, or other payment method images
                </p>
              </div>
              <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors ${uploadingImages ? "opacity-50 pointer-events-none" : ""}`}>
                <ImagePlus className="w-4 h-4" />
                {uploadingImages ? "Uploading..." : "Upload Images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploadingImages}
                />
              </label>
            </div>

            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={img.image_url}
                      alt={`Payment method ${idx + 1}`}
                      className="w-full h-32 object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {img.image_type && (
                      <div className="px-2 pb-2">
                        <span className="text-xs text-slate-500">{img.image_type}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <QrCode className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No images uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload QR codes or payment screenshots</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8" disabled={saving || uploadingImages}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Payment Information"}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}
