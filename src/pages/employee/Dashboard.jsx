import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, CheckCircle2, LogIn, LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import CameraCapture from "../../components/CameraCapture";
import { getCurrentLocation } from "../../hooks/useGeolocation";
import { formatTime, formatWorkingHours, statusColors } from "../../utils/format";
import { googleMapsUrl, hasCoordinates } from "../../utils/maps";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [mode, setMode] = useState(null); // "checkin" | "checkout"
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // success summary shown after action

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await api.get("/attendance/today-status");
      setRecord(res.data.record);
    } catch (err) {
      toast.error("Could not load today's status.");
    } finally {
      setLoading(false);
    }
  }

  function startAction(actionMode) {
    setMode(actionMode);
    setShowCamera(true);
  }

  async function handleCapture(file) {
    setShowCamera(false);
    setProcessing(true);

    // Location is best-effort: if it can't be captured, attendance still
    // goes through — the employee is never blocked because of location.
    let location = null;
    try {
      location = await getCurrentLocation();
    } catch (locErr) {
      toast("Location could not be captured. Your attendance can still be recorded.", {
        icon: "⚠️",
      });
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);
      if (location) {
        formData.append("latitude", location.latitude);
        formData.append("longitude", location.longitude);
      }

      const endpoint = mode === "checkin" ? "/attendance/check-in" : "/attendance/check-out";
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRecord(res.data.attendance);
      setResult({ mode, attendance: res.data.attendance });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
      setMode(null);
    }
  }

  const hasCheckedIn = !!record?.checkInTime;
  const hasCheckedOut = !!record?.checkOutTime;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500">
          {now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-3 text-brand-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400">Current Time</p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>
        {record && (
          <span className={`badge ${statusColors[record.status] || "bg-slate-100 text-slate-600"}`}>
            {record.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-10 text-slate-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : (
        <div className="card">
          {!hasCheckedIn && (
            <ActionButton
              icon={LogIn}
              label="CHECK IN"
              color="bg-brand-600 hover:bg-brand-700"
              onClick={() => startAction("checkin")}
              disabled={processing}
            />
          )}
          {hasCheckedIn && !hasCheckedOut && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <InfoBlock label="Check-in" value={formatTime(record.checkInTime)} />
                <InfoBlock
                  label="Location"
                  value={
                    hasCoordinates(record.checkInLatitude, record.checkInLongitude)
                      ? "Captured 📍"
                      : "Not available"
                  }
                />
              </div>
              <ActionButton
                icon={LogOut}
                label="CHECK OUT"
                color="bg-slate-800 hover:bg-slate-900"
                onClick={() => startAction("checkout")}
                disabled={processing}
              />
            </>
          )}
          {hasCheckedIn && hasCheckedOut && (
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={40} />
              <p className="font-semibold text-slate-800">You're all done for today!</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <InfoBlock label="Check-in" value={formatTime(record.checkInTime)} />
                <InfoBlock label="Check-out" value={formatTime(record.checkOutTime)} />
                <InfoBlock label="Hours" value={formatWorkingHours(record.workingHours)} />
              </div>
            </div>
          )}
          {processing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} /> Getting your location and saving…
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCamera && (
          <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <SuccessModal
            result={result}
            userName={user?.name}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl py-8 text-white font-bold text-lg shadow-card-lg transition active:scale-[0.98] disabled:opacity-60 ${color}`}
    >
      <Icon size={32} />
      {label}
    </button>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

function SuccessModal({ result, userName, onClose }) {
  const { mode, attendance } = result;
  const isCheckIn = mode === "checkin";
  const photoUrl = isCheckIn ? attendance.checkInPhotoUrl : attendance.checkOutPhotoUrl;
  const time = isCheckIn ? attendance.checkInTime : attendance.checkOutTime;
  const lat = isCheckIn ? attendance.checkInLatitude : attendance.checkOutLatitude;
  const lng = isCheckIn ? attendance.checkInLongitude : attendance.checkOutLongitude;
  const locationCaptured = hasCoordinates(lat, lng);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-card-lg"
      >
        <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={48} />
        <h2 className="text-lg font-bold text-slate-900">
          {isCheckIn ? "CHECK-IN SUCCESSFUL ✅" : "CHECK-OUT SUCCESSFUL ✅"}
        </h2>

        {photoUrl && (
          <img
            src={photoUrl}
            alt="Attendance selfie"
            className="mx-auto mt-4 h-28 w-28 rounded-2xl object-cover border-4 border-slate-100"
          />
        )}

        <div className="mt-4 space-y-1.5 text-sm text-left bg-slate-50 rounded-xl p-4">
          <Row label="Employee" value={userName} />
          <Row label="Time" value={formatTime(time)} />
          <Row label="Location" value={locationCaptured ? "📍 Location captured" : "⚠️ Not available"} />
        </div>

        {locationCaptured && (
          <a
            href={googleMapsUrl(lat, lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full mt-3 justify-center"
          >
            View Location
          </a>
        )}

        <button onClick={onClose} className="btn-primary w-full mt-3">
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
