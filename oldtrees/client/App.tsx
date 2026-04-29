import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { setTokenErrorCallback } from "@/lib/api";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SuperAdminLogin from "./pages/auth/SuperAdminLogin";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import ClientAdminDashboard from "./pages/client-admin/Dashboard";
import StorefrontHome from "./pages/storefront/Home";
import Checkout from "./pages/storefront/Checkout";
import Blog from "./pages/storefront/Blog";
import BlogDetail from "./pages/storefront/BlogDetail";
import PageDetail from "./pages/storefront/PageDetail";
import CustomerPage from "./pages/client-admin/Customers";
import DiscountCodes from "./pages/client-admin/Discounts"; 
import Products from "./pages/client-admin/Product";

import Orders from "./pages/client-admin/Orders";
import Categories from "./pages/client-admin/Categories";
import Pages from "./pages/client-admin/Page";
import Contact from "./pages/client-admin/Contact"
import PaymentInfoPage from "./pages/client-admin/PaymentInfo";
import Blogs from "./pages/client-admin/Blogs";
// import AppearancePage from "./pages/client-admin/AppearancePage";

import AppearancePage from "./pages/client-admin/AppearancePage"; 
import EmailSettingsPage from "./pages/client-admin/EmailSetting";

import SEOPage from "./pages/client-admin/seo";
import SettingsPage from "./pages/client-admin/settings";
import DashboardPage from "./pages/client-admin/Dashbords";

const queryClient = new QueryClient();

function AppRoutes() {
  const { handleTokenError } = useAuth();

  useEffect(() => {
    setTokenErrorCallback(() => {
      handleTokenError();
    });
  }, [handleTokenError]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/super-admin-login" element={<SuperAdminLogin />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= CLIENT ADMIN ROUTES ================= */}

      {/*  Customer Details (VERY IMPORTANT - FIRST) */}
     

      {/*  Customer List */}
      <Route
        path="/client-admin/:tenantId/customers"
        element={
          <ProtectedRoute>
            <CustomerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-admin/:tenantId/discounts"
        element={
          <ProtectedRoute>
            <DiscountCodes />
          </ProtectedRoute>
        }
      />
       <Route
        path="/client-admin/:tenantId/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-admin/:tenantId/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-admin/:tenantId/Categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />



 <Route
        path="/client-admin/:tenantId/Blogs"
        element={
          <ProtectedRoute>
            <Blogs />
          </ProtectedRoute>
        }
      />
       <Route
        path="/client-admin/:tenantId/Contact"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
       <Route
        path="/client-admin/:tenantId/PaymentInfoPage"
        element={
          <ProtectedRoute>
            <PaymentInfoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client-admin/:tenantId/AppearancePage"
        element={
          <ProtectedRoute>
            <AppearancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-admin/:tenantId/EmailSettingsPage"
        element={
          <ProtectedRoute>
            <EmailSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-admin/:tenantId/PaymentInfoPage"
        element={
          <ProtectedRoute>
            <PaymentInfoPage />
          </ProtectedRoute>
        }
      />


       <Route
        path="/client-admin/:tenantId/SEOPage"
        element={
          <ProtectedRoute>
            <SEOPage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/client-admin/:tenantId/SettingsPage"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/client-admin/:tenantId/DashboardPage"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/client-admin/:tenantId/appearance"
        element={
          <ProtectedRoute>
            <AppearancePage />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/client-admin/:tenantId/Pages"
        element={
          <ProtectedRoute>
            <Pages />
          </ProtectedRoute>
        }
      />

      {/*  Dashboard main */}
      <Route
        path="/client-admin/:tenantId"
        element={
          <ProtectedRoute>
            <ClientAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/*  KEEP THIS LAST (catch all inside client-admin) */}
      <Route
        path="/client-admin/:tenantId/*"
        element={
          <ProtectedRoute>
            <ClientAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= STOREFRONT ================= */}
      <Route path="/store/:tenantId" element={<StorefrontHome />} />
      <Route path="/store/:tenantId/checkout" element={<Checkout />} />
      <Route path="/store/:tenantId/blog" element={<Blog />} />
      <Route path="/store/:tenantId/blog/:slug" element={<BlogDetail />} />
      <Route path="/store/:tenantId/pages/:slug" element={<PageDetail />} />
      <Route path="/store/:tenantId/*" element={<StorefrontHome />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);