import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  getPagesAdmin,
  createPageAdmin,
  updatePageAdmin,
  deletePageAdmin,
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  featured_image_url?: string;
  is_published: boolean;
  created_at?: string;
}

interface PageForm {
  title: string;
  slug: string;
  description: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImageUrl: string;
  isPublished: boolean;
}

const EMPTY_FORM: PageForm = {
  title: "",
  slug: "",
  description: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  featuredImageUrl: "",
  isPublished: false,
};

// ─── Page Modal ───────────────────────────────────────────────────────────────

interface PageModalProps {
  open: boolean;
  editingId: string | null;
  form: PageForm;
  onChange: (form: PageForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

function PageModal({
  open,
  editingId,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: PageModalProps) {
  if (!open) return null;

  const generateSlug = (title: string) =>
    title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleTitleChange = (title: string) => {
    onChange({
      ...form,
      title,
      slug: editingId ? form.slug : generateSlug(title),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h3 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Page" : "Add New Page"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Page Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="About Us"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.slug}
              onChange={(e) => onChange({ ...form, slug: e.target.value })}
              placeholder="about-us"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Used in URL: /pages/{form.slug || "slug"}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Short description (optional)"
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              placeholder="Page content (HTML supported)"
              rows={6}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Featured Image URL
            </label>
            <Input
              value={form.featuredImageUrl}
              onChange={(e) => onChange({ ...form, featuredImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* SEO Section */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide text-slate-500">
              SEO Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SEO Title</label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => onChange({ ...form, seoTitle: e.target.value })}
                  placeholder="About Us - Your Brand Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => onChange({ ...form, seoDescription: e.target.value })}
                  placeholder="Meta description for search engines (150-160 chars recommended)"
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {form.seoDescription && (
                  <p className={`text-xs mt-1 ${form.seoDescription.length > 160 ? "text-red-500" : "text-slate-400"}`}>
                    {form.seoDescription.length}/160 characters
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SEO Keywords
                </label>
                <Input
                  value={form.seoKeywords}
                  onChange={(e) => onChange({ ...form, seoKeywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="page-published"
              checked={form.isPublished}
              onChange={(e) => onChange({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="page-published" className="cursor-pointer flex-1">
              <p className="text-sm font-medium text-slate-900">Publish this page</p>
              <p className="text-xs text-slate-500">
                {form.isPublished ? "Page is visible to visitors" : "Page is hidden (draft)"}
              </p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Page" : "Create Page"}
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
  pageTitle: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, pageTitle, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Page</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>{pageTitle}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="destructive" className="flex-1" onClick={onConfirm} disabled={deleting}>
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

// ─── Main PagesPage ───────────────────────────────────────────────────────────

const LIMIT = 10;

export default function PagesPage() {
  const { tenantId } = useTenant();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PageForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPages = useCallback(
    async (page = currentPage) => {
      setLoading(true);
      try {
        const data = await getPagesAdmin({
          page,
          limit: LIMIT,
          tenantId: tenantId || undefined,
        });
        setPages(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch {
        toast.error("Failed to load pages");
        setPages([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, currentPage]
  );

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (page: Page) => {
    setEditingId(page.id);
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description || "",
      content: page.content || "",
      seoTitle: page.seo_title || "",
      seoDescription: page.seo_description || "",
      seoKeywords: page.seo_keywords || "",
      featuredImageUrl: page.featured_image_url || "",
      isPublished: page.is_published,
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
    if (!form.title.trim()) return toast.error("Page title is required");
    if (!form.slug.trim()) return toast.error("Page slug is required");

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description,
        content: form.content,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        seoKeywords: form.seoKeywords,
        featuredImageUrl: form.featuredImageUrl,
        isPublished: form.isPublished,
      };

      if (editingId) {
        await updatePageAdmin(editingId, payload, tenantId || undefined);
        toast.success("Page updated successfully");
      } else {
        await createPageAdmin(payload, tenantId || undefined);
        toast.success("Page created successfully");
      }
      closeModal();
      await fetchPages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save page";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePageAdmin(deleteTarget.id, tenantId || undefined);
      toast.success("Page deleted successfully");
      setDeleteTarget(null);
      await fetchPages();
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setDeleting(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await fetchPages(newPage);
  };

  // ── Filter (client-side on current page data) ──────────────────────────────

  const filtered = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.is_published) ||
      (statusFilter === "draft" && !p.is_published);
    return matchesSearch && matchesStatus;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pages</h1>
          <p className="text-slate-500 mt-1">
            {loading ? "Loading..." : `${pages.length} page${pages.length !== 1 ? "s" : ""} on this page`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fetchPages()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages by title, slug or description..."
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Pages</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Cards / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading pages...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm">{page.title}</p>
                    {page.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        <Check className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs text-slate-500">/{page.slug}</code>
                    {page.description && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        · {page.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* SEO Indicator */}
                {page.seo_title && (
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded hidden sm:inline">
                    SEO ✓
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEditModal(page)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Edit page"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(page)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery || statusFilter !== "all" ? "No pages match your filters" : "No pages yet"}
            </p>
            {searchQuery || statusFilter !== "all" ? (
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <Button className="mt-4" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Page
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PageModal
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
        pageTitle={deleteTarget?.title || ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
