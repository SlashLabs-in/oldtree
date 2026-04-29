import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getSuperAdminAnalytics,
  getSuperAdminClients,
  getSuperAdminBilling,
  getSuperAdminThemes,
  getSuperAdminPricing,
  getSuperAdminFeatureCategories,
  createSuperAdminFeatureCategory,
  updateSuperAdminFeatureCategory,
  deleteSuperAdminFeatureCategory,
  getAuthToken,
  clearAuthToken,
  getCurrentUser,
  createSuperAdminClient,
  updateSuperAdminClient,
  suspendSuperAdminClient,
  reactivateSuperAdminClient,
  deleteSuperAdminClient,
  createSuperAdminPricing,
  updateSuperAdminPricing,
  deleteSuperAdminPricing,
} from "@/lib/api";
import { Toaster, toast } from "sonner";
import { DashboardTab } from "./tabs/DashboardTab";
import { ClientsTab } from "./tabs/ClientsTab";
import { BillingTab } from "./tabs/BillingTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { PricingTab } from "./tabs/PricingTab";
import { FeatureCategoriesTab } from "./tabs/FeatureCategoriesTab";
import { SettingsTab } from "./tabs/SettingsTab";

type TabType = "dashboard" | "clients" | "billing" | "analytics" | "pricing" | "featuresCategories" | "settings";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("dashboard");
  const [analytics, setAnalytics] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const getDefaultBillingPlan = () => {
    if (pricing && pricing.length > 0) {
      return pricing[0].name || "starter";
    }
    return "starter";
  };

  const [clientForm, setClientForm] = useState({
    companyName: "",
    domain: "",
    contactEmail: "",
    contactPhone: "",
    billingPlan: "starter",
  });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const [pricingForm, setPricingForm] = useState({
    name: "",
    description: "",
    price: "",
    currency: "₹",
    billingPeriod: "month",
    features: "",
  });
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [selectedFeatureValues, setSelectedFeatureValues] = useState<string[]>([]);

  const [featuresCategories, setFeaturesCategories] = useState<any[]>([]);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [editingFeatureCategoryId, setEditingFeatureCategoryId] = useState<string | null>(null);
  const [featureCategoryForm, setFeatureCategoryForm] = useState({
    name: "",
    categories: "",
  });

  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || user?.role !== "super-admin") {
      navigate("/auth/login");
      return;
    }

    loadData();
    document.title = "Super Admin Panel";
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, clientsData, billingData, themesData, pricingData, featureCategoriesData] = await Promise.all([
        getSuperAdminAnalytics(),
        getSuperAdminClients(),
        getSuperAdminBilling(),
        getSuperAdminThemes(),
        getSuperAdminPricing(),
        getSuperAdminFeatureCategories(),
      ]);
      setAnalytics(analyticsData.data);
      setClients(clientsData.data || []);
      setBilling(billingData.data || []);
      setThemes(themesData.data || []);
      setPricing(pricingData.data || []);
      setFeaturesCategories(featureCategoriesData.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClientId) {
        await updateSuperAdminClient(editingClientId, clientForm);
        toast.success("Client updated successfully");
      } else {
        await createSuperAdminClient(clientForm);
        toast.success("Client created successfully");
      }
      setShowClientModal(false);
      setEditingClientId(null);
      setClientForm({
        companyName: "",
        domain: "",
        contactEmail: "",
        contactPhone: "",
        billingPlan: "starter",
      });
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : editingClientId ? "Failed to update client" : "Failed to create client");
    }
  };

  const handleStartEditClient = (client: any) => {
    setEditingClientId(client.id);
    setClientForm({
      companyName: client.company_name,
      domain: client.domain,
      contactEmail: client.contact_email,
      contactPhone: client.contact_phone || "",
      billingPlan: client.billing_plan,
    });
    setShowClientModal(true);
  };

  const handleSuspendClient = async (clientId: string, isSuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${isSuspended ? "reactivate" : "suspend"} this client?`)) {
      return;
    }
    try {
      if (isSuspended) {
        await reactivateSuperAdminClient(clientId);
        toast.success("Client reactivated");
      } else {
        await suspendSuperAdminClient(clientId);
        toast.success("Client suspended");
      }
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update client");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone and will delete all associated data.")) {
      return;
    }
    try {
      await deleteSuperAdminClient(clientId);
      toast.success("Client deleted successfully");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete client");
    }
  };

  const uniqueByCategory = (features: string[]) => {
    const map = new Map<string, string>();
    features.forEach((f) => {
      const key = f.trim().toLowerCase().split(" ").pop() || f;
      map.set(key, f);
    });
    return Array.from(map.values());
  };

  const handleCreatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = featuresCategories.length > 0
        ? uniqueByCategory(
            selectedFeatureValues
              .map((f) => f.trim())
              .filter(Boolean)
          )
        : pricingForm.features
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean);

      const payload = {
        name: pricingForm.name,
        description: pricingForm.description,
        price: pricingForm.price ? parseFloat(pricingForm.price) : null,
        currency: pricingForm.currency,
        billingPeriod: pricingForm.billingPeriod,
        features,
      };

      if (editingPricingId) {
        await updateSuperAdminPricing(editingPricingId, payload);
        toast.success("Pricing plan updated successfully");
      } else {
        await createSuperAdminPricing(payload);
        toast.success("Pricing plan created successfully");
      }

      setShowPricingModal(false);
      setEditingPricingId(null);
      setPricingForm({
        name: "",
        description: "",
        price: "",
        currency: "₹",
        billingPeriod: "month",
        features: "",
      });
      loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingPricingId
            ? "Failed to update pricing plan"
            : "Failed to create pricing plan"
      );
    }
  };

  const handleStartEditPricing = (plan: any) => {
    setEditingPricingId(plan.id);
    setPricingForm({
      name: plan.name,
      description: plan.description || "",
      price: plan.price ? plan.price.toString() : "",
      currency: plan.currency || "₹",
      billingPeriod: plan.billing_period,
      features: Array.isArray(plan.features)
        ? plan.features.map((feature: string) => feature.trim()).join("\n")
        : "",
    });
    setSelectedFeatureValues(
      Array.isArray(plan.features)
        ? plan.features.map((feature: string) => feature.trim())
        : []
    );
    setShowPricingModal(true);
  };

  const handleDeletePricing = async (pricingId: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) {
      return;
    }
    try {
      await deleteSuperAdminPricing(pricingId);
      toast.success("Pricing plan deleted successfully");
      loadData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete pricing plan"
      );
    }
  };

  const handleSaveFeatureCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!featureCategoryForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const categories = featureCategoryForm.categories
      .split("\n")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);

    try {
      const payload = {
        name: featureCategoryForm.name.trim(),
        categories,
      };

      if (editingFeatureCategoryId) {
        await updateSuperAdminFeatureCategory(editingFeatureCategoryId, payload);
        toast.success("Feature category updated");
      } else {
        await createSuperAdminFeatureCategory(payload);
        toast.success("Feature category created");
      }

      setShowFeaturesModal(false);
      setEditingFeatureCategoryId(null);
      setFeatureCategoryForm({ name: "", categories: "" });
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save feature category");
    }
  };

  const handleStartEditFeatureCategory = (item: any) => {
    setEditingFeatureCategoryId(item.id);
    setFeatureCategoryForm({
      name: item.name,
      categories: Array.isArray(item.categories) ? item.categories.join("\n") : "",
    });
    setShowFeaturesModal(true);
  };

  const handleDeleteFeatureCategory = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this feature category?")) {
      return;
    }
    try {
      await deleteSuperAdminFeatureCategory(itemId);
      toast.success("Feature category deleted");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete feature category");
    }
  };

  const handleOpenNewFeatureCategory = () => {
    setEditingFeatureCategoryId(null);
    setFeatureCategoryForm({ name: "", categories: "" });
    setShowFeaturesModal(true);
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "clients", icon: Users, label: "Clients" },
    { id: "billing", icon: DollarSign, label: "Billing" },
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "pricing", icon: ArrowRight, label: "Pricing" },
    { id: "featuresCategories", icon: ArrowRight, label: "Features Categories" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">π</span>
              </div>
              <span className="font-bold text-slate-900">Platform</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentTab === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              }`}
            >
              {typeof item.icon === "string" ? (
                <span className="text-xl flex-shrink-0">{item.icon}</span>
              ) : (
                <item.icon className="w-5 h-5 flex-shrink-0" />
              )}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {navItems.find((i) => i.id === currentTab)?.label} Management
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your platform's {currentTab}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Logged in as</div>
              <div className="font-semibold text-slate-900">
                {getCurrentUser()?.email || "Platform Admin"}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentTab === "dashboard" && (
            <DashboardTab analytics={analytics} themes={themes} />
          )}

          {currentTab === "clients" && (
            <ClientsTab
              clients={clients}
              showClientModal={showClientModal}
              editingClientId={editingClientId}
              clientForm={clientForm}
              onOpenModal={() => {
                setShowClientModal(true);
                setEditingClientId(null);
                setClientForm({
                  companyName: "",
                  domain: "",
                  contactEmail: "",
                  contactPhone: "",
                  billingPlan: getDefaultBillingPlan(),
                });
              }}
              onCloseModal={() => {
                setShowClientModal(false);
                setEditingClientId(null);
                setClientForm({
                  companyName: "",
                  domain: "",
                  contactEmail: "",
                  contactPhone: "",
                  billingPlan: getDefaultBillingPlan(),
                });
              }}
              onFormChange={setClientForm}
              onSubmit={handleCreateClient}
              onEdit={handleStartEditClient}
              onSuspend={handleSuspendClient}
              onDelete={handleDeleteClient}
            />
          )}

          {currentTab === "billing" && <BillingTab billing={billing} />}

          {currentTab === "analytics" && <AnalyticsTab analytics={analytics} />}

          {currentTab === "pricing" && (
            <PricingTab
              pricing={pricing}
              showPricingModal={showPricingModal}
              editingPricingId={editingPricingId}
              pricingForm={pricingForm}
              selectedFeatureValues={selectedFeatureValues}
              featuresCategories={featuresCategories}
              onOpenModal={() => {
                setEditingPricingId(null);
                setPricingForm({
                  name: "",
                  description: "",
                  price: "",
                  currency: "₹",
                  billingPeriod: "month",
                  features: "",
                });
                setSelectedFeatureValues([]);
                setShowPricingModal(true);
              }}
              onCloseModal={() => {
                setShowPricingModal(false);
                setEditingPricingId(null);
                setSelectedFeatureValues([]);
                setPricingForm({
                  name: "",
                  description: "",
                  price: "",
                  currency: "₹",
                  billingPeriod: "month",
                  features: "",
                });
              }}
              onFormChange={setPricingForm}
              onSelectedFeaturesChange={setSelectedFeatureValues}
              onSubmit={handleCreatePricing}
              onEdit={handleStartEditPricing}
              onDelete={handleDeletePricing}
            />
          )}

          {currentTab === "featuresCategories" && (
            <FeatureCategoriesTab
              featuresCategories={featuresCategories}
              showFeaturesModal={showFeaturesModal}
              editingFeatureCategoryId={editingFeatureCategoryId}
              featureCategoryForm={featureCategoryForm}
              onOpenModal={handleOpenNewFeatureCategory}
              onCloseModal={() => {
                setShowFeaturesModal(false);
                setEditingFeatureCategoryId(null);
                setFeatureCategoryForm({ name: "", categories: "" });
              }}
              onFormChange={setFeatureCategoryForm}
              onSubmit={handleSaveFeatureCategory}
              onEdit={handleStartEditFeatureCategory}
              onDelete={handleDeleteFeatureCategory}
            />
          )}

          {currentTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
