import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Download,
  Calendar,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function ReportPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const { apiClient, logout } = useAuth();

  const fetchReports = async () => {
    try {
      setLoadingPage(true);
      const res = await apiClient.get("/raw/report", {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });

      console.log(res);
      const data = Array.isArray(res.data) ? res.data : res.data?.reports || [];
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, dateRange]);

  // Filter reports based on search
  const filteredReports = reports.filter((report) => {
    const reportName = (report.report_name || "").toLowerCase();
    const generatedBy = (report.generated_by || "").toLowerCase();
    const status = (report.status || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      reportName.includes(query) ||
      generatedBy.includes(query) ||
      status.includes(query)
    );
  });

  // Get stats
  const totalReports = reports.length;
  const todayReports = reports.filter(
    (r) => new Date(r.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const weeklyReports = reports.filter((r) => {
    const reportDate = new Date(r.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return reportDate >= weekAgo;
  }).length;

  const handleExport = () => {
    // Implement CSV export or PDF generation
    console.log("Exporting reports...");
  };

  // Loading state
  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-blue-900 tracking-wide">
              Generating Reports
            </div>
            <div className="text-lg text-blue-800/80">
              Loading analytics data...
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500/30 to-transparent rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={logout} />

        {/* Page Header with Stats */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Reports Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  View and manage all generated reports (
                  {filteredReports.length} reports)
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <svg
                    className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg 
                               hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchReports}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg 
                           hover:bg-blue-700 transition-all active:scale-95 self-end whitespace-nowrap"
              >
                Filter
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      Total Reports
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {totalReports}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {todayReports}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Generated By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      File Size
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No reports found matching your search"
                          : "No reports available. Generate your first report!"}
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr
                        key={report.report_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 truncate max-w-48">
                            {report.report_name || "Unnamed Report"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 font-medium">
                            {report.generated_by || "System"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(report.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {report.status === "completed" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                          {report.status === "generating" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Generating
                            </span>
                          )}
                          {report.status === "failed" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {report.file_size
                            ? `${(report.file_size / 1024).toFixed(1)} KB`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors p-1">
                              <FileText className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors p-1">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <LoadingModal isOpen={loadingPage} message="Loading reports..." />
    </div>
  );
}

export default ReportPage;
