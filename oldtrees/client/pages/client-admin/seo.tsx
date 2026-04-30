import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getSEOSettings,
  updateSEOSettings,
  uploadProductImage,
  getAssetUrl,
  getBusinessDetails, getSuperAdminPricing 
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";
import Sidebar, { TabType } from "./sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SEOForm {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  gtagId: string;
  searchConsoleMeta: string;
  minOrderAmount: number;
  faviconUrl: string;
  faviconFile: File | null;
  faviconFileName: string;
}

const EMPTY_SEO: SEOForm = {
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  gtagId: "",
  searchConsoleMeta: "",
  minOrderAmount: 0,
  faviconUrl: "",
  faviconFile: null,
  faviconFileName: "",
};

// ─── Main SEOPage ─────────────────────────────────────────────────────────────
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
export default function SEOPage() {
   const [pricing, setPricing] = useState<any[]>([]);
const [businessDetails, setBusinessDetails] = useState<any>(null);
  const { tenantId } = useTenant();

  const [form, setForm] = useState<SEOForm>(EMPTY_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");


  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchSEO = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSEOSettings(tenantId || undefined);
      const d = res.data || {};
      setForm({
        seoTitle: d.seo_title || "",
        seoDescription: d.seo_description || "",
        seoKeywords: d.seo_keywords || "",
        gtagId: d.gtag_id || "",
        searchConsoleMeta: d.search_console_meta || "",
        minOrderAmount: d.min_order_amount || 0,
        faviconUrl: d.favicon_url || "",
        faviconFile: null,
        faviconFileName: "",
      });
    } catch {
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // useEffect(() => {
  //   fetchSEO();
  // }, [fetchSEO]);
  useEffect(() => {
  fetchSEO();

  getBusinessDetails(tenantId || undefined)
    .then((d) => setBusinessDetails(d.data))
    .catch(() => {});

  getSuperAdminPricing()
    .then((d) => setPricing(d.data || []))
    .catch(() => {});
}, [fetchSEO, tenantId]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let faviconUrl = form.faviconUrl || null;

      if (form.faviconFile) {
        const res = await uploadProductImage(form.faviconFile);
        if (res.success && res.data?.imageUrl) {
          faviconUrl = res.data.imageUrl;
          toast.success("Favicon uploaded");
        } else {
          toast.error("Failed to upload favicon");
          setSaving(false);
          return;
        }
      }

      await updateSEOSettings(
        {
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          seoKeywords: form.seoKeywords || null,
          gtagId: form.gtagId || null,
          searchConsoleMeta: form.searchConsoleMeta || null,
          minOrderAmount: form.minOrderAmount || 0,
          faviconUrl,
        },
        tenantId || undefined
      );

      toast.success("SEO settings saved successfully");
      setForm((prev) => ({
        ...prev,
        faviconFile: null,
        faviconFileName: "",
        faviconUrl: faviconUrl || prev.faviconUrl,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save SEO settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">SEO Settings</h1>
          </div>
          <p className="text-slate-500">
            Manage search engine optimization for your storefront
          </p>
        </div>
        <Button variant="outline" onClick={fetchSEO} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <ProfilePlanButton pricing={pricing} businessDetails={businessDetails} />
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading SEO settings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* Basic SEO */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Basic SEO
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Site Title
                  </label>
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    placeholder="My Awesome Store"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Appears in browser tab and search results (50–60 chars recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm({ ...form, seoDescription: e.target.value })
                    }
                    rows={3}
                    placeholder="Describe your store in 150–160 characters..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {form.seoDescription.length} / 160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Keywords
                  </label>
                  <Input
                    value={form.seoKeywords}
                    onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                    placeholder="flowers, bouquet, delivery, gifts"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated keywords</p>
                </div>
              </div>
            </div>

            {/* Analytics & Verification */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Analytics & Verification
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Google Analytics — gtag ID
                  </label>
                  <Input
                    value={form.gtagId}
                    onChange={(e) => setForm({ ...form, gtagId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Google Search Console Meta Tag
                  </label>
                  <Input
                    value={form.searchConsoleMeta}
                    onChange={(e) =>
                      setForm({ ...form, searchConsoleMeta: e.target.value })
                    }
                    placeholder="google-site-verification=..."
                  />
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Favicon
              </h3>
              <div className="space-y-3">
                {form.faviconUrl && !form.faviconFile && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={getAssetUrl(form.faviconUrl) || ""}
                      alt="Current favicon"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-sm text-slate-600">Current favicon is set</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setForm({
                      ...form,
                      faviconFile: file,
                      faviconFileName: file?.name || "",
                    });
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                {form.faviconFileName && (
                  <p className="text-xs text-slate-500">
                    Selected: {form.faviconFileName}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Recommended: 32×32 or 64×64 px .ico / .png / .svg
                </p>
              </div>
            </div>

            {/* Store Settings */}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Store Settings
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Order Amount (₹)
                </label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minOrderAmount: parseFloat(e.target.value || "0"),
                    })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Orders below this amount will be blocked at checkout
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save SEO Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fetchSEO}
                disabled={saving}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
}
