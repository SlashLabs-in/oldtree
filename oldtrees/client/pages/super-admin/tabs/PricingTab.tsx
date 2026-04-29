import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit, Trash2, Tag } from "lucide-react";

interface PricingTabProps {
  pricing: any[];
  showPricingModal: boolean;
  editingPricingId: string | null;
  pricingForm: {
    name: string;
    description: string;
    price: string;
    currency: string;
    billingPeriod: string;
    features: string;
  };
  selectedFeatureValues: string[];
  featuresCategories: any[];
  onOpenModal: () => void;
  onCloseModal: () => void;
  onFormChange: (form: any) => void;
  onSelectedFeaturesChange: (features: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (plan: any) => void;
  onDelete: (pricingId: string) => void;
}

export function PricingTab({
  pricing,
  showPricingModal,
  editingPricingId,
  pricingForm,
  selectedFeatureValues,
  featuresCategories,
  onOpenModal,
  onCloseModal,
  onFormChange,
  onSelectedFeaturesChange,
  onSubmit,
  onEdit,
  onDelete,
}: PricingTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Pricing Plans
        </h2>
        <Button onClick={onOpenModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Pricing Plan
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricing && pricing.length > 0 ? (
          pricing.map((plan: any) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg border border-slate-200 p-8 hover:shadow-lg transition-shadow relative"
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onEdit(plan)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => onDelete(plan.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price ? (
                      <>
                        {plan.currency}
                        {plan.price.toLocaleString()}
                      </>
                    ) : (
                      "Custom"
                    )}
                  </span>
                  {plan.billing_period && plan.billing_period !== "custom" && (
                    <span className="text-slate-600">/{plan.billing_period}</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">
                  Features
                </h4>
                <ul className="space-y-3">
                  {plan.features && plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 p-12 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No pricing plans available</p>
          </div>
        )}
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {editingPricingId ? "Edit Pricing Plan" : "Add New Pricing Plan"}
              </h3>
              <button
                onClick={onCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={onSubmit}
              className="p-6 space-y-4"
              autoComplete="off"
            >
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Plan Name *
                </label>
                <Input
                  value={pricingForm.name}
                  onChange={(e) =>
                    onFormChange({ ...pricingForm, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description
                </label>
                <Input
                  value={pricingForm.description}
                  onChange={(e) =>
                    onFormChange({ ...pricingForm, description: e.target.value })
                  }
                />
              </div>

              {/* Price & Currency */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricingForm.price}
                    onChange={(e) =>
                      onFormChange({ ...pricingForm, price: e.target.value })
                    }
                    placeholder="e.g., 1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Currency
                  </label>
                  <Input
                    value={pricingForm.currency}
                    onChange={(e) =>
                      onFormChange({ ...pricingForm, currency: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Billing Period */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Billing Period *
                </label>
                <select
                  value={pricingForm.billingPeriod}
                  onChange={(e) =>
                    onFormChange({ ...pricingForm, billingPeriod: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Features
                </label>
                {featuresCategories.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto border border-slate-300 rounded-lg p-4">
                    {featuresCategories.map((category: any) => (
                      <div key={category.id}>
                        <p className="text-sm font-semibold text-slate-900 mb-2">
                          {category.name}
                        </p>
                        <div className="space-y-2 ml-2">
                          {category.categories &&
                            category.categories.map((cat: string) => (
                              <label
                                key={cat}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFeatureValues.includes(cat)}
                                  onChange={(e) => {
                                    const newValues = e.target.checked
                                      ? [...selectedFeatureValues, cat]
                                      : selectedFeatureValues.filter((f) => f !== cat);
                                    onSelectedFeaturesChange(newValues);
                                  }}
                                  className="w-4 h-4"
                                />
                                {cat}
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={pricingForm.features}
                    onChange={(e) =>
                      onFormChange({ ...pricingForm, features: e.target.value })
                    }
                    rows={4}
                    placeholder="Enter features (one per line)"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-sm"
                  />
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPricingId ? "Update" : "Create"}
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
