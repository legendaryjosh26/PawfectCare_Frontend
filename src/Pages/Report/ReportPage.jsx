import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, Calendar, Users } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function ReportPage() {
  const navigate = useNavigate();
  const [adoptionReports, setAdoptionReports] = useState([]);
  const [appointmentReports, setAppointmentReports] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const { apiClient, token, logout } = useAuth();

  const fetchReports = async () => {
    try {
      setLoadingPage(true);
      const res = await apiClient.get("/process/report/raw", {
        params: {
          from: dateRange.start,
          to: dateRange.end,
        },
      });

      const adoptions = Array.isArray(res.data?.approvedAdoptions)
        ? res.data.approvedAdoptions
        : [];
      const appointments = Array.isArray(res.data?.approvedAppointments)
        ? res.data.approvedAppointments
        : [];

      setAdoptionReports(adoptions);
      setAppointmentReports(appointments);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setAdoptionReports([]);
      setAppointmentReports([]);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, dateRange]);

  // Filtered lists
  const filteredAdoptions = adoptionReports.filter((report) => {
    const fullName = `${report.adopter_first_name || ""} ${
      report.adopter_last_name || ""
    }`.toLowerCase();
    const petName = (report.pet_name || "").toLowerCase();
    const petBreed = (report.pet_breed || "").toLowerCase();
    const petType = (report.pet_type || "").toLowerCase();
    const status = (report.status || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      petName.includes(query) ||
      petBreed.includes(query) ||
      petType.includes(query) ||
      status.includes(query)
    );
  });

  const filteredAppointments = appointmentReports.filter((a) => {
    const fullName = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
    const service = (a.appointment_type || "").toLowerCase();
    const status = (a.status || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      service.includes(query) ||
      status.includes(query)
    );
  });

  // Stats (example: based on adoptions)
  const totalAdoptions = adoptionReports.length;
  const todayAdoptions = adoptionReports.filter(
    (r) =>
      r.dateAdopted &&
      new Date(r.dateAdopted).toDateString() === new Date().toDateString(),
  ).length;

  const handleExport = () => {
    console.log("Exporting reports...");
  };

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

        {/* Header + controls */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Reports Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  View approved adoption and appointment reports
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by name, pet, service, status..."
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

            {/* Date filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  From
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
                  To
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

            {/* Simple stats (adoptions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      Total Approved Adoptions
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {totalAdoptions}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Adopted Today
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {todayAdoptions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adoption Reports Table */}
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Adoption Reports
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet Breed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdoptions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No adoption records found.
                      </td>
                    </tr>
                  ) : (
                    filteredAdoptions.map((report, index) => {
                      const fullName = `${report.adopter_first_name || ""} ${
                        report.adopter_last_name || ""
                      }`.trim();

                      return (
                        <tr
                          key={report.adoption_id || index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              {fullName || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {report.pet_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {report.pet_breed || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {report.pet_type || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {report.status || "Approved"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Appointment Reports Table */}
        <div className="px-6 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Appointment Reports
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Owner Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No appointment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr
                        key={appt.appointment_id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {(appt.first_name || "") +
                              " " +
                              (appt.last_name || "")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {appt.appointment_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {appt.appointment_date
                            ? new Date(
                                appt.appointment_date,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {appt.timeSchedule
                            ? new Date(
                                `1970-01-01T${appt.timeSchedule}`,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {appt.status || "Accepted"}
                          </span>
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
