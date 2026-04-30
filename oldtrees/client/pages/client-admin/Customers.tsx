import { useState, useEffect, useCallback } from "react";
import { State, City } from "country-state-city";
import { Users, Plus, Edit, Trash2, X, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getClientCustomers,
  updateClientCustomer,
  deleteClientCustomer,
  getBusinessDetails, getSuperAdminPricing
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";
import Sidebar, { TabType } from "./sidebar";
import AppTable, { Column } from "@/components/client_Ui/table";


// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  total_orders?: number;
  total_spent?: number;
}

interface CustomerForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

const EMPTY_FORM: CustomerForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  countryCode: "IN",
};

// ─── Customer Modal ───────────────────────────────────────────────────────────

interface CustomerModalProps {
  open: boolean;
  editingId: string | null;
  form: CustomerForm;
  onChange: (form: CustomerForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

function CustomerModal({
  open,
  editingId,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: CustomerModalProps) {
  if (!open) return null;

  const states = State.getStatesOfCountry(form.countryCode || "IN");
  const selectedStateObj = states.find((s) => s.isoCode === form.state);
  const stateDisplayValue = selectedStateObj ? selectedStateObj.name : form.state;

  const cities = City.getCitiesOfState(form.countryCode || "IN", form.state);

  const handleStateChange = (typed: string) => {
    if (!typed) {
      onChange({ ...form, state: "", city: "" });
      return;
    }
    const match = states.find(
      (s) => s.name.toLowerCase() === typed.toLowerCase()
    );
    if (match) {
      onChange({ ...form, state: match.isoCode, city: "" });
    } else {
      onChange({ ...form, state: typed, city: "" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Customer" : "Add Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <Input
                placeholder="John"
                value={form.first_name}
                onChange={(e) => onChange({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <Input
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => onChange({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              State
            </label>
            <input
              type="text"
              placeholder="Search state..."
              value={stateDisplayValue}
              onChange={(e) => handleStateChange(e.target.value)}
              list="state-list"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <datalist id="state-list">
              {states.map((s) => (
                <option key={s.isoCode} value={s.name} />
              ))}
            </datalist>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder={form.state ? "Search city..." : "Select a state first"}
              disabled={!form.state}
              value={form.city}
              onChange={(e) => onChange({ ...form, city: e.target.value })}
              list="city-list"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:bg-slate-50"
            />
            <datalist id="city-list">
              {cities.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Customer" : "Create Customer"}
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
  customerName: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, customerName, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Customer</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{customerName}</strong>? All associated data will be removed.
        </p>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
// ─── Profile Plan Tooltip Button ──────────────────────────────────────────────

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
// ─── Main CustomerPage Component ──────────────────────────────────────────────

export default function CustomerPage() {
  const [pricing, setPricing] = useState<any[]>([]);
const [businessDetails, setBusinessDetails] = useState<any>(null);
  const { tenantId } = useTenant();
 

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("customers");


  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientCustomers(tenantId || undefined);
      setCustomers(data.data || []);
    } catch (err) {
      toast.error("Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // useEffect(() => {
  //   fetchCustomers();
  // }, [fetchCustomers]);
  useEffect(() => {
  fetchCustomers();

  getBusinessDetails(tenantId || undefined)
    .then((d) => setBusinessDetails(d.data))
    .catch(() => {});

  getSuperAdminPricing()
    .then((d) => setPricing(d.data || []))
    .catch(() => {});
}, [fetchCustomers, tenantId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      city: customer.city || "",
      state: customer.state || "",
      country: customer.country || "",
      countryCode: customer.country_code || "IN",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    setSaving(true);
    try {
      await updateClientCustomer(editingId!, form, tenantId || undefined);
      toast.success("Customer updated successfully");
      closeModal();
      await fetchCustomers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update customer";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (customer: Customer) => {
    setDeleteTarget(customer);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClientCustomer(deleteTarget.id, tenantId || undefined);
      toast.success("Customer deleted successfully");
      setDeleteTarget(null);
      await fetchCustomers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  });



  const columns: Column<Customer>[] = [
  {
    header: "Name",
    render: (customer) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {(customer.first_name?.[0] || "?").toUpperCase()}
        </div>
        <p className="font-semibold text-sm">
          {customer.first_name} {customer.last_name}
        </p>
      </div>
    ),
  },
  {
    header: "Email",
    render: (c) => <span className="text-sm">{c.email}</span>,
  },
  {
    header: "Phone",
    render: (c) =>
      c.phone || <span className="text-slate-300">—</span>,
  },
  {
    header: "Location",
    render: (c) =>
      c.city && c.state
        ? `${c.city}, ${c.state}`
        : c.city || c.state || <span className="text-slate-300">—</span>,
  },
  {
    header: "Orders",
    render: (c) => (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
        {c.total_orders || 0}
      </span>
    ),
  },
  {
    header: "Total Spent",
    render: (c) => `₹${(c.total_spent || 0).toLocaleString()}`,
  },
  {
    header: "Actions",
    render: (c) => (
      <div className="flex gap-2">
        <button onClick={() => openEditModal(c)}>
          <Edit className="w-4 h-4 text-blue-600" />
        </button>
        <button onClick={() => confirmDelete(c)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    ),
  },
];

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
            {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">
            {loading ? "Loading..." : `${customers.length} total customer${customers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
            <ProfilePlanButton pricing={pricing} businessDetails={businessDetails} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading customers...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
         <AppTable
  data={filtered}
  columns={columns}
  loading={loading}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search customers..."
  emptyMessage="No customers found"
  onAddFirst={openAddModal}
  addLabel="Add Customer"
/>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery ? "No customers match your search" : "No customers yet"}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            ) : (
              <Button className="mt-4" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Customer
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerModal
        open={showModal}
        editingId={editingId}
        form={form}
        onChange={setForm}
        onSubmit={handleSave}
        onClose={closeModal}
        saving={saving}
      />

      <DeleteModal
        open={!!deleteTarget}
        customerName={
          deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ""
        }
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
    </div>
  );
}
