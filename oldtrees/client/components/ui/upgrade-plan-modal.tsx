import { Button } from "@/components/ui/button";
import { X, Users, TrendingUp, Building2, CalendarDays } from "lucide-react";
import { createPortal } from "react-dom";

type BillingPlan = {
  id: string;
  name: string;
  description?: string;
  price?: number | null;
  currency?: string;
  billing_period?: string;
  features?: string[];
  popular?: boolean;
};

interface UpgradePlanModalProps {
  open: boolean;
  message?: string;
  plans: BillingPlan[];
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

function PlanIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const cls = "h-6 w-6 text-white";
  if (n.includes("yearly")) return <CalendarDays className={cls} />;
  if (n.includes("starter")) return <Users className={cls} />;
  if (n.includes("professional") || n.includes("pro")) return <TrendingUp className={cls} />;
  if (n.includes("enterprise")) return <Building2 className={cls} />;
  return <TrendingUp className={cls} />;
}

function planGradient(name: string) {
  const n = name.toLowerCase();
  if (n.includes("yearly")) return "from-violet-500 to-violet-700";
  if (n.includes("starter")) return "from-blue-500 to-indigo-600";
  if (n.includes("professional") || n.includes("pro")) return "from-teal-400 to-cyan-600";
  if (n.includes("enterprise")) return "from-orange-400 to-rose-500";
  return "from-indigo-500 to-purple-600";
}

export default function UpgradePlanModal({
  open,
  message,
  plans,
  selectedPlan,
  onSelectPlan,
  onClose,
  onConfirm,
  submitting = false,
}: UpgradePlanModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 h-8 w-8 flex items-center justify-center rounded-full border bg-white shadow-sm hover:bg-slate-50"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="text-center pt-2">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Plan Upgrade
            </span>
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              Choose the right plan for you
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {message || "You've reached your limit. Upgrade to unlock more features."}
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                Loading plans...
              </div>
            ) : (
              plans.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                return (
                  <button
                    key={plan.id}
                    onClick={() => onSelectPlan(plan.name)}
                    className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    )}

                    {/* Icon */}
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${planGradient(plan.name)} flex items-center justify-center mb-3 shadow-md`}>
                      <PlanIcon name={plan.name} />
                    </div>

                    {/* Name */}
                    <p className="text-sm font-semibold text-slate-800">{plan.name}</p>

                    {/* Description */}
                    <p className="mt-0.5 text-[11px] text-slate-400 leading-4 min-h-[28px]">
                      {plan.description || "Best for growing users."}
                    </p>

                    {/* Price */}
                    <div className="mt-3">
                      <span className="text-xl font-bold text-slate-900">
                        {plan.price != null
                          ? `${plan.currency || "₹"}${Number(plan.price).toLocaleString()}`
                          : "Free"}
                      </span>
                      {plan.price != null && (
                        <span className="text-[11px] text-slate-400 ml-1">
                          / {plan.billing_period}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mt-3 space-y-1.5">
                      {(plan.features || ["Unlimited usage", "Priority support", "Analytics"]).map(
                        (f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <span className="mt-0.5 h-3.5 w-3.5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">✓</span>
                            {f}
                          </li>
                        )
                      )}
                    </ul>

                    {/* Select */}
                    <div className={`mt-4 text-center text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}>
                      {isSelected ? "✓ Selected" : "Select Plan"}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xs text-slate-400">Secure payment. Cancel anytime.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-8 text-xs px-4"
              >
                Cancel
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}