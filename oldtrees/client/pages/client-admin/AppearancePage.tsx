import { useState, useEffect, useCallback } from "react";
import {
  Palette,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Save,
  Image as ImageIcon,
  Megaphone,
  Layout,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Sidebar, { TabType } from "./sidebar";

import {
  getBusinessDetails,
  updateBusinessDetails,
  getAllThemes,
  getTenantTemplate,
  getAvailableTemplates,
  setTenantTemplate,
  getHeroSliders,
  createHeroSlider,
  updateHeroSlider,
  deleteHeroSlider,
  getTenantThemeCustomization,
  getAnnouncementSettings,
  updateAnnouncementSettings,
  uploadProductImage,
  uploadHeroSliderImage,
  getCurrentPlanDetails,
} from "@/lib/api";
import { getTemplateLimitFromFeatures } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import UpgradePlanModal from "@/components/ui/upgrade-plan-modal";
import {
  getSuperAdminPricing,
  updateClientBillingPlan,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SliderForm {
  imageUrl: string;
  imageFile: File | null;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_SLIDER: SliderForm = {
  imageUrl: "",
  imageFile: null,
  title: "",
  subtitle: "",
  ctaText: "",
  ctaUrl: "",
  sortOrder: 0,
  isActive: true,
};

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Slider Modal ─────────────────────────────────────────────────────────────

function SliderModal({
  open,
  editingId,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: {
  open: boolean;
  editingId: string | null;
  form: SliderForm;
  onChange: (f: SliderForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white flex items-center justify-between p-5 border-b border-slate-200 z-10">
          <h2 className="text-lg font-bold text-slate-900">
            {editingId ? "Edit Slide" : "Add Slide"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Slide Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onChange({ ...form, imageFile: e.target.files?.[0] || null })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-36 object-cover rounded-lg border border-slate-200" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <Input placeholder="Slide title" value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtitle</label>
            <Input placeholder="Slide subtitle" value={form.subtitle} onChange={(e) => onChange({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CTA Text</label>
              <Input placeholder="Shop Now" value={form.ctaText} onChange={(e) => onChange({ ...form, ctaText: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CTA URL</label>
              <Input placeholder="/products" value={form.ctaUrl} onChange={(e) => onChange({ ...form, ctaUrl: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sort Order</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => onChange({ ...form, sortOrder: parseInt(e.target.value || "0") })} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Slide" : "Add Slide"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main AppearancePage Component ───────────────────────────────────────────

export default function AppearancePage() {
  const { tenantId } = useTenant();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Templates
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("theme-b");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [templateLimit, setTemplateLimit] = useState<number | null>(null);

  // Hero Sliders
  const [heroSliders, setHeroSliders] = useState<any[]>([]);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingSliderId, setEditingSliderId] = useState<string | null>(null);
  const [sliderForm, setSliderForm] = useState<SliderForm>(EMPTY_SLIDER);
  const [savingSlider, setSavingSlider] = useState(false);

  // Announcement
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Social Media (business details)
  const [businessForm, setBusinessForm] = useState({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    isMaintenanceMode: false,
    youtubeUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    logo: "",
    logoFile: null as File | null,
  });
  const [savingSocial, setSavingSocial] = useState(false);

const [activeBillingPlan, setActiveBillingPlan] = useState("");
  // Upgrade Plan Modal
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [upgradePromptMessage, setUpgradePromptMessage] = useState("");
  const [billingPlans, setBillingPlans] = useState<any[]>([]);
  const [selectedBillingPlan, setSelectedBillingPlan] = useState("");
  const [upgradingBillingPlan, setUpgradingBillingPlan] = useState(false);



    const [sidebarOpen, setSidebarOpen] = useState(true);
    // const [currentTab, setCurrentTab] = useState<TabType>("appearance");
  
  // ── Load ───────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bizRes, templateRes, templatesRes, slidersRes, announcementRes, planRes] =
        await Promise.allSettled([
          getBusinessDetails(tenantId || undefined),
          getTenantTemplate(tenantId || undefined),
          getAvailableTemplates(tenantId || undefined),
          getHeroSliders(tenantId || undefined),
          getAnnouncementSettings(tenantId || undefined),
          getCurrentPlanDetails(tenantId || undefined),
        ]);

      // if (bizRes.status === "fulfilled" && bizRes.value.data) {
      //   const d = bizRes.value.data;
      //   setBusinessForm({
      if (bizRes.status === "fulfilled" && bizRes.value.data) {
        const d = bizRes.value.data;
        // Store billing_plan directly for upgrade modal use
        setActiveBillingPlan(d.billing_plan || d.billingPlan || "");
        setBusinessForm({
          companyName: d.company_name || "",
          contactEmail: d.contact_email || "",
          contactPhone: d.contact_phone || "",
          isMaintenanceMode: d.is_maintenance_mode || false,
          youtubeUrl: d.youtube_url || "",
          instagramUrl: d.instagram_url || "",
          facebookUrl: d.facebook_url || "",
          logo: d.logo_url || "",
          logoFile: null,
        });
      }
      if (templateRes.status === "fulfilled") {
        setSelectedTemplate(templateRes.value.data?.template || "theme-b");
      }
      if (templatesRes.status === "fulfilled") {
        setAvailableTemplates(templatesRes.value.data || []);
      }
      if (slidersRes.status === "fulfilled") {
        setHeroSliders(slidersRes.value?.data || []);
      }
      if (announcementRes.status === "fulfilled") {
        setAnnouncementMessage(announcementRes.value.data?.announcement_message || "");
      }
      if (planRes.status === "fulfilled" && planRes.value.success && planRes.value.data) {
        setCurrentPlan(planRes.value.data);
        setTemplateLimit(getTemplateLimitFromFeatures(planRes.value.data.features || []));
      }
    } catch (err) {
      toast.error("Failed to load appearance settings");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Upgrade Plan ───────────────────────────────────────────────────────────

  // const loadBillingPlans = async () => {
  //   try {
  //     const res = await getSuperAdminPricing();
  //     const plans = res.data || [];
  //     setBillingPlans(plans);
  //     if (plans.length && !selectedBillingPlan) setSelectedBillingPlan(plans[0].name);
  //   } catch (err) {
  //     console.error("Failed to load billing plans", err);
  //   }
  // };
  const loadBillingPlans = async (activePlanName: string = "") => {
    try {
      const res = await getSuperAdminPricing();
      const plans = res.data || [];
      setBillingPlans(plans);
      const matched = plans.find(
        (p: any) => p.name?.toLowerCase() === activePlanName?.toLowerCase()
      );
      setSelectedBillingPlan(matched?.name || activePlanName || plans[0]?.name || "");
    } catch (err) {
      console.error("Failed to load billing plans", err);
    }
  };

  // const openUpgradePlanModal = (message: string) => {
  //   setUpgradePromptMessage(message);
  //   setShowUpgradePlanModal(true);
  //   if (!billingPlans.length) loadBillingPlans();
  // };
// const openUpgradePlanModal = (message: string) => {
//     setUpgradePromptMessage(message);
//     setShowUpgradePlanModal(true);
//     // Use billing_plan from businessForm directly — always available
//     const activePlan = currentPlan?.name || businessForm.companyName || "";
//     loadBillingPlans(activePlan);
//   };
const openUpgradePlanModal = (message: string) => {
    setUpgradePromptMessage(message);
    setShowUpgradePlanModal(true);
    loadBillingPlans(currentPlan?.name || activeBillingPlan);
  };
  const updatePlanForTenant = async () => {
    if (!tenantId || !selectedBillingPlan) return;
    setUpgradingBillingPlan(true);
    try {
      await updateClientBillingPlan(selectedBillingPlan, tenantId);
      toast.success("Billing plan updated successfully");
      setShowUpgradePlanModal(false);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setUpgradingBillingPlan(false);
    }
  };

  // ── Template ───────────────────────────────────────────────────────────────

  const handleSaveTemplate = async () => {
    const selectedIndex = availableTemplates.findIndex((t) => t.id === selectedTemplate);
    if (templateLimit !== null && selectedIndex >= templateLimit) {
      openUpgradePlanModal(
        `This template is not available on your current plan (${currentPlan?.name || "your plan"}). Upgrade to access more templates.`
      );
      return;
    }
    setSavingTemplate(true);
    try {
      await setTenantTemplate(selectedTemplate, tenantId);
      toast.success("Template applied successfully!");
    } catch (err) {
      toast.error("Failed to apply template");
    } finally {
      setSavingTemplate(false);
    }
  };

  // ── Sliders ────────────────────────────────────────────────────────────────

  const openAddSlider = () => {
    setEditingSliderId(null);
    setSliderForm(EMPTY_SLIDER);
    setShowSliderModal(true);
  };

  const openEditSlider = (s: any) => {
    setEditingSliderId(s.id);
    setSliderForm({
      imageUrl: s.image_url || "",
      imageFile: null,
      title: s.title || "",
      subtitle: s.subtitle || "",
      ctaText: s.cta_text || "",
      ctaUrl: s.cta_url || "",
      sortOrder: s.sort_order || 0,
      isActive: s.is_active,
    });
    setShowSliderModal(true);
  };

  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSlider(true);
    try {
      let imageUrl = sliderForm.imageUrl;
      if (sliderForm.imageFile) {
        const resp = await uploadHeroSliderImage(sliderForm.imageFile, tenantId || undefined);
        imageUrl = resp.data?.imageUrl || imageUrl;
      }
      const payload = {
        imageUrl,
        title: sliderForm.title,
        subtitle: sliderForm.subtitle,
        ctaText: sliderForm.ctaText,
        ctaUrl: sliderForm.ctaUrl,
        sortOrder: sliderForm.sortOrder,
        isActive: sliderForm.isActive,
      };
      if (editingSliderId) {
        await updateHeroSlider(editingSliderId, payload, tenantId || undefined);
        toast.success("Slide updated");
      } else {
        await createHeroSlider(payload, tenantId || undefined);
        toast.success("Slide added");
      }
      setShowSliderModal(false);
      const res = await getHeroSliders(tenantId || undefined);
      setHeroSliders(res?.data || []);
    } catch (err) {
      toast.error("Failed to save slide");
    } finally {
      setSavingSlider(false);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await deleteHeroSlider(id, tenantId || undefined);
      toast.success("Slide deleted");
      const res = await getHeroSliders(tenantId || undefined);
      setHeroSliders(res?.data || []);
    } catch (err) {
      toast.error("Failed to delete slide");
    }
  };

  // ── Announcement ───────────────────────────────────────────────────────────

  const handleSaveAnnouncement = async () => {
    if (!tenantId) { toast.error("Tenant ID missing"); return; }
    setSavingAnnouncement(true);
    try {
      const result = await updateAnnouncementSettings(announcementMessage, tenantId);
      if (result?.success) {
        toast.success("Announcement updated!");
        setShowAnnouncementModal(false);
      } else {
        toast.error(result?.error || "Failed to update announcement");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // ── Social Media ───────────────────────────────────────────────────────────

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      let logoUrl = businessForm.logo;
      if (businessForm.logoFile) {
        const resp = await uploadProductImage(businessForm.logoFile);
        logoUrl = resp.data?.imageUrl || logoUrl;
      }
      await updateBusinessDetails({ ...businessForm, logo: logoUrl }, tenantId || undefined);
      toast.success("Social media links updated");
      setBusinessForm((prev) => ({ ...prev, logo: logoUrl, logoFile: null }));
    } catch (err) {
      toast.error("Failed to update social media links");
    } finally {
      setSavingSocial(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading appearance settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <UpgradePlanModal
        open={showUpgradePlanModal}
        message={upgradePromptMessage}
        plans={billingPlans}
        selectedPlan={selectedBillingPlan}
        onSelectPlan={setSelectedBillingPlan}
        onClose={() => setShowUpgradePlanModal(false)}
        onConfirm={updatePlanForTenant}
        submitting={upgradingBillingPlan}
      />
 {/* <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onLogout={() => console.log("logout")}
        domain="yourstore.com"
        companyName="My Store"
      /> */}
      {/* <Sidebar
  open={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
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
          <h1 className="text-3xl font-bold text-slate-900">Appearance</h1>
          <p className="text-slate-500 mt-1">
            Customize your storefront's look, banners, and announcements
          </p>
        </div>
        <Button variant="outline" onClick={loadAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {/* ── Templates ── */}
        <SectionCard
          icon={Layout}
          title="Store Templates"
          description="Select a complete design template for your storefront"
        >
          <p className="text-sm text-slate-600 mb-6">
            Each template includes unique styling, layout, and color scheme. Changes appear immediately in the storefront.
          </p>

          {availableTemplates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableTemplates.map((template: any, index: number) => {
                const isLocked = templateLimit !== null && index >= templateLimit;

                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      if (isLocked) {
                        openUpgradePlanModal(
                          `This template is not available on your current plan (${currentPlan?.name || "your plan"}). Upgrade to access more templates.`
                        );
                      } else {
                        setSelectedTemplate(template.id);
                      }
                    }}
                    className={`border-2 rounded-xl overflow-hidden transition-all relative ${
                      isLocked
                        ? "cursor-not-allowed opacity-60 border-slate-200"
                        : `cursor-pointer hover:shadow-xl ${
                            selectedTemplate === template.id
                              ? "border-primary shadow-lg"
                              : "border-slate-300 hover:border-slate-400"
                          }`
                    }`}
                  >
                    {/* Lock Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-[11px]">
                        <div className="text-center text-white">
                          <div className="text-3xl mb-1">🔒</div>
                          <p className="font-semibold text-sm">Upgrade Plan</p>
                        </div>
                      </div>
                    )}

                    {/* Preview Gradient */}
                    <div
                      className="h-40 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 50%, ${template.colors.accent} 100%)`,
                      }}
                    >
                      <div className="text-center text-white">
                        <p className="text-sm font-semibold opacity-90">{template.name}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 mb-1">{template.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{template.description}</p>

                      {/* Colors */}
                      <div className="flex gap-1.5 mb-3">
                        {[template.colors.primary, template.colors.secondary, template.colors.accent].map((c, i) => (
                          <div key={i} className="flex-1 h-5 rounded border border-slate-200" style={{ backgroundColor: c }} />
                        ))}
                      </div>

                      {selectedTemplate === template.id && (
                        <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary font-semibold py-1.5 rounded-lg border border-primary text-sm">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">Loading templates...</div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <Button onClick={handleSaveTemplate} disabled={savingTemplate} size="lg" className="w-full sm:w-auto px-8">
              <Save className="w-4 h-4 mr-2" />
              {savingTemplate ? "Applying..." : "Apply Selected Template"}
            </Button>
          </div>
        </SectionCard>

        {/* ── Hero Sliders ── */}
        <SectionCard
          icon={ImageIcon}
          title="Hero Slider Banners"
          description="Manage the banner images displayed on your storefront homepage"
          action={
            <Button size="sm" onClick={openAddSlider}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Slide
            </Button>
          }
        >
          {heroSliders.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No slides yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={openAddSlider}>
                <Plus className="w-4 h-4 mr-1.5" /> Add First Slide
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {heroSliders.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <img
                    src={s.image_url}
                    alt={s.title || "slide"}
                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{s.title || "Untitled Slide"}</p>
                    {s.subtitle && <p className="text-sm text-slate-500 truncate">{s.subtitle}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                      {s.cta_text && (
                        <span className="text-xs text-slate-400">CTA: {s.cta_text}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEditSlider(s)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSlider(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Announcement ── */}
        <SectionCard
          icon={Megaphone}
          title="Announcement Banner"
          description="Display a message at the top of your storefront"
          action={
            <Button size="sm" variant="outline" onClick={() => setShowAnnouncementModal(true)}>
              <Edit className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          }
        >
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 min-h-[60px]">
            {announcementMessage ? (
              <p className="text-slate-700 whitespace-pre-wrap text-sm">{announcementMessage}</p>
            ) : (
              <p className="text-slate-400 italic text-sm">No announcement message set. Click "Edit" to add one.</p>
            )}
          </div>
        </SectionCard>

        {/* ── Social Media ── */}
        <SectionCard
          icon={Share2}
          title="Social Media Links"
          description="These links appear in the footer of your storefront"
        >
          <form onSubmit={handleSaveSocial} className="space-y-4">
            {[
              { key: "youtubeUrl", label: "YouTube URL", placeholder: "https://www.youtube.com/@yourhandle" },
              { key: "instagramUrl", label: "Instagram URL", placeholder: "https://www.instagram.com/yourhandle" },
              { key: "facebookUrl", label: "Facebook URL", placeholder: "https://www.facebook.com/yourpage" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <Input
                  type="url"
                  placeholder={placeholder}
                  value={(businessForm as any)[key]}
                  onChange={(e) => setBusinessForm({ ...businessForm, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="pt-2">
              <Button type="submit" disabled={savingSocial} className="px-6">
                <Save className="w-4 h-4 mr-2" />
                {savingSocial ? "Saving..." : "Save Social Links"}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>

      {/* ── Slider Modal ── */}
      <SliderModal
        open={showSliderModal}
        editingId={editingSliderId}
        form={sliderForm}
        onChange={setSliderForm}
        onSubmit={handleSaveSlider}
        onClose={() => setShowSliderModal(false)}
        saving={savingSlider}
      />

      {/* ── Announcement Modal ── */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Edit Announcement Message</h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Enter your announcement message. Displayed at the top of your storefront."
                  rows={5}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Leave empty to clear the announcement banner.</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleSaveAnnouncement} disabled={savingAnnouncement}>
                  {savingAnnouncement ? "Saving..." : "Save Message"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowAnnouncementModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}