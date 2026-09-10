import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function PhotoModal({ url, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full"
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white"
        >
          <X size={26} />
        </button>
        <img src={url} alt="Attendance selfie" className="w-full rounded-2xl object-cover" />
      </motion.div>
    </motion.div>
  );
}
