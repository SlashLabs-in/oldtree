import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  RefreshCw,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  getClientDiscounts,
  createClientDiscount,
  updateClientDiscount,
  deleteClientDiscount,
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Discount {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

interface DiscountForm {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
}

const EMPTY_FORM: DiscountForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  validFrom: "",
  validUntil: "",
};

// ─── Discount Modal ───────────────────────────────────────────────────────────

interface DiscountModalProps {
  open: boolean;
  editingId: string | null;
  form: DiscountForm;
  onChange: (form: DiscountForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

function DiscountModal({
  open,
  editingId,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: DiscountModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200 z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Discount" : "Create Discount Code"}
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount Code <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. SAVE10"
                value={form.code}
                onChange={(e) =>
                  onChange({ ...form, code: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.discountType}
                onChange={(e) => onChange({ ...form, discountType: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <Input
              placeholder="e.g. 10% off on first purchase"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {form.discountType === "percentage" ? "%" : "₹"}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.discountValue}
                  onChange={(e) =>
                    onChange({ ...form, discountValue: e.target.value })
                  }
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Min Order (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0"
                value={form.minOrderAmount}
                onChange={(e) =>
                  onChange({ ...form, minOrderAmount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Uses
              </label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={(e) => onChange({ ...form, maxUses: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valid From
              </label>
              <Input
                type="date"
                value={form.validFrom}
                onChange={(e) => onChange({ ...form, validFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valid Until
              </label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  onChange({ ...form, validUntil: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                ? "Update Discount"
                : "Create Discount"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  open: boolean;
  code: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, code, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Discount</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete discount code{" "}
          <strong className="font-mono">{code}</strong>?
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

// ─── Main DiscountPage ────────────────────────────────────────────────────────

export default function DiscountPage() {
  const { tenantId } = useTenant();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientDiscounts(tenantId || undefined);
      setDiscounts(data.data || []);
    } catch {
      toast.error("Failed to load discounts");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("Discount code is required");
    if (!form.discountValue || parseFloat(form.discountValue) <= 0)
      return toast.error("Valid discount value is required");

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || "",
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount
          ? parseFloat(form.minOrderAmount)
          : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
      };

      if (editingId) {
        await updateClientDiscount(editingId, payload, tenantId || undefined);
        toast.success("Discount updated successfully");
      } else {
        await createClientDiscount(payload, tenantId || undefined);
        toast.success("Discount created successfully");
      }

      closeModal();
      await fetchDiscounts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save discount";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClientDiscount(deleteTarget.id, tenantId || undefined);
      toast.success("Discount deleted");
      setDeleteTarget(null);
      await fetchDiscounts();
    } catch {
      toast.error("Failed to delete discount");
    } finally {
      setDeleting(false);
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (d: Discount) => {
    setEditingId(d.id);
    setForm({
      code: d.code || "",
      description: d.description || "",
      discountType: d.discount_type || "percentage",
      discountValue: d.discount_value?.toString() || "",
      minOrderAmount: d.min_order_amount?.toString() || "",
      maxUses: d.max_uses?.toString() || "",
      validFrom: d.valid_from
        ? new Date(d.valid_from).toISOString().split("T")[0]
        : "",
      validUntil: d.valid_until
        ? new Date(d.valid_until).toISOString().split("T")[0]
        : "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = discounts.filter((d) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      d.code.toLowerCase().includes(q) ||
      (d.description || "").toLowerCase().includes(q)
    );
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  const activeCount = discounts.filter((d) => d.is_active).length;
  const totalUses = discounts.reduce((s, d) => s + (d.used_count || 0), 0);
  const percentageCount = discounts.filter(
    (d) => d.discount_type === "percentage"
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Discounts</h1>
          <p className="text-slate-500 mt-1">
            {loading
              ? "Loading..."
              : `${discounts.length} discount code${discounts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchDiscounts}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Discount
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by code or description..."
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Codes", value: discounts.length },
          { label: "Active", value: activeCount },
          { label: "Total Uses", value: totalUses },
          { label: "% Type", value: percentageCount },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading discounts...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Code",
                    "Description",
                    "Value",
                    "Min Order",
                    "Usage",
                    "Validity",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((discount) => {
                  const now = new Date();
                  const expired =
                    discount.valid_until &&
                    new Date(discount.valid_until) < now;
                  const notStarted =
                    discount.valid_from &&
                    new Date(discount.valid_from) > now;

                  return (
                    <tr
                      key={discount.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-bold text-slate-900 font-mono text-sm tracking-wide">
                            {discount.code}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 text-sm text-slate-500 max-w-[180px]">
                        <span className="line-clamp-1">
                          {discount.description || (
                            <span className="text-slate-300">—</span>
                          )}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700">
                          {discount.discount_type === "percentage"
                            ? `${discount.discount_value}%`
                            : `₹${discount.discount_value}`}
                        </span>
                      </td>

                      {/* Min Order */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {discount.min_order_amount
                          ? `₹${discount.min_order_amount.toLocaleString()}`
                          : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="font-semibold">
                          {discount.used_count || 0}
                        </span>
                        <span className="text-slate-400">
                          {" "}/ {discount.max_uses ?? "∞"}
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {discount.valid_from || discount.valid_until ? (
                          <div className="space-y-0.5">
                            {discount.valid_from && (
                              <p>
                                From:{" "}
                                {new Date(discount.valid_from).toLocaleDateString()}
                              </p>
                            )}
                            {discount.valid_until && (
                              <p>
                                Until:{" "}
                                {new Date(
                                  discount.valid_until
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">No limit</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {expired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                            <XCircle className="w-3 h-3" />
                            Expired
                          </span>
                        ) : notStarted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                            Scheduled
                          </span>
                        ) : discount.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(discount)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(discount)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery
                ? "No discounts match your search"
                : "No discount codes yet"}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            ) : (
              <Button className="mt-4" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Discount
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DiscountModal
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
        code={deleteTarget?.code || ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
