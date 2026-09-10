import { useEffect, useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Date Range" },
];

export default function AdminReports() {
  const [employees, setEmployees] = useState([]);
  const [range, setRange] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [exporting, setExporting] = useState(false);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(true);

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data.employees));
  }, []);

  useEffect(() => {
    fetchMonthly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function fetchMonthly() {
    setLoadingMonthly(true);
    try {
      const res = await api.get("/reports/monthly", { params: { month } });
      setMonthlyData(res.data);
    } catch (err) {
      toast.error("Could not load monthly report.");
    } finally {
      setLoadingMonthly(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = { employeeId: employeeId || undefined };
      if (range === "custom") {
        params.from = from;
        params.to = to;
      } else {
        params.range = range;
      }

      const res = await api.get("/reports/export", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smartattend-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded.");
    } catch (err) {
      toast.error("Could not generate the Excel report.");
    } finally {
      setExporting(false);
    }
  }

  async function handleExportMonthly() {
    setExporting(true);
    try {
      const [year, mon] = month.split("-");
      const firstDay = `${year}-${mon}-01`;
      const lastDayDate = new Date(parseInt(year), parseInt(mon), 0);
      const lastDay = lastDayDate.toISOString().slice(0, 10);

      const res = await api.get("/reports/export", {
        params: { from: firstDay, to: lastDay },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smartattend-monthly-${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Monthly report downloaded.");
    } catch (err) {
      toast.error("Could not generate the report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Export attendance data and view monthly summaries</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-brand-600" /> Export to Excel
        </h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label">Range</label>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="input">
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {range === "custom" && (
            <>
              <div>
                <label className="label">From</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">To</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
              </div>
            </>
          )}
          <div>
            <label className="label">Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input">
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-primary mt-4">
          {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          Export Excel
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-slate-800">Monthly Report</h3>
          <div className="flex items-center gap-2">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input w-auto" />
            <button onClick={handleExportMonthly} disabled={exporting} className="btn-secondary text-sm">
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {loadingMonthly ? (
          <div className="flex justify-center py-10 text-slate-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">Employee</th>
                  <th className="pb-2 font-medium">Working Days</th>
                  <th className="pb-2 font-medium">Present</th>
                  <th className="pb-2 font-medium">Absent</th>
                  <th className="pb-2 font-medium">Late</th>
                  <th className="pb-2 font-medium">Half Day</th>
                  <th className="pb-2 font-medium">Avg Hours</th>
                  <th className="pb-2 font-medium">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData?.report.map((r) => (
                  <tr key={r.employeeId} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-medium text-slate-800">{r.name}</td>
                    <td className="py-2.5 text-slate-600">{r.workingDays}</td>
                    <td className="py-2.5 text-emerald-600 font-medium">{r.present}</td>
                    <td className="py-2.5 text-red-500 font-medium">{r.absent}</td>
                    <td className="py-2.5 text-amber-600 font-medium">{r.late}</td>
                    <td className="py-2.5 text-sky-600 font-medium">{r.halfDay}</td>
                    <td className="py-2.5 text-slate-600">{r.avgWorkingHours}h</td>
                    <td className="py-2.5 font-semibold text-slate-800">{r.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
