import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-lg"
      >
        <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-brand-50 text-brand-600"}`}>
          <AlertTriangle size={22} />
        </div>
        <h3 className="text-center font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-center text-sm text-slate-500">{message}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className={danger ? "btn-danger flex-1" : "btn-primary flex-1"}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
