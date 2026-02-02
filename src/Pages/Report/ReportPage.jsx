import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function toCsvValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v).replaceAll('"', '""');
  return String(v).replaceAll('"', '""');
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function flattenRows(section, rows) {
  return (rows || []).map((r) => ({ section, ...r }));
}

function jsonToCsv(flatRows) {
  if (!flatRows.length) return "";

  const keys = Array.from(
    flatRows.reduce((set, row) => {
      Object.keys(row || {}).forEach((k) => set.add(k));
      return set;
    }, new Set()),
  );

  const header = keys.map((k) => `"${k.replaceAll('"', '""')}"`).join(",");
  const lines = flatRows.map((row) =>
    keys.map((k) => `"${toCsvValue(row?.[k])}"`).join(","),
  );

  return [header, ...lines].join("\n");
}

function ReportPage() {
  const { apiClient, logout } = useAuth();

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoadingPage(true);
      setError("");
      const res = await apiClient.get("/reports/raw", {
        params: { from, to },
      });
      setReport(res.data || null);
    } catch (err) {
      console.error("Error fetching report:", err);
      setReport(null);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load report data",
      );
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient]);

  const flatForCsv = useMemo(() => {
    if (!report) return [];
    const rows = [];
    if (report.overview) rows.push({ section: "overview", ...report.overview });
    rows.push(...flattenRows("adoptionByStatus", report.adoptionByStatus));
    rows.push(...flattenRows("adoptionsDaily", report.adoptionsDaily));
    rows.push(...flattenRows("appointmentsDaily", report.appointmentsDaily));
    rows.push(...flattenRows("appointmentsByType", report.appointmentsByType));
    return rows;
  }, [report]);

  const overview = report?.overview || {};
  const totalAppointments = overview.appointmentsInRange || 0;
  const totalAdoptions = overview.adoptionsInRange || 0;
  const pendingAppointments = overview.pendingAppointmentsInRange || 0;
  const pendingAdoptions = overview.pendingAdoptionsInRange || 0;
  const totalUsers = overview.totalUsers || 0;
  const totalPets = overview.totalPets || 0;

  const handleGenerate = async () => {
    await fetchReport();
  };

  const handleDownloadJson = () => {
    if (!report) return;
    setLoadingAction(true);
    try {
      const name = `report_${from}_to_${to}.json`;
      downloadBlob(name, JSON.stringify(report, null, 2), "application/json");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!flatForCsv.length) return;
    setLoadingAction(true);
    try {
      const csv = jsonToCsv(flatForCsv);
      const name = `report_${from}_to_${to}.csv`;
      downloadBlob(name, csv, "text/csv;charset=utf-8;");
    } finally {
      setLoadingAction(false);
    }
  };

  // FULL PAGE LOADING (same vibe as appointments)
  if (loadingPage && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
              Preparing Reports
            </div>
            <div className="text-lg text-[#7c5e3b]/80">
              Fetching clinic activity summary...
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#7c5e3b]/30 to-transparent rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7c5e3b] to-amber-500 animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={logout} />

        {/* Header + Filters */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  System Report
                </h2>
                <p className="text-sm text-gray-600">
                  Summary of appointments, adoptions, users, and pets for the
                  selected date range.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-[#560705] text-white text-sm rounded-lg shadow-sm 
                             hover:bg-[#3b0404] transition-colors active:scale-95"
                >
                  Generate
                </button>

                <button
                  onClick={handleDownloadJson}
                  disabled={!report || loadingAction}
                  className="px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-sm
                             hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Download JSON
                </button>

                <button
                  onClick={handleDownloadCsv}
                  disabled={!report || loadingAction}
                  className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-sm
                             hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm font-medium text-indigo-700 mb-1">
                  Users
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                  {totalUsers}
                </p>
              </div>
              <div className="bg-sky-50 rounded-lg p-4">
                <p className="text-sm font-medium text-sky-700 mb-1">Pets</p>
                <p className="text-2xl font-bold text-sky-900">{totalPets}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-700 mb-1">
                  Appointments (range)
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {totalAppointments}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700 mb-1">
                  Adoptions (range)
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {totalAdoptions}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-700 mb-1">
                  Pending Appointments
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {pendingAppointments}
                </p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4">
                <p className="text-sm font-medium text-rose-700 mb-1">
                  Pending Adoptions
                </p>
                <p className="text-2xl font-bold text-rose-900">
                  {pendingAdoptions}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 whitespace-pre-wrap">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Raw JSON / Details */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Raw Report Data
              </h3>
              <span className="text-xs text-gray-500">
                Range: {from} to {to}
              </span>
            </div>
            <div className="p-4">
              {report ? (
                <pre className="bg-[#0b1020] text-[#e6edf3] text-xs md:text-sm p-4 rounded-lg max-h-[500px] overflow-auto">
                  {JSON.stringify(report, null, 2)}
                </pre>
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">
                  No report data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoadingModal
        isOpen={loadingAction}
        message="Preparing file for download..."
      />
    </div>
  );
}

export default ReportPage;
