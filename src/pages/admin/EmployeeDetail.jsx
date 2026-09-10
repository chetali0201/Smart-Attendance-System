import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, Loader2, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatDate, formatTime, formatWorkingHours, statusColors } from "../../utils/format";
import PhotoModal from "../../components/PhotoModal";

export default function AdminEmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/employees/${id}`), api.get(`/employees/${id}/attendance`)])
      .then(([empRes, attRes]) => {
        setEmployee(empRes.data.employee);
        setRecords(attRes.data.records);
      })
      .catch(() => toast.error("Could not load employee details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );
  }

  if (!employee) {
    return <p className="text-slate-500">Employee not found.</p>;
  }

  const totalPresent = records.filter((r) => r.status === "Present").length;
  const totalLate = records.filter((r) => r.status === "Late").length;
  const totalAbsentMarked = records.filter((r) => r.status === "Absent").length;

  return (
    <div className="space-y-5">
      <Link to="/admin/employees" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to Employees
      </Link>

      <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
        {employee.photoUrl ? (
          <img src={employee.photoUrl} className="h-16 w-16 rounded-full object-cover" alt={employee.name} />
        ) : (
          <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700">
            {employee.name[0]}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{employee.name}</h1>
          <p className="text-sm text-slate-400">{employee.employeeId}</p>
        </div>
        <span className={`badge self-start ${employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {employee.status}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3">
          <Mail size={18} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm font-medium text-slate-800">{employee.email}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Phone size={18} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Phone</p>
            <p className="text-sm font-medium text-slate-800">{employee.phone || "—"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Calendar size={18} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Joined</p>
            <p className="text-sm font-medium text-slate-800">{formatDate(employee.joiningDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalPresent}</p>
          <p className="text-xs text-slate-400 mt-1">Present</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{totalLate}</p>
          <p className="text-xs text-slate-400 mt-1">Late</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{totalAbsentMarked}</p>
          <p className="text-xs text-slate-400 mt-1">Marked Absent</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-3">Attendance History</h3>
        {records.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-slate-400">
            <Inbox size={32} className="mb-2" />
            <p className="text-sm">No attendance records yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Check-in</th>
                <th className="pb-2 font-medium">Check-out</th>
                <th className="pb-2 font-medium">Hours</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Photos</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 text-slate-700">{formatDate(r.date)}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkInTime)}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkOutTime)}</td>
                  <td className="py-2.5 text-slate-600">{formatWorkingHours(r.workingHours)}</td>
                  <td className="py-2.5">
                    <span className={`badge ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex gap-2">
                      {r.checkInPhotoUrl && (
                        <button onClick={() => setPhotoModal(r.checkInPhotoUrl)}>
                          <img src={r.checkInPhotoUrl} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                        </button>
                      )}
                      {r.checkOutPhotoUrl && (
                        <button onClick={() => setPhotoModal(r.checkOutPhotoUrl)}>
                          <img src={r.checkOutPhotoUrl} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {photoModal && <PhotoModal url={photoModal} onClose={() => setPhotoModal(null)} />}
    </div>
  );
}
