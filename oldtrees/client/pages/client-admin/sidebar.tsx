import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  Package,
  DollarSign,
  Palette,
  Tag,
  Globe,
  FileText,
  BookOpen,
  Phone,
  CreditCard,
  Mail,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabType =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "discounts"
  | "appearance"
  | "settings"
  | "categories"
  | "seo"
  | "pages"
  | "blog"
  | "contact-us"
  | "payment-info"
  | "email-settings";

interface NavItem {
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: TrendingUp, label: "Dashboard" },
  { id: "products", icon: Package, label: "Products" },
  { id: "categories", icon: Tag, label: "Categories" },
  { id: "orders", icon: ShoppingCart, label: "Orders" },
  { id: "customers", icon: Users, label: "Customers" },
  { id: "discounts", icon: DollarSign, label: "Discounts" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "blog", icon: BookOpen, label: "Blog" },
  { id: "contact-us", icon: Phone, label: "Contact Us" },
  { id: "payment-info", icon: CreditCard, label: "Payment Info" },
  { id: "email-settings", icon: Mail, label: "Email Settings" },
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "seo", icon: Globe, label: "SEO" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogout: () => void;
  domain?: string;
  companyName?: string;
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export default function Sidebar({
  open,
  onToggle,
  currentTab,
  onTabChange,
  onLogout,
  domain,
  companyName,
}: SidebarProps) {
  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40 flex flex-col ${
        open ? "w-64" : "w-20"
      }`}
    >
      {/* Logo / Header */}
      <div className="p-6 flex items-center justify-between flex-shrink-0">
        {open && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">✦</span>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 block truncate">
                {companyName || "MyStore"}
              </span>
              <span className="text-xs text-slate-500 block truncate">{domain}</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ${
            !open ? "mx-auto" : ""
          }`}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={!open ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${!open ? "justify-center" : ""}`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-primary" : "text-slate-500"
                }`}
              />
              {open && (
                <span className="text-sm truncate">{item.label}</span>
              )}
              {/* Active dot when collapsed */}
              {!open && isActive && (
                <span className="absolute right-0 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 flex-shrink-0 border-t border-slate-100">
        <button
          onClick={onLogout}
          title={!open ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors ${
            !open ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {open && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Usage example (how to integrate into ClientAdminDashboard) ───────────────
//
// In ClientAdminDashboard.tsx, replace the inline sidebar markup with:
//
//   import Sidebar, { NAV_ITEMS, TabType } from "./Sidebar";
//
//   <Sidebar
//     open={sidebarOpen}
//     onToggle={() => setSidebarOpen(!sidebarOpen)}
//     currentTab={currentTab}
//     onTabChange={async (tab) => {
//       setCurrentTab(tab);
//       await fetchTabData(tab);
//     }}
//     onLogout={handleLogout}
//     domain={domain}
//     companyName={businessDetails?.company_name}
//   />
//
// And for SEO / Settings tabs, import the standalone pages:
//
//   import SEOPage from "./SEOPage";
//   import SettingsPage from "./SettingsPage";
//
//   {currentTab === "seo" && <SEOPage />}
//   {currentTab === "settings" && <SettingsPage />}
//
// Remove the old inline SEO and Settings JSX blocks from the dashboard.
