import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Eye,
  Download,
  Printer,
  Search,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  getClientOrders,
  updateOrderStatus,
  getClientAdminDashboard,
  getBusinessDetails,
  getSuperAdminPricing,
} from "@/lib/api";
import { useTenant } from "@/hooks/use-tenant";
import Sidebar, { TabType } from "./sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  discount_amount?: number;
  tax_amount?: number;
  status: string;
  payment_status?: string;
  shipping_address?: any;
  items?: OrderItem[];
  created_at: string;
}

// ─── Status Badge Styles ──────────────────────────────────────────────────────

const orderStatusStyle = (status: string) => {
  switch (status) {
    case "pending":      return "bg-yellow-100 text-yellow-800";
    case "processing":   return "bg-blue-100 text-blue-800";
    case "shipped":      return "bg-purple-100 text-purple-800";
    case "delivered":    return "bg-emerald-100 text-emerald-800";
    default:             return "bg-slate-100 text-slate-800";
  }
};

const paymentStatusStyle = (status: string) => {
  switch (status) {
    case "pending":    return "bg-yellow-100 text-yellow-800";
    case "processing": return "bg-blue-100 text-blue-800";
    case "completed":  return "bg-emerald-100 text-emerald-800";
    case "failed":     return "bg-red-100 text-red-800";
    default:           return "bg-slate-100 text-slate-800";
  }
};

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
  onUpdatePaymentStatus: (orderId: string, status: string) => Promise<void>;
  onPrint: () => void;
}

