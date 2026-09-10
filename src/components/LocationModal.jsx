import { motion } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { googleMapsUrl } from "../utils/maps";

/**
 * details: array of { label, time, latitude, longitude } — one entry for
 * check-in and/or one for check-out.
 */
export default function LocationModal({ employeeName, date, details, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-card-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-brand-600" /> Location Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {(employeeName || date) && (
          <div className="mb-3 text-sm text-slate-600 space-y-0.5">
            {employeeName && (
              <p>
                <span className="text-slate-400">Employee: </span>
                <span className="font-medium text-slate-800">{employeeName}</span>
              </p>
            )}
            {date && (
              <p>
                <span className="text-slate-400">Date: </span>
                <span className="font-medium text-slate-800">{date}</span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {details.map((d, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
              <p className="font-semibold text-slate-700">{d.label}{d.time ? `: ${d.time}` : ""}</p>
              {d.latitude != null && d.longitude != null ? (
                <>
                  <p className="text-slate-500">
                    Latitude: <span className="font-medium text-slate-700">{d.latitude}</span>
                  </p>
                  <p className="text-slate-500">
                    Longitude: <span className="font-medium text-slate-700">{d.longitude}</span>
                  </p>
                  <a
                    href={googleMapsUrl(d.latitude, d.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary mt-1 inline-flex text-xs px-3 py-1.5"
                  >
                    🗺️ Open in Google Maps
                  </a>
                </>
              ) : (
                <p className="text-slate-400 text-xs">📍 Location unavailable</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
