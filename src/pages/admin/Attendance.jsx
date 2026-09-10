import { useEffect, useState } from "react";
import { Loader2, Inbox, Filter, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatDate, formatTime, formatWorkingHours, statusColors } from "../../utils/format";
import { hasCoordinates } from "../../utils/maps";
import PhotoModal from "../../components/PhotoModal";
import LocationModal from "../../components/LocationModal";

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState(null);
  const [locationModal, setLocationModal] = useState(null);
  const [filters, setFilters] = useState({ date: "", employeeId: "", status: "" });

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data.employees));
  }, []);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.status) params.status = filters.status;
      const res = await api.get("/attendance", { params });
      setRecords(res.data.records);
    } catch (err) {
      toast.error("Could not load attendance records.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">All employee check-ins and check-outs</p>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
          className="input w-auto"
        />
        <select
          value={filters.employeeId}
          onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))}
          className="input w-auto"
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Half Day">Half Day</option>
        </select>
        {(filters.date || filters.employeeId || filters.status) && (
          <button
            onClick={() => setFilters({ date: "", employeeId: "", status: "" })}
            className="text-sm text-brand-600 font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400">
            <Inbox size={32} className="mb-2" />
            <p className="text-sm">No attendance records match these filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[1050px]">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Check-in</th>
                <th className="pb-2 font-medium">Check-out</th>
                <th className="pb-2 font-medium">Hours</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Check-in Location</th>
                <th className="pb-2 font-medium">Check-out Location</th>
                <th className="pb-2 font-medium">Photos</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 font-medium text-slate-800">{r.employeeId?.name}</td>
                  <td className="py-2.5 text-slate-600">{formatDate(r.date)}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkInTime)}</td>
                  <td className="py-2.5 text-slate-600">{formatTime(r.checkOutTime)}</td>
                  <td className="py-2.5 text-slate-600">{formatWorkingHours(r.workingHours)}</td>
                  <td className="py-2.5">
                    <span className={`badge ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
                  </td>
                  <td className="py-2.5">
                    {hasCoordinates(r.checkInLatitude, r.checkInLongitude) ? (
                      <button
                        onClick={() =>
                          setLocationModal({
                            employeeName: r.employeeId?.name,
                            date: formatDate(r.date),
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
                        <MapPin size={13} /> View Location
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    {hasCoordinates(r.checkOutLatitude, r.checkOutLongitude) ? (
                      <button
                        onClick={() =>
                          setLocationModal({
                            employeeName: r.employeeId?.name,
                            date: formatDate(r.date),
                            details: [
                              {
                                label: "Check-out",
                                time: formatTime(r.checkOutTime),
                                latitude: r.checkOutLatitude,
                                longitude: r.checkOutLongitude,
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <MapPin size={13} /> View Location
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
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
      {locationModal && (
        <LocationModal
          employeeName={locationModal.employeeName}
          date={locationModal.date}
          details={locationModal.details}
          onClose={() => setLocationModal(null)}
        />
      )}
    </div>
  );
}
