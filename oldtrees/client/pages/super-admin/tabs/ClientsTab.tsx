import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit, Trash2, Pause, Play } from "lucide-react";

interface ClientsTabProps {
  clients: any[];
   pricing?: any[];
  showClientModal: boolean;
  editingClientId: string | null;
  clientForm: {
    companyName: string;
    domain: string;
    contactEmail: string;
    contactPhone: string;
    billingPlan: string;
  };
  onOpenModal: () => void;
  onCloseModal: () => void;
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (client: any) => void;
  onSuspend: (clientId: string, isSuspended: boolean) => void;
  onDelete: (clientId: string) => void;
}

export function ClientsTab({
  clients,
  pricing = [],
  showClientModal,
  editingClientId,
  clientForm,
  onOpenModal,
  onCloseModal,
  onFormChange,
  onSubmit,
  onEdit,
  onSuspend,
  onDelete,
}: ClientsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Clients ({clients.length})
        </h2>
        <Button onClick={onOpenModal} className="group">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {editingClientId ? "Edit Client" : "Add New Client"}
              </h3>
              <button
                onClick={onCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Company Name *
                  </label>
                  <Input
                    value={clientForm.companyName}
                    onChange={(e) =>
                      onFormChange({
                        ...clientForm,
                        companyName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Domain
                  </label>
                  <Input
                    value={clientForm.domain}
                    onChange={(e) =>
                      onFormChange({
                        ...clientForm,
                        domain: e.target.value,
                      })
                    }
                    placeholder="store.example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    value={clientForm.contactEmail}
                    onChange={(e) =>
                      onFormChange({
                        ...clientForm,
                        contactEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    value={clientForm.contactPhone}
                    onChange={(e) =>
                      onFormChange({
                        ...clientForm,
                        contactPhone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Billing Plan *
                </label>
                <Input
                  value={clientForm.billingPlan}
                  onChange={(e) =>
                    onFormChange({
                      ...clientForm,
                      billingPlan: e.target.value,
                    })
                  }
                  required
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Billing Plan *
                </label>
                <select
                  value={clientForm.billingPlan}
                  onChange={(e) =>
                    onFormChange({
                      ...clientForm,
                      billingPlan: e.target.value,
                    })
                  }
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="">Select a plan</option>
                  {pricing.map((plan: any) => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingClientId ? "Update" : "Create"}
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

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {clients.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Billing Plan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client: any) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {client.company_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {client.domain || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {client.contact_email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {client.billing_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        client.is_suspended
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {client.is_suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(client)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => onSuspend(client.id, client.is_suspended)}
                        className={`p-2 rounded-lg transition-colors ${
                          client.is_suspended
                            ? "hover:bg-green-50"
                            : "hover:bg-orange-50"
                        }`}
                        title={client.is_suspended ? "Reactivate" : "Suspend"}
                      >
                        {client.is_suspended ? (
                          <Play className="w-4 h-4 text-green-600" />
                        ) : (
                          <Pause className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(client.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-600">No clients yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
