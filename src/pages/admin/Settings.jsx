import { useEffect, useState } from "react";
import { Loader2, Save, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => setForm(res.data.settings))
      .catch(() => toast.error("Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/settings", form);
      setForm(res.data.settings);
      toast.success("Settings updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update("agencyLatitude", pos.coords.latitude);
        update("agencyLongitude", pos.coords.longitude);
        toast.success("Coordinates filled from your current location.");
      },
      () => toast.error("Could not get your current location.")
    );
  }

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Configure agency location and office timing</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800">Agency Information</h3>
          <div>
            <label className="label">Agency Name</label>
            <input value={form.agencyName} onChange={(e) => update("agencyName", e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Agency Address</label>
            <input value={form.agencyAddress} onChange={(e) => update("agencyAddress", e.target.value)} className="input" />
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MapPin size={17} className="text-brand-600" /> Location & Geofencing
            </h3>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs font-medium text-amber-700">
            📍 Location restrictions are disabled. Employees can mark attendance from any
            location — their coordinates are still captured and viewable on each attendance
            record, but no longer used to block check-in/check-out.
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={useMyLocation}
              className="text-xs font-medium text-brand-600"
            >
              Use my current location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 opacity-60">
            <div>
              <label className="label">Agency Latitude (unused)</label>
              <input
                type="number"
                step="any"
                value={form.agencyLatitude}
                onChange={(e) => update("agencyLatitude", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Agency Longitude (unused)</label>
              <input
                type="number"
                step="any"
                value={form.agencyLongitude}
                onChange={(e) => update("agencyLongitude", e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="opacity-60">
            <label className="label">Allowed Radius in meters (unused)</label>
            <input
              type="number"
              value={form.allowedRadiusMeters}
              onChange={(e) => update("allowedRadiusMeters", e.target.value)}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-400">
              Kept for reference only — no longer affects check-in/check-out.
            </p>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock size={17} className="text-brand-600" /> Office Timing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Office Start Time</label>
              <input
                type="time"
                value={form.officeStartTime}
                onChange={(e) => update("officeStartTime", e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Office End Time</label>
              <input
                type="time"
                value={form.officeEndTime}
                onChange={(e) => update("officeEndTime", e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Late Threshold (minutes)</label>
            <input
              type="number"
              value={form.lateThresholdMinutes}
              onChange={(e) => update("lateThresholdMinutes", e.target.value)}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-400">
              Employees checking in more than this many minutes after start time are marked Late.
            </p>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
