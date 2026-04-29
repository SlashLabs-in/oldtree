import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Sidebar, { TabType } from "./sidebar";
import {
  getBlogPostsAdmin,
  createBlogPostAdmin,
  updateBlogPostAdmin,
  deleteBlogPostAdmin,
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category?: string;
  tags?: string | string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  is_published: boolean;
  created_at?: string;
}

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  category: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isPublished: boolean;
}

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImageUrl: "",
  category: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  isPublished: false,
};

// ─── Blog Post Modal ──────────────────────────────────────────────────────────

interface PostModalProps {
  open: boolean;
  editingId: string | null;
  form: PostForm;
  onChange: (form: PostForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}

function PostModal({
  open,
  editingId,
  form,
  onChange,
  onSubmit,
  onClose,
  saving,
}: PostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200 z-10">
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Blog Post" : "Add New Blog Post"}
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Blog Post Title"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="blog-post-slug"
              value={form.slug}
              onChange={(e) => onChange({ ...form, slug: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <Input
                placeholder="e.g., Technology, News"
                value={form.category}
                onChange={(e) => onChange({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <Input
                placeholder="tag1, tag2, tag3"
                value={form.tags}
                onChange={(e) => onChange({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Excerpt
            </label>
            <textarea
              placeholder="Short excerpt for listing pages"
              value={form.excerpt}
              onChange={(e) => onChange({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Content
            </label>
            <textarea
              placeholder="Blog post content"
              value={form.content}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              rows={6}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Featured Image URL
            </label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={form.featuredImageUrl}
              onChange={(e) => onChange({ ...form, featuredImageUrl: e.target.value })}
            />
          </div>

          {/* SEO Section */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-slate-900 mb-3">SEO Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SEO Title
                </label>
                <Input
                  placeholder="Blog Post Title - Your Brand"
                  value={form.seoTitle}
                  onChange={(e) => onChange({ ...form, seoTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  placeholder="Meta description for search engines"
                  value={form.seoDescription}
                  onChange={(e) => onChange({ ...form, seoDescription: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SEO Keywords
                </label>
                <Input
                  placeholder="keyword1, keyword2, keyword3"
                  value={form.seoKeywords}
                  onChange={(e) => onChange({ ...form, seoKeywords: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="publish-post"
              checked={form.isPublished}
              onChange={(e) => onChange({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 cursor-pointer"
            />
            <label htmlFor="publish-post" className="text-sm font-medium text-slate-700 cursor-pointer">
              Publish this blog post
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
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
  postTitle: string;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}

function DeleteModal({ open, postTitle, onConfirm, onClose, deleting }: DeleteModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Blog Post</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete <strong>"{postTitle}"</strong>?
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

// ─── Main BlogPage Component ──────────────────────────────────────────────────

export default function BlogPage() {
  const { tenantId } = useTenant();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("blog");


  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const data = await getBlogPostsAdmin({
          page: p,
          limit: 10,
          tenantId: tenantId || undefined,
        });
        setPosts(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        toast.error("Failed to load blog posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, page]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImageUrl: post.featured_image_url || "",
      category: post.category || "",
      tags: post.tags
        ? Array.isArray(post.tags)
          ? post.tags.join(", ")
          : post.tags
        : "",
      seoTitle: post.seo_title || "",
      seoDescription: post.seo_description || "",
      seoKeywords: post.seo_keywords || "",
      isPublished: post.is_published,
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
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt,
        content: form.content,
        featuredImageUrl: form.featuredImageUrl,
        category: form.category,
        tags: form.tags,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        seoKeywords: form.seoKeywords,
        isPublished: form.isPublished,
      };

      if (editingId) {
        await updateBlogPostAdmin(editingId, payload, tenantId || undefined);
        toast.success("Blog post updated successfully");
      } else {
        await createBlogPostAdmin(payload, tenantId || undefined);
        toast.success("Blog post created successfully");
      }
      closeModal();
      await fetchPosts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save blog post";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBlogPostAdmin(deleteTarget.id, tenantId || undefined);
      toast.success("Blog post deleted successfully");
      setDeleteTarget(null);
      await fetchPosts();
    } catch (err) {
      toast.error("Failed to delete blog post");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (

<div className="flex">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onLogout={() => console.log("logout")}
        domain="yourstore.com"
        companyName="My Store"
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
          <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-500 mt-1">
            {loading ? "Loading..." : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fetchPosts()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Blog Post
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title, slug, or category..."
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Published", value: posts.filter((p) => p.is_published).length },
          { label: "Drafts", value: posts.filter((p) => !p.is_published).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading blog posts...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Image thumbnail */}
                {post.featured_image_url ? (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 truncate">{post.title}</p>
                    {post.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        <Check className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">/{post.slug}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {post.category && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {post.category}
                      </span>
                    )}
                    {post.excerpt && (
                      <p className="text-xs text-slate-400 truncate max-w-xs">{post.excerpt}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => openEditModal(post)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery ? "No posts match your search" : "No blog posts yet"}
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
                Create First Blog Post
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => { const n = page - 1; setPage(n); fetchPosts(n); }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => { const n = page + 1; setPage(n); fetchPosts(n); }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PostModal
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
        postTitle={deleteTarget?.title || ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
    </div>
  );
}
