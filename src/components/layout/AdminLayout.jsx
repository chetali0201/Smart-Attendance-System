import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/employees", icon: Users, label: "Employees" },
  { to: "/admin/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/admin/reports", icon: FileBarChart, label: "Reports" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <span className="font-semibold text-slate-800">SmartAttend</span>
        </div>
        <button onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } lg:block w-full lg:w-64 shrink-0 border-r border-slate-100 bg-white lg:min-h-screen`}
      >
        <div className="hidden lg:flex items-center gap-2 px-6 py-5">
          <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            SA
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-none">SmartAttend</p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="px-3 py-2 lg:py-0 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 px-3 py-4 lg:absolute lg:bottom-0 lg:w-64">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-500" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