function OrderModal({
  order,
  onClose,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onPrint,
}: OrderModalProps) {
  if (!order) return null;

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-slate-200 bg-white flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            Order #{order.order_number}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Name</p>
                <p className="font-medium text-slate-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                <p className="font-medium text-slate-900">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                <p className="font-medium text-slate-900">{order.customer_phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Order Date</p>
                <p className="font-medium text-slate-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Shipping Address</h4>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                {(() => {
                  try {
                    const addr =
                      typeof order.shipping_address === "string"
                        ? JSON.parse(order.shipping_address)
                        : order.shipping_address;
                    return addr.address || JSON.stringify(addr);
                  } catch {
                    return order.shipping_address;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Order Items</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Product</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Qty</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-700">Price</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                        No items
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-900">
                          {item.product_name || `Product (${item.product_id})`}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          ₹{parseInt(String(item.unit_price || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ₹{parseInt(String(item.total_price || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Order Summary</h4>
            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{((order.total_amount || 0) + (order.discount_amount || 0)).toLocaleString()}</span>
              </div>
              {(order.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount!.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 text-base">
                <span>Total</span>
                <span>₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Order Status</h4>
            <select
              value={order.status}
              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border font-medium cursor-pointer text-sm ${orderStatusStyle(order.status)}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Payment Status</h4>
            <select
              value={order.payment_status || "pending"}
              onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border font-medium cursor-pointer text-sm ${paymentStatusStyle(order.payment_status || "pending")}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Close
          </button>
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

// ─── Main OrdersPage ──────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [pricing, setPricing] = useState<any[]>([]);
  const { tenantId } = useTenant();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [businessDetails, setBusinessDetails] = useState<any>(null);


 const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>("orders");


  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientOrders(tenantId || undefined);
      setOrders(data.data || []);
    } catch {
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // useEffect(() => {
  //   fetchOrders();
  //   getBusinessDetails(tenantId || undefined)
  //     .then((d) => setBusinessDetails(d.data))
  //     .catch(() => {});
  // }, [fetchOrders, tenantId]);
  useEffect(() => {
    fetchOrders();
    getBusinessDetails(tenantId || undefined)
      .then((d) => setBusinessDetails(d.data))
      .catch(() => {});
    getSuperAdminPricing()
      .then((d) => setPricing(d.data || []))
      .catch(() => {});
  }, [fetchOrders, tenantId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success("Order status updated");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
      }
      try { await getClientAdminDashboard(); } catch {}
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await updateOrderStatus(orderId, undefined, paymentStatus);
      toast.success("Payment status updated");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: paymentStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, payment_status: paymentStatus } : prev);
      }
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const handlePrintOrder = () => {
    if (!selectedOrder) return;
    const items: OrderItem[] = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
    const printContent = `
      <!DOCTYPE html><html><head><title>Order #${selectedOrder.order_number}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}th{background:#f0f0f0}.total{font-weight:bold}</style>
      </head><body>
      <h2>Invoice - Order #${selectedOrder.order_number}</h2>
      <p><strong>Customer:</strong> ${selectedOrder.customer_name} | ${selectedOrder.customer_email}</p>
      <p><strong>Date:</strong> ${new Date(selectedOrder.created_at).toLocaleDateString()}</p>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${items.map((i) => `<tr><td>${i.product_name || i.product_id}</td><td>${i.quantity}</td><td>₹${i.unit_price}</td><td>₹${i.total_price}</td></tr>`).join("")}</tbody>
      </table>
      <p class="total">Total: ₹${selectedOrder.total_amount.toLocaleString()}</p>
      </body></html>`;
    const w = window.open("", "", "height=800,width=800");
    if (w) { w.document.write(printContent); w.document.close(); w.print(); }
  };

  const handleDownloadPDF = (order: Order) => {
    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
    const companyName = businessDetails?.company_name || "Store";
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${order.order_number}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto}h1{color:#1e40af}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#f3f4f6;padding:10px;text-align:left;border:1px solid #e5e7eb}td{padding:10px;border:1px solid #e5e7eb}.total{font-weight:bold;font-size:18px;color:#1e40af}</style>
    </head><body>
    <h1>Invoice</h1><p><strong>${companyName}</strong></p>
    <p><strong>Order #:</strong> ${order.order_number}</p>
    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
    <p><strong>Customer:</strong> ${order.customer_name} | ${order.customer_email}</p>
    <table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
    <tbody>${items.map((i) => `<tr><td>${i.product_name || i.product_id}</td><td>${i.quantity}</td><td>₹${i.unit_price}</td><td>₹${i.total_price}</td></tr>`).join("")}</tbody>
    </table>
    <p class="total">Total: ₹${order.total_amount.toLocaleString()}</p>
    <p><strong>Status:</strong> ${order.status} | <strong>Payment:</strong> ${order.payment_status || "pending"}</p>
    </body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Order-${order.order_number}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("Invoice downloaded! Open in browser and print to PDF.");
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

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
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">
            {loading ? "Loading..." : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {/* <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button> */}
        <div className="flex items-center gap-3">
    <Button variant="outline" onClick={fetchOrders} disabled={loading}>
    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
    Refresh
  </Button>
  {/* <ProfilePlanButton pricing={pricing} /> */}
  <ProfilePlanButton pricing={pricing} businessDetails={businessDetails} />
</div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Pending", value: pendingCount },
          { label: "Delivered", value: deliveredCount },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name or email..."
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
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Loading orders...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Order #", "Customer", "Amount", "Payment", "Status", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 text-sm">
                        {order.order_number}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 text-sm">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{order.customer_email}</p>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900 text-sm">
                      ₹{order.total_amount?.toLocaleString()}
                    </td>

                    {/* Payment Status Inline Select */}
                    <td className="px-5 py-4">
                      <select
                        value={order.payment_status || "pending"}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${paymentStatusStyle(order.payment_status || "pending")}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>

                    {/* Order Status Inline Select */}
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${orderStatusStyle(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order)}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery || statusFilter !== "all"
                ? "No orders match your filters"
                : "No orders yet"}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => { setShowOrderModal(false); setSelectedOrder(null); }}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onPrint={handlePrintOrder}
        />
      )}
    </div>
    </div>
  );
}
