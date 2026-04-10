import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Shield, 
  Code2, 
  Settings as SettingsIcon,
  Plus,
  Users
} from "lucide-react";
import { cn } from "./ui/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tokenize", href: "/tokenize", icon: Shield },
  { name: "API Console", href: "/api-console", icon: Code2 },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-white">Vormetric</h1>
            <p className="text-xs text-slate-400">Tokenization Server</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = 
            item.href === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Add Employee Button */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={() => navigate("/employees/add")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
            "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
          )}
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Funcionário</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400">VTS Version</p>
          <p className="text-sm font-mono text-slate-200">v7.3.0</p>
        </div>
      </div>
    </aside>
  );
}
