import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

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

  const fetchReport = useCallback(async () => {
    try {
      setLoadingPage(true);
      setError("");
      const res = await apiClient.get("/raw/report", {
        params: { from, to },
      });
      setReport(res.data || null);
    } catch (err) {
      setReport(null);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load report data",
      );
    } finally {
      setLoadingPage(false);
    }
  }, [apiClient, from, to]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const overview = report?.overview || {};

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setLoadingAction(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
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

  if (loadingPage && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#560705]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Same nav placement as AppointmentPage */}
      <TopNavAdmin handleSignOut={logout} />

      {/* Main content aligned with AppointmentPage */}
      <div className="max-w-screen-2xl mx-auto px-6 pb-10">
        {/* Wrap only report content for print/PDF */}
        <div ref={reportRef}>
          {/* HEADER */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-1">System Report</h2>
            <p className="text-sm text-gray-600">
              Report period: {from} to {to}
            </p>

            <div className="flex flex-wrap gap-3 mt-4 print:hidden">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />

              <button
                onClick={fetchReport}
                className="px-4 py-2 bg-[#560705] text-white rounded-lg text-sm"
              >
                Generate
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
              >
                Print / Save PDF
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Download PDF
              </button>
            </div>
          </div>

          {/* KPI TABLE */}
          <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
            <div className="px-6 py-4 border-b font-semibold text-sm">
              Overview Summary
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ["Total Users", overview.totalUsers],
                  ["Total Pets", overview.totalPets],
                  ["Appointments (Range)", overview.appointmentsInRange],
                  ["Adoptions (Range)", overview.adoptionsInRange],
                  ["Pending Appointments", overview.pendingAppointmentsInRange],
                  ["Pending Adoptions", overview.pendingAdoptionsInRange],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b">
                    <td className="px-6 py-3 font-medium bg-gray-50 w-1/2">
                      {label}
                    </td>
                    <td className="px-6 py-3">{value ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ADOPTIONS BY STATUS */}
          {report?.adoptionByStatus?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
              <div className="px-6 py-4 border-b font-semibold text-sm">
                Adoptions by Status
              </div>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {report.adoptionByStatus.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-6 py-3">{row.status}</td>
                      <td className="px-6 py-3">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DAILY APPOINTMENTS */}
          {report?.appointmentsDaily?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
              <div className="px-6 py-4 border-b font-semibold text-sm">
                Daily Appointments
              </div>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.appointmentsDaily.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-6 py-3">{row.date}</td>
                      <td className="px-6 py-3">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <div className="text-red-600 mt-4">{error}</div>}
        </div>
      </div>

      <LoadingModal isOpen={loadingAction} message="Preparing PDF..." />
    </div>
  );
}

export default ReportPage;
