import { Menu } from "lucide-react";
import {getSuperAdminPricing,getBusinessDetails }from "@/lib/api";
import React, { useState, useEffect } from "react";
interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
   const [show, setShow] = useState(false);
  const [pricing, setPricing] = useState<any[]>([]);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
   const billingPlanKey =
    businessDetails?.billing_plan || businessDetails?.billingPlan || "";

  // const matchedPlan = pricing.find(
  //   (p) => p.name?.toLowerCase() === billingPlanKey?.toLowerCase()
  // );
const matchedPlan = Array.isArray(pricing)
  ? pricing.find((p) =>
      p.name?.toLowerCase().includes(billingPlanKey?.toLowerCase())
    )
  : null;
  const currentPlan = matchedPlan?.name || billingPlanKey || "No Plan";
useEffect(() => {
  async function loadData() {
    try {
      const priceData = await getSuperAdminPricing();
      const businessData = await getBusinessDetails();

      console.log("Pricing API:", priceData);

      // ✅ FIX HERE
      // setPricing(
      //   Array.isArray(priceData)
      //     ? priceData
      //     : priceData?.data || priceData?.pricing || []
      // );
      setPricing(priceData?.data || []);

      setBusinessDetails(businessData?.data || {});
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  loadData();
}, []);
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-semibold text-slate-800">
          {title || "Dashboard"}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="relative">
          
          {/* Profile */}
          <div
            onClick={() => setShow((v) => !v)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
              U
            </div>
            <span className="hidden md:block text-sm text-slate-700">
              Admin
            </span>
          </div>

          {/* Dropdown */}
          {show && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShow(false)}
              />

              <div className="absolute right-0 top-12 z-50 w-56 bg-white border rounded-xl shadow-xl p-4">
                <p className="text-xs text-slate-500 mb-1">
                  CURRENT PLAN
                </p>

                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-semibold">
                  ✦ {currentPlan}
                </span>

                <p className="text-xs text-slate-400 mt-2">
                  Manage your plan in account settings.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}