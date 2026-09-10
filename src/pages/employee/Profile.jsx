import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";
import { Mail, Phone, Badge, Calendar } from "lucide-react";

export default function EmployeeProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">My Profile</h1>

      <div className="card flex flex-col items-center text-center py-8">
        {user?.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
            {user?.name?.[0]}
          </div>
        )}
        <h2 className="mt-3 text-lg font-bold text-slate-900">{user?.name}</h2>
        <p className="text-sm text-slate-400">{user?.employeeId}</p>
      </div>

      <div className="card space-y-3">
        <InfoRow icon={Mail} label="Email" value={user?.email} />
        <InfoRow icon={Phone} label="Phone" value={user?.phone || "—"} />
        <InfoRow icon={Badge} label="Employee ID" value={user?.employeeId} />
        <InfoRow icon={Calendar} label="Joined" value={formatDate(user?.joiningDate)} />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
      <div className="rounded-lg bg-slate-50 p-2 text-slate-400">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
