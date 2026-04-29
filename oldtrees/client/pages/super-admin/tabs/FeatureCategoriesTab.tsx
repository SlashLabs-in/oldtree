import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit, Trash2 } from "lucide-react";

interface FeatureCategoriesTabProps {
  featuresCategories: any[];
  showFeaturesModal: boolean;
  editingFeatureCategoryId: string | null;
  featureCategoryForm: {
    name: string;
    categories: string;
  };
  onOpenModal: () => void;
  onCloseModal: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (item: any) => void;
  onDelete: (itemId: string) => void;
}

export function FeatureCategoriesTab({
  featuresCategories,
  showFeaturesModal,
  editingFeatureCategoryId,
  featureCategoryForm,
  onOpenModal,
  onCloseModal,
  onFormChange,
  onSubmit,
  onEdit,
  onDelete,
}: FeatureCategoriesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Feature Categories
          </h2>
          <p className="text-slate-600 mt-1">
            Manage feature category groups and their associated category values.
          </p>
        </div>
        <Button onClick={onOpenModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Feature Category
        </Button>
      </div>

      {featuresCategories.length > 0 ? (
        <div className="overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Categories
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {featuresCategories.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {item.categories && item.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.categories.map((category: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">No categories</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => onEdit(item)}
                        className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-600 mb-4">No feature categories yet.</p>
          <Button onClick={onOpenModal}>Create first feature category</Button>
        </div>
      )}

      {showFeaturesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingFeatureCategoryId ? "Edit Feature Category" : "Add Feature Category"}
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Enter the name and category values for this feature category group.
                </p>
              </div>
              <button
                onClick={onCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Feature Category Name *
                </label>
                <Input
                  value={featureCategoryForm.name}
                  onChange={(e) =>
                    onFormChange({
                      ...featureCategoryForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Categories (one per line)
                </label>
                <textarea
                  value={featureCategoryForm.categories}
                  onChange={(e) =>
                    onFormChange({
                      ...featureCategoryForm,
                      categories: e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Category 1\nCategory 2\nCategory 3"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFeatureCategoryId ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
