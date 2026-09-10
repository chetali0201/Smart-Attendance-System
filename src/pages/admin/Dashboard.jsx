import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Activity,
  Timer,
  Sparkles,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatTime, statusColors } from "../../utils/format";
import { hasCoordinates } from "../../utils/maps";
import PhotoModal from "../../components/PhotoModal";
import LocationModal from "../../components/LocationModal";

const COLORS = ["#3363f5", "#f59e0b", "#ef4444", "#0ea5e9"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [photoModal, setPhotoModal] = useState(null);
  const [locationModal, setLocationModal] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      const res = await api.get("/attendance/summary/today");
      setSummary(res.data);
    } catch (err) {
      toast.error("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInsights() {
    setInsightsLoading(true);
    try {
      const res = await api.post("/ai/attendance-insights", { days: 30 });
      setInsights(res.data.insights);
    } catch (err) {
      toast.error("Could not generate AI insights right now.");
    } finally {
      setInsightsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );
  }

  const pieData = [
    { name: "Present", value: summary.presentToday },
    { name: "Late", value: summary.lateToday },
    { name: "Absent", value: summary.absentToday },
  ];

  const cards = [
    { label: "Total Employees", value: summary.totalEmployees, icon: Users, color: "bg-brand-50 text-brand-600" },
    { label: "Present Today", value: summary.presentToday, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Absent Today", value: summary.absentToday, icon: UserX, color: "bg-red-50 text-red-600" },
    { label: "Late Today", value: summary.lateToday, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Currently Working", value: summary.currentlyWorking, icon: Activity, color: "bg-sky-50 text-sky-600" },
    { label: "Avg Working Hours", value: `${summary.avgWorkingHours}h`, icon: Timer, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of today's attendance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className={`inline-flex rounded-xl p-2.5 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">Present vs Late vs Absent</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">Today's Check-ins</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.todayRecords.map((r) => ({
              name: r.employeeId?.name?.split(" ")[0] || "—",
              hours: r.workingHours || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#3363f5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-600" /> AI Attendance Insights 🤖
          </h3>
          <button onClick={fetchInsights} disabled={insightsLoading} className="btn-secondary text-xs px-3 py-1.5">
            {insightsLoading ? "Analyzing…" : insights ? "Refresh" : "Generate"}
          </button>
        </div>
        {!insights && !insightsLoading && (
          <p className="text-sm text-slate-400">
            Click "Generate" to analyze the last 30 days of attendance data for patterns.
          </p>
        )}
        {insightsLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="animate-spin" size={16} /> Analyzing attendance patterns…
          </div>
        )}
        {insights && !insightsLoading && (
          <ul className="space-y-2">
            {insights.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-slate-800 mb-3">Today's Attendance</h3>
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="pb-2 font-medium">Employee</th>
              <th className="pb-2 font-medium">Check-in</th>
              <th className="pb-2 font-medium">Check-out</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Photo</th>
              <th className="pb-2 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {summary.todayRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No attendance marked yet today.
                </td>
              </tr>
            ) : (
              summary.todayRecords.map((r) => (
                <tr key={r._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 font-medium text-slate-800">{r.employeeId?.name}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkInTime)}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkOutTime)}</td>
                  <td className="py-2.5">
                    <span className={`badge ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    {r.checkInPhotoUrl ? (
                      <button onClick={() => setPhotoModal(r.checkInPhotoUrl)}>
                        <img
                          src={r.checkInPhotoUrl}
                          className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    {hasCoordinates(r.checkInLatitude, r.checkInLongitude) ? (
                      <button
                        onClick={() =>
                          setLocationModal({
                            employeeName: r.employeeId?.name,
                            details: [
                              {
                                label: "Check-in",
                                time: formatTime(r.checkInTime),
                                latitude: r.checkInLatitude,
                                longitude: r.checkInLongitude,
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <MapPin size={13} /> Location
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {photoModal && <PhotoModal url={photoModal} onClose={() => setPhotoModal(null)} />}
      {locationModal && (
        <LocationModal
          employeeName={locationModal.employeeName}
          details={locationModal.details}
          onClose={() => setLocationModal(null)}
        />
      )}
    </div>
  );
}
