import { Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
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
        {/* Example Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
            U
          </div>
          <span className="hidden md:block text-sm text-slate-700">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}