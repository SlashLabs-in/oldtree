import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Upload, X, Search,Trash2, Download,  Edit   } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  getClientProducts,
  getClientCategories,
  createClientProduct,
  updateClientProduct,
  deleteClientProduct,
  uploadProductImage,
  getBusinessDetails,
  getSuperAdminPricing,
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";
import Sidebar from "./sidebar";
// import ProductTable, { Product } from ".../components/client_Ui/table";
import AppTable, { Column } from "@/components/client_Ui/table";

import Header from "@/components/client_Ui/Header";
// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  price: string;
  costPrice: string;
  category: string;
  stockQuantity: string;
  imageUrl: string;
  imageFile: File | null;
}


interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost_price?: number;
  category?: string;
  stock_quantity?: number;
  image_url?: string;
}

const EMPTY_PRODUCT_FORM: ProductForm = {
  name: "",
  description: "",
  sku: "",
  price: "",
  costPrice: "",
  category: "",
  stockQuantity: "",
  imageUrl: "",
  imageFile: null,
};

// ─── Product Modal ────────────────────────────────────────────────────────────

interface ProductModalProps {
  open: boolean;
  editingId: string | null;
  form: ProductForm;
  categories: any[];
  onChange: (form: ProductForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
  imagePreview: string | null;
  uploadingImage: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProductModal({
  open,
  editingId,
  form,
  categories,
  onChange,
  onSubmit,
  onClose,
  saving,
  imagePreview,
  uploadingImage,
  onImageChange,
}: ProductModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200 z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Red Rose Bouquet"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
              <Input
                placeholder="Leave empty to auto-generate"
                value={form.sku}
                onChange={(e) => onChange({ ...form, sku: e.target.value })}
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave empty and we'll auto-generate a unique SKU
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Product description..."
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => onChange({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cost Price (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.costPrice}
                onChange={(e) => onChange({ ...form, costPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Qty
              </label>
              <Input
                type="number"
                placeholder="0"
                value={form.stockQuantity}
                onChange={(e) => onChange({ ...form, stockQuantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              {categories.length > 0 ? (
                <select
                  value={form.category}
                  onChange={(e) => onChange({ ...form, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Select category</option>
                  {categories.map((c: any) => (
                    <option key={c.id || c} value={c.name || c}>
                      {c.name || c}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="e.g. Flowers"
                  value={form.category}
                  onChange={(e) => onChange({ ...form, category: e.target.value })}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Image URL
              </label>
              <Input
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Or Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              disabled={uploadingImage}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            />
            {uploadingImage && (
              <p className="text-xs text-slate-500 mt-1">Uploading...</p>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 w-full h-32 object-cover rounded-lg border border-slate-200"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
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

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────

interface BulkUploadModalProps {
  open: boolean;
  file: File | null;
  loading: boolean;
  onFileChange: (f: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onDownloadTemplate: () => void;
}

function BulkUploadModal({
  open,
  file,
  loading,
  onFileChange,
  onSubmit,
  onClose,
  onDownloadTemplate,
}: BulkUploadModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Bulk Upload Products</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Upload Excel File</p>
              <p className="text-xs text-slate-500">
                Columns: Name, SKU, Price, Category, Stock Quantity, Description, Cost
                Price, Image URL
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDownloadTemplate}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            required
            disabled={loading}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
          />
          {file && <p className="text-xs text-slate-500">Selected: {file.name}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload Products"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
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
  productName: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, productName, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Product</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>"{productName}"</strong>?
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

// ─── Profile Plan Button ──────────────────────────────────────────────────────

function ProfilePlanButton({
  pricing,
  businessDetails,
}: {
  pricing: any[];
  businessDetails: any;
}) {
  const [show, setShow] = useState(false);

  const billingPlanKey =
    businessDetails?.billing_plan || businessDetails?.billingPlan || "";
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

// ─── Main ProductPage ─────────────────────────────────────────────────────────

export default function ProductPage() {
  const { tenantId } = useTenant();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Product modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Bulk upload
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(
    async (p = 1, search = "") => {
      setLoading(true);
      try {
        const [prodsData, catsData] = await Promise.all([
          getClientProducts({ page: p, limit: 10000, search: search, tenantId: tenantId || undefined }),
          getClientCategories(tenantId || undefined),
        ]);
        setProducts(prodsData.data || []);
        setTotalPages(prodsData.pagination?.pages || 1);
        setCategories(catsData.data || []);
      } catch {
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  useEffect(() => {
     fetchProducts(1, searchQuery);
    getBusinessDetails(tenantId || undefined)
      .then((d) => setBusinessDetails(d.data))
      .catch(() => {});
    getSuperAdminPricing()
      .then((d) => setPricing(d.data || []))
      .catch(() => {});
  }, [searchQuery,fetchProducts, tenantId]);

  // ── Image upload ─────────────────────────────────────────────────────────

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      const result = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, imageUrl: result.data.imageUrl, imageFile: file }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.price || parseFloat(form.price) <= 0)
      return toast.error("Valid price is required");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        sku: form.sku,
        price: parseFloat(form.price),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        category: form.category,
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : 0,
        imageUrl: form.imageUrl,
      };

      if (editingId) {
        await updateClientProduct(editingId, payload, tenantId || undefined);
        toast.success("Product updated successfully");
      } else {
        await createClientProduct(payload, tenantId || undefined);
        toast.success("Product created successfully");
      }

      closeModal();
      await fetchProducts(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClientProduct(deleteTarget.id, tenantId || undefined);
      toast.success("Product deleted");
      setDeleteTarget(null);
      await fetchProducts(page);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // ── Bulk upload ──────────────────────────────────────────────────────────

  const handleDownloadTemplate = async () => {
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Products");
      const headers = [
        "Name", "SKU", "Price", "Category", "Stock Quantity",
        "Description", "Cost Price", "Image URL",
      ];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF366092" },
      };
      worksheet.columns = [
        { width: 25 }, { width: 15 }, { width: 12 }, { width: 15 },
        { width: 15 }, { width: 30 }, { width: 12 }, { width: 25 },
      ];
      for (let i = 0; i < 3; i++) worksheet.addRow(Array(headers.length).fill(""));
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Products-Template-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Template downloaded!");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return toast.error("Please select a file");
    setBulkLoading(true);
    try {
      const WorkbookType = (await import("exceljs")).Workbook;
      const workbook = new WorkbookType();
      await workbook.xlsx.load(await bulkFile.arrayBuffer());
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return toast.error("No data found in file");

      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell) =>
        headers.push(String(cell.value || "").toLowerCase().trim())
      );

      const nameIdx = headers.indexOf("name");
      const priceIdx = headers.indexOf("price");
      if (nameIdx === -1 || priceIdx === -1)
        return toast.error("File must have 'Name' and 'Price' columns");

      const skuIdx = headers.indexOf("sku");
      const catIdx = headers.indexOf("category");
      const stockIdx = headers.indexOf("stock quantity");
      const descIdx = headers.indexOf("description");
      const costIdx = headers.indexOf("cost price");
      const imgIdx = headers.indexOf("image url");

      let success = 0, fail = 0;
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const name = String(row.getCell(nameIdx + 1).value || "").trim();
        const price = row.getCell(priceIdx + 1).value;
        if (!name || !price) continue;
        try {
          const priceNum = parseFloat(String(price));
          if (isNaN(priceNum) || priceNum <= 0) { fail++; continue; }
          await createClientProduct(
            {
              name,
              sku: skuIdx !== -1 ? String(row.getCell(skuIdx + 1).value || "") : "",
              price: priceNum,
              category: catIdx !== -1 ? String(row.getCell(catIdx + 1).value || "") : "",
              stockQuantity: stockIdx !== -1 ? parseInt(String(row.getCell(stockIdx + 1).value || "0")) || 0 : 0,
              description: descIdx !== -1 ? String(row.getCell(descIdx + 1).value || "") : "",
              costPrice: costIdx !== -1 ? parseFloat(String(row.getCell(costIdx + 1).value || "0")) || undefined : undefined,
              imageUrl: imgIdx !== -1 ? String(row.getCell(imgIdx + 1).value || "") : "",
            },
            tenantId || undefined
          );
          success++;
        } catch { fail++; }
      }

      if (success > 0) toast.success(`${success} product(s) uploaded`);
      if (fail > 0) toast.error(`${fail} product(s) failed`);
      setShowBulkModal(false);
      setBulkFile(null);
      await fetchProducts(1);
    } catch {
      toast.error("Failed to process file");
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      description: p.description || "",
      sku: p.sku || "",
      price: p.price?.toString() || "",
      costPrice: p.cost_price != null ? p.cost_price.toString() : "",
      category: p.category || "",
      stockQuantity: p.stock_quantity != null ? p.stock_quantity.toString() : "",
      imageUrl: p.image_url || "",
      imageFile: null,
    });
    setImagePreview(p.image_url || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setImagePreview(null);
  };


  const productColumns = [
  {
    header: "Image",
    render: (p: Product) =>
      p.image_url ? (
        <img
          src={p.image_url}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-lg">
          No Img
        </div>
      ),
  },
  {
    header: "Name",
    render: (p: Product) => (
      <div>
        <p className="font-semibold">{p.name}</p>
        <p className="text-xs text-slate-400">{p.description}</p>
      </div>
    ),
  },
  {
    header: "Price",
    render: (p: Product) => `₹${p.price}`,
  },
  {
    header: "Stock",
    render: (p: Product) => p.stock_quantity ?? 0,
  },
 {
  header: "Actions",
  render: (p: Product) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => openEdit(p)}
        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </button>

      <button
        onClick={() => setDeleteTarget(p)}
        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ),
}
];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={() => console.log("logout")}
      />
      <div
        className={`flex-1 min-h-screen bg-slate-100 p-6 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >


<Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title="Products"
        />

        {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 mt-5">
  
  
  <div className="relative w-full sm:basis-[80%]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    
    <input
      type="text"
      placeholder="Search by name, slug, or description..."
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

  {/* 🔘 Buttons - 20% */}
  <div className="flex gap-3 w-full sm:basis-[20%] sm:justify-end">
   

    <Button variant="outline" onClick={() => setShowBulkModal(true)}>
      <Upload className="w-4 h-4 mr-2" />
      Bulk Upload
    </Button>

    <Button onClick={openAdd}>
      <Plus className="w-4 h-4 mr-2" />
      Add Product
    </Button>
  </div>

</div>


     



        {/* ← Reusable ProductTable */}
        <AppTable
          data={products}
          columns={productColumns}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            fetchProducts(p, searchQuery);
          }}
          emptyMessage="No products"
        />

        {/* Modals */}
        <ProductModal
          open={showModal}
          editingId={editingId}
          form={form}
          categories={categories}
          onChange={setForm}
          onSubmit={handleSave}
          onClose={closeModal}
          saving={saving}
          imagePreview={imagePreview}
          uploadingImage={uploadingImage}
          onImageChange={handleImageChange}
        />

        <BulkUploadModal
          open={showBulkModal}
          file={bulkFile}
          loading={bulkLoading}
          onFileChange={setBulkFile}
          onSubmit={handleBulkUpload}
          onClose={() => { setShowBulkModal(false); setBulkFile(null); }}
          onDownloadTemplate={handleDownloadTemplate}
        />

        <DeleteModal
          open={!!deleteTarget}
          productName={deleteTarget?.name || ""}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      </div>
    </div>
  );
}
