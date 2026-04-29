import { useNavigate, useParams, useLocation } from "react-router-dom";
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



import { useAuth } from "@/contexts/AuthContext";


// ─── Types ─────────────────────────────────────────────

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
  path: string;
}

// ─── NAV ITEMS (WITH PATH) ─────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: TrendingUp, label: "Dashboard", path: "DashboardPage" },
  { id: "products", icon: Package, label: "Products", path: "products" },
  { id: "categories", icon: Tag, label: "Categories", path: "categories" },
  { id: "orders", icon: ShoppingCart, label: "Orders", path: "orders" },
  { id: "customers", icon: Users, label: "Customers", path: "customers" },
  { id: "discounts", icon: DollarSign, label: "Discounts", path: "discounts" },
  { id: "pages", icon: FileText, label: "Pages", path: "pages" },
  { id: "blog", icon: BookOpen, label: "Blog", path: "blogs" },
  { id: "contact-us", icon: Phone, label: "Contact Us", path: "contact" },
  {
    id: "payment-info",
    icon: CreditCard,
    label: "Payment Info",
    path: "paymentinfopage",
  },
  {
    id: "email-settings",
    icon: Mail,
    label: "Email Settings",
    path: "emailsettingspage",
  },
  {
    id: "appearance",
    icon: Palette,
    label: "Appearance",
    path: "appearancepage",
  },
  { id: "seo", icon: Globe, label: "SEO", path: "seopage" },
  { id: "settings", icon: Settings, label: "Settings", path: "settingspage" },
];

// ─── Props ─────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
  companyName?: string;
}

// ─── Sidebar Component ─────────────────────────────────

export default function Sidebar({
  open,
  onToggle,
  onLogout,
  companyName,
}: SidebarProps) {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const location = useLocation();
  const { logout, handleTokenError } = useAuth();


 const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-40 flex flex-col ${
        open ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✦</span>
            </div>
            <span className="font-bold text-slate-900">
              {companyName || "MyStore"}
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          className={`p-2 hover:bg-slate-100 rounded-lg ${
            !open ? "mx-auto" : ""
          }`}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.includes(item.path);

          return (
            <button
              key={item.id}
              onClick={() =>
                navigate(`/client-admin/${tenantId}/${item.path}`)
              }
              title={!open ? item.label : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              } ${!open ? "justify-center" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              {open && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 ${
            !open ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {open && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}