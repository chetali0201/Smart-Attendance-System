import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function EmployeeFormModal({ employee, onClose, onSaved }) {
  const isEdit = !!employee;
  const [form, setForm] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    employeeId: employee?.employeeId || "",
    password: "",
    joiningDate: employee?.joiningDate ? employee.joiningDate.slice(0, 10) : "",
  });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) formData.append(k, v);
      });
      if (photo) formData.append("photo", photo);

      if (isEdit) {
        await api.put(`/employees/${employee._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Employee updated.");
      } else {
        await api.post("/employees", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Employee added.");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-lg my-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{isEdit ? "Edit Employee" : "Add Employee"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Employee ID</label>
              <input
                required
                disabled={isEdit}
                value={form.employeeId}
                onChange={(e) => update("employeeId", e.target.value)}
                className="input disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              required
              type="email"
              disabled={isEdit}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input disabled:bg-slate-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{isEdit ? "New Password (optional)" : "Password"}</label>
              <input
                required={!isEdit}
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input"
                placeholder={isEdit ? "Leave blank to keep" : ""}
              />
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => update("joiningDate", e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
