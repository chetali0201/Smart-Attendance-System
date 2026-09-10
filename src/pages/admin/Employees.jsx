import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, Search, Eye, Pencil, UserX } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatDate } from "../../utils/format";
import EmployeeFormModal from "../../components/EmployeeFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees);
    } catch (err) {
      toast.error("Could not load employees.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    try {
      await api.delete(`/employees/${confirmTarget._id}`);
      toast.success(`${confirmTarget.name} has been deactivated.`);
      setConfirmTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate employee.");
    }
  }

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">Manage your agency's team members</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, or email…"
          className="input pl-9"
        />
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Employee ID</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp._id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 flex items-center gap-2.5">
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} className="h-8 w-8 rounded-full object-cover" alt={emp.name} />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                          {emp.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{emp.name}</span>
                    </td>
                    <td className="py-3 text-slate-600">{emp.employeeId}</td>
                    <td className="py-3 text-slate-600">{emp.email}</td>
                    <td className="py-3 text-slate-600">{formatDate(emp.joiningDate)}</td>
                    <td className="py-3">
                      <span
                        className={`badge ${
                          emp.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/admin/employees/${emp._id}`} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-brand-600">
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => {
                            setEditing(emp);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <Pencil size={16} />
                        </button>
                        {emp.status === "active" && (
                          <button
                            onClick={() => setConfirmTarget(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          employee={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchEmployees();
          }}
        />
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Deactivate employee?"
          message={`${confirmTarget.name} will no longer be able to log in or mark attendance. This can be reversed later by an admin.`}
          confirmLabel="Deactivate"
          danger
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
