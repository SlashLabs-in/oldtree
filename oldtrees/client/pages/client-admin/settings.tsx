import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Plus,
  Trash2,
  X,
  RefreshCw,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getBusinessDetails,
  updateBusinessDetails,
  getStaffMembers,
  createStaffMember,
  deleteStaffMember,
  getFooterSections,
  updateFooterSection,
  uploadProductImage,
  getSuperAdminPricing 
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";
import Sidebar, { TabType } from "./sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessForm {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  isMaintenanceMode: boolean;
  youtubeUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  logo: string;
  logoFile: File | null;
}

interface StaffForm {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

interface FooterForm {
  sectionName: string;
  isEnabled: boolean;
  sortOrder: number;
  sectionData: string;
}

const EMPTY_BUSINESS: BusinessForm = {
  companyName: "",
  contactEmail: "",
  contactPhone: "",
  isMaintenanceMode: false,
  youtubeUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  logo: "",
  logoFile: null,
};

const EMPTY_STAFF: StaffForm = {
  email: "",
  firstName: "",
  lastName: "",
  role: "editor",
  password: "",
};

const EMPTY_FOOTER: FooterForm = {
  sectionName: "",
  isEnabled: true,
  sortOrder: 0,
  sectionData: "",
};

// ─── Staff Modal ──────────────────────────────────────────────────────────────

interface StaffModalProps {
  open: boolean;
  form: StaffForm;
  onChange: (f: StaffForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

function StaffModal({ open, form, onChange, onSubmit, onClose, saving }: StaffModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Add Team Member</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <Input value={form.firstName} onChange={(e) => onChange({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <Input value={form.lastName} onChange={(e) => onChange({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => onChange({ ...form, role: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="admin">Admin (Full Access)</option>
              <option value="editor">Editor (Products & Orders)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Adding..." : "Add Member"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, name, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Remove Staff Member</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Remove <strong>"{name}"</strong> from your team?
        </p>
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Removing..." : "Yes, Remove"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
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
// ─── Main SettingsPage ────────────────────────────────────────────────────────

export default function SettingsPage() {
   const [pricing, setPricing] = useState<any[]>([]);
const [businessDetails, setBusinessDetails] = useState<any>(null);
  const { tenantId, domain } = useTenant();

  const [loading, setLoading] = useState(true);
  const [savingBiz, setSavingBiz] = useState(false);

  // Business
  const [businessForm, setBusinessForm] = useState<BusinessForm>(EMPTY_BUSINESS);

  // Staff
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffForm>(EMPTY_STAFF);
  const [savingStaff, setSavingStaff] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Footer
  const [footerSections, setFooterSections] = useState<any[]>([]);
  const [editingFooterSection, setEditingFooterSection] = useState<string | null>(null);
  const [footerForm, setFooterForm] = useState<FooterForm>(EMPTY_FOOTER);
  const [savingFooter, setSavingFooter] = useState(false);


   const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("settings");
  
  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bizRes, staffRes, footerRes] = await Promise.allSettled([
        getBusinessDetails(tenantId || undefined),
        getStaffMembers(tenantId || undefined),
        getFooterSections(),
      ]);

      if (bizRes.status === "fulfilled") {
        const d = bizRes.value.data;
        if (d) {
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
      }

      if (staffRes.status === "fulfilled") {
        setStaffMembers(staffRes.value.data || []);
      }

      if (footerRes.status === "fulfilled") {
        setFooterSections(footerRes.value.data || []);
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // useEffect(() => {
  //   fetchAll();
  // }, [fetchAll]);
  useEffect(() => {
  fetchAll();

  getBusinessDetails(tenantId || undefined)
    .then((d) => setBusinessDetails(d.data))
    .catch(() => {});

  getSuperAdminPricing()
    .then((d) => setPricing(d.data || []))
    .catch(() => {});
}, [fetchAll, tenantId]);

  // ── Business save ──────────────────────────────────────────────────────────

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBiz(true);
    try {
      let logoUrl = businessForm.logo;
      if (businessForm.logoFile) {
        const resp = await uploadProductImage(businessForm.logoFile);
        logoUrl = resp.data?.imageUrl || businessForm.logo;
      }
      await updateBusinessDetails({ ...businessForm, logo: logoUrl }, tenantId || undefined);
      toast.success("Business details updated");
      setBusinessForm((prev) => ({ ...prev, logo: logoUrl, logoFile: null }));
    } catch {
      toast.error("Failed to update business details");
    } finally {
      setSavingBiz(false);
    }
  };

  // ── Staff ──────────────────────────────────────────────────────────────────

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.email.trim()) return toast.error("Email is required");
    if (!staffForm.password.trim()) return toast.error("Password is required");
    if (staffForm.password.length < 6) return toast.error("Password must be at least 6 characters");

    setSavingStaff(true);
    try {
      await createStaffMember(
        {
          email: staffForm.email.trim().toLowerCase(),
          firstName: staffForm.firstName,
          lastName: staffForm.lastName,
          role: staffForm.role,
          password: staffForm.password,
        },
        tenantId || undefined
      );
      toast.success("Staff member added");
      setStaffForm(EMPTY_STAFF);
      setShowStaffModal(false);
      const res = await getStaffMembers(tenantId || undefined);
      setStaffMembers(res.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff member");
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStaffMember(deleteTarget.id, tenantId || undefined);
      toast.success("Staff member removed");
      setDeleteTarget(null);
      const res = await getStaffMembers(tenantId || undefined);
      setStaffMembers(res.data || []);
    } catch {
      toast.error("Failed to remove staff member");
    } finally {
      setDeleting(false);
    }
  };

  // ── Footer ─────────────────────────────────────────────────────────────────

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerForm.sectionName.trim()) return toast.error("Section name is required");

    setSavingFooter(true);
    try {
      let sectionData = {};
      if (footerForm.sectionData.trim()) {
        try {
          sectionData = JSON.parse(footerForm.sectionData);
        } catch {
          return toast.error("Section data must be valid JSON");
        }
      }
      await updateFooterSection(
        footerForm.sectionName,
        { isEnabled: footerForm.isEnabled, sortOrder: footerForm.sortOrder, sectionData },
        tenantId || undefined
      );
      toast.success("Footer section saved");
      setFooterForm(EMPTY_FOOTER);
      setEditingFooterSection(null);
      const res = await getFooterSections();
      setFooterSections(res.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save footer section");
    } finally {
      setSavingFooter(false);
    }
  };

  const handleEditFooter = (section: any) => {
    setEditingFooterSection(section.section_name);
    setFooterForm({
      sectionName: section.section_name,
      isEnabled: section.is_enabled,
      sortOrder: section.sort_order || 0,
      sectionData:
        typeof section.section_data === "string"
          ? section.section_data
          : JSON.stringify(section.section_data || {}),
    });
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
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          </div>
          <p className="text-slate-500">Manage your store configuration and team</p>
        </div>
        <Button variant="outline" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
         <ProfilePlanButton pricing={pricing} businessDetails={businessDetails} />
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Business Details ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Business Details</h3>
            <form onSubmit={handleUpdateBusiness} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Store Domain (Read-only)
                </label>
                <Input value={domain || ""} disabled className="bg-slate-50" />
                <p className="text-xs text-slate-400 mt-1">Contact support to change your domain</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <Input
                  value={businessForm.companyName}
                  onChange={(e) => setBusinessForm({ ...businessForm, companyName: e.target.value })}
                />
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Store Logo</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  {businessForm.logo && (
                    <div className="mb-4 flex items-center gap-4">
                      <img
                        src={businessForm.logo}
                        alt="Store logo"
                        className="h-20 w-20 object-contain rounded border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setBusinessForm({ ...businessForm, logo: "", logoFile: null })}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setBusinessForm({
                            ...businessForm,
                            logo: ev.target?.result as string,
                            logoFile: file,
                          });
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG, or SVG · Max 2MB · Recommended 200×100 px</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <Input
                    type="email"
                    value={businessForm.contactEmail}
                    onChange={(e) => setBusinessForm({ ...businessForm, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <Input
                    value={businessForm.contactPhone}
                    onChange={(e) => setBusinessForm({ ...businessForm, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={businessForm.isMaintenanceMode}
                  onChange={(e) =>
                    setBusinessForm({ ...businessForm, isMaintenanceMode: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="maintenance" className="flex-1 cursor-pointer">
                  <span className="font-medium text-slate-900 block">Maintenance Mode</span>
                  <span className="text-sm text-slate-500">Temporarily close your store to visitors</span>
                </label>
              </div>

              <Button type="submit" disabled={savingBiz} className="w-full sm:w-auto">
                {savingBiz ? "Saving..." : "Save Business Details"}
              </Button>
            </form>
          </div>

          {/* ── Staff Members ────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Team Members ({staffMembers.length})
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage who can access your admin panel</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setStaffForm(EMPTY_STAFF);
                  setShowStaffModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            {staffMembers.length > 0 ? (
              <div className="space-y-3">
                {staffMembers.map((staff: any) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {staff.first_name} {staff.last_name}
                        {(!staff.first_name && !staff.last_name) && (
                          <span className="text-slate-400 font-normal">No name set</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">{staff.email}</p>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded mt-1 inline-block capitalize">
                        {staff.role}
                      </span>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(staff)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500">
                <p>No team members yet</p>
                <p className="text-sm mt-1">Add staff to give them access to the admin panel</p>
              </div>
            )}
          </div>

          {/* ── Footer Configuration ─────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Footer Sections ({footerSections.length})
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage sections shown in the storefront footer</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingFooterSection(null);
                  setFooterForm(EMPTY_FOOTER);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Section
              </Button>
            </div>

            {/* Footer form */}
            <form onSubmit={handleSaveFooter} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Section Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={footerForm.sectionName}
                    onChange={(e) => setFooterForm({ ...footerForm, sectionName: e.target.value })}
                    placeholder="e.g. Company, Support, Legal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={footerForm.sortOrder}
                    onChange={(e) =>
                      setFooterForm({ ...footerForm, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section Data (JSON)</label>
                <textarea
                  value={footerForm.sectionData}
                  onChange={(e) => setFooterForm({ ...footerForm, sectionData: e.target.value })}
                  placeholder='{"links": [{"label": "About", "url": "/about"}]}'
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="footer-enabled"
                  checked={footerForm.isEnabled}
                  onChange={(e) => setFooterForm({ ...footerForm, isEnabled: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="footer-enabled" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Enable this section
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={savingFooter} className="flex-1">
                  {savingFooter ? "Saving..." : editingFooterSection ? "Update Section" : "Add Section"}
                </Button>
                {editingFooterSection && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingFooterSection(null);
                      setFooterForm(EMPTY_FOOTER);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            {footerSections.length > 0 ? (
              <div className="space-y-2">
                {footerSections.map((section: any) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{section.section_name}</p>
                      <p className="text-sm text-slate-500">
                        {section.is_enabled ? "✓ Enabled" : "✗ Disabled"} · Order: {section.sort_order}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditFooter(section)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No footer sections yet</p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <StaffModal
        open={showStaffModal}
        form={staffForm}
        onChange={setStaffForm}
        onSubmit={handleAddStaff}
        onClose={() => setShowStaffModal(false)}
        saving={savingStaff}
      />
      <DeleteModal
        open={!!deleteTarget}
        name={deleteTarget ? `${deleteTarget.first_name || ""} ${deleteTarget.last_name || ""}`.trim() || deleteTarget.email : ""}
        onConfirm={handleDeleteStaff}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
    </div>
  );
}
