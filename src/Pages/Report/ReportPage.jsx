import React, { useState, useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

/* ===================== HELPERS ===================== */

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

/* ===================== COMPONENT ===================== */

function ReportPage() {
  const { apiClient, logout } = useAuth();
  const reportRef = useRef(null);

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
      const res = await apiClient.get("/raw/report", {
        params: { from, to },
      });
      setReport(res.data || null);
    } catch (err) {
      console.error(err);
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

  /* ===================== CSV DATA ===================== */

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

  /* ===================== ACTIONS ===================== */

  const handleGenerate = async () => {
    await fetchReport();
  };

  const handleDownloadJson = () => {
    if (!report) return;
    setLoadingAction(true);
    try {
      downloadBlob(
        `report_${from}_to_${to}.json`,
        JSON.stringify(report, null, 2),
        "application/json",
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!flatForCsv.length) return;
    setLoadingAction(true);
    try {
      const csv = jsonToCsv(flatForCsv);
      downloadBlob(
        `report_${from}_to_${to}.csv`,
        csv,
        "text/csv;charset=utf-8;",
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setLoadingAction(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`report_${from}_to_${to}.pdf`);
    } finally {
      setLoadingAction(false);
    }
  };

  /* ===================== LOADING PAGE ===================== */

  if (loadingPage && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#560705]" />
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavAdmin handleSignOut={logout} />

      <div className="max-w-screen-2xl mx-auto px-6 pb-10" ref={reportRef}>
        {/* HEADER */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold mb-1">System Report</h2>
          <p className="text-sm text-gray-600">
            Summary from {from} to {to}
          </p>

          {/* CONTROLS */}
          <div className="flex flex-wrap gap-2 mt-4 no-print">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

            <button onClick={handleGenerate} className="btn-primary">
              Generate
            </button>

            <button onClick={() => window.print()} className="btn-secondary">
              Print / Save PDF
            </button>

            <button onClick={handleDownloadPdf} className="btn-danger">
              Download PDF
            </button>

            <button onClick={handleDownloadJson} className="btn-dark">
              JSON
            </button>

            <button onClick={handleDownloadCsv} className="btn-blue">
              CSV
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries({
            Users: overview.totalUsers,
            Pets: overview.totalPets,
            Appointments: overview.appointmentsInRange,
            Adoptions: overview.adoptionsInRange,
            "Pending Appointments": overview.pendingAppointmentsInRange,
            "Pending Adoptions": overview.pendingAdoptionsInRange,
          }).map(([label, value]) => (
            <div key={label} className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value ?? 0}</p>
            </div>
          ))}
        </div>

        {/* RAW JSON */}
        <div className="bg-white rounded-xl shadow-sm mt-6">
          <div className="p-4 border-b text-sm font-semibold">
            Raw Report Data
          </div>
          <pre className="p-4 text-xs overflow-auto max-h-[500px] bg-[#0b1020] text-white">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>

        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>

      <LoadingModal
        isOpen={loadingAction}
        message="Preparing file for download..."
      />
    </div>
  );
}

export default ReportPage;
