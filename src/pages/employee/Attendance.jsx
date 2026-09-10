import { useEffect, useState } from "react";
import { Loader2, Inbox, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatDate, formatTime, formatWorkingHours, statusColors } from "../../utils/format";
import { googleMapsUrl, hasCoordinates } from "../../utils/maps";

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/attendance/my")
      .then((res) => setRecords(res.data.records))
      .catch(() => toast.error("Could not load attendance history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">My Attendance History</h1>

      {loading ? (
        <div className="card flex justify-center py-10 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : records.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-slate-400">
          <Inbox size={36} className="mb-2" />
          <p className="text-sm">No attendance records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r._id} className="card space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{formatDate(r.date)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    In {formatTime(r.checkInTime)} · Out {formatTime(r.checkOutTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{formatWorkingHours(r.workingHours)}</p>
                  <span className={`badge mt-1 ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1 border-t border-slate-50">
                <LocationLink label="Check-in" lat={r.checkInLatitude} lng={r.checkInLongitude} />
                <LocationLink label="Check-out" lat={r.checkOutLatitude} lng={r.checkOutLongitude} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationLink({ label, lat, lng }) {
  if (!hasCoordinates(lat, lng)) {
    return <span className="text-slate-400">📍 {label}: Location unavailable</span>;
  }
  return (
    <a
      href={googleMapsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"
    >
      <MapPin size={12} /> {label}: View Location
    </a>
  );
}
