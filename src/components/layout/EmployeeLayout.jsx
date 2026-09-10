import { NavLink, Outlet } from "react-router-dom";
import { Home, History, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/employee/dashboard", icon: Home, label: "Home" },
  { to: "/employee/attendance", icon: History, label: "History" },
  { to: "/employee/profile", icon: User, label: "Profile" },
];

export default function EmployeeLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <span className="font-semibold text-slate-800">SmartAttend</span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-red-500" title="Logout">
          <LogOut size={20} />
        </button>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-lg justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium ${
                  isActive ? "text-brand-600" : "text-slate-400"
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
