import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import LoadingModal from "../../Components/Modals/LoadingModal";
import EmailSentModal from "../../Components/Modals/EmailSentModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function AppointmentPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loadingPage, setLoadingPage] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { apiClient, logout } = useAuth();

  const fetchAppointments = async () => {
    try {
      setLoadingPage(true);
      const res = await apiClient.get("/process/getAllAppointment");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.appointments || [];
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [apiClient]);

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const handleReview = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedAppointment) return;
    setSendingEmail(true);

    try {
      await apiClient.put(
        `/appointment/${selectedAppointment.appointment_id}/approved`,
        {
          appointmentSetter: selectedAppointment.appointmentSetter,
          email: selectedAppointment.email,
        }
      );
      await fetchAppointments();
      setEmailSent(true);
    } catch (err) {
      console.error("Error approving request:", err);
    } finally {
      setSendingEmail(false);
      closeModal();
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;
    setSendingEmail(true);

    try {
      await apiClient.put(
        `/appointment/${selectedAppointment.appointment_id}/rejected`,
        {
          appointmentSetter: selectedAppointment.appointmentSetter,
          email: selectedAppointment.email,
        }
      );
      await fetchAppointments();
      setEmailSent(true);
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setSendingEmail(false);
      closeModal();
    }
  };

  const closeModal = () => {
    setShowReviewModal(false);
    setSelectedAppointment(null);
  };

  // Filter appointments based on search
  const filteredAppointments = appointments.filter((appt) => {
    const fullName = `${appt.first_name || ""} ${
      appt.last_name || ""
    }`.toLowerCase();
    const service = (appt.appointment_type || "").toLowerCase();
    const status = (appt.review || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      service.includes(query) ||
      status.includes(query)
    );
  });

  // Get counts by status
  const pendingCount = appointments.filter(
    (a) => a.review === "Pending"
  ).length;
  const approvedCount = appointments.filter(
    (a) => a.review === "Accepted"
  ).length;
  const rejectedCount = appointments.filter(
    (a) => a.review === "Rejected"
  ).length;

  // NEW PET-THEMED FULL PAGE LOADING
  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
              Preparing Appointments
            </div>
            <div className="text-lg text-[#7c5e3b]/80">
              Loading pet care schedules...
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

        {/* Page Header with Stats */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Appointment Management
                </h2>
                <p className="text-sm text-gray-600">
                  Review and manage all appointment requests (
                  {filteredAppointments.length} appointments)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 pl-10 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#560705] focus:border-transparent text-sm"
                />
                <svg
                  className="absolute left-3 top-3 h-5 w-5 text-gray-400"
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
            </div>

            {/* Status Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-700 mb-1">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700 mb-1">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {approvedCount}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 mb-1">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Owner Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No appointments found matching your search"
                          : "No appointments found."}
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
                            {appt.first_name
                              ? appt.first_name.charAt(0).toUpperCase() +
                                appt.first_name.slice(1).toLowerCase()
                              : ""}{" "}
                            {appt.last_name
                              ? appt.last_name.charAt(0).toUpperCase() +
                                appt.last_name.slice(1).toLowerCase()
                              : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(appt.appointment_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(
                            `1970-01-01T${appt.timeSchedule}`
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {appt.appointment_type}
                        </td>
                        <td className="px-6 py-4">
                          {appt.review === "Accepted" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {appt.review === "Rejected" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                          {appt.review === "Pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleReview(appt)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedAppointment && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
                aria-hidden="true"
                onClick={closeModal}
              ></div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                {/* Modal Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Appointment Details
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Owner Name
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedAppointment.first_name}{" "}
                        {selectedAppointment.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Service Type
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedAppointment.appointment_type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Date
                      </p>
                      <p className="text-base text-gray-900">
                        {new Date(
                          selectedAppointment.appointment_date
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Time
                      </p>
                      <p className="text-base text-gray-900">
                        {new Date(
                          `1970-01-01T${
                            selectedAppointment.timeSchedule ||
                            selectedAppointment.time_schedule
                          }`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </p>
                    {selectedAppointment.review === "Approve" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    )}
                    {selectedAppointment.review === "Reject" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    )}
                    {selectedAppointment.review === "Pending" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {selectedAppointment.review === "Pending" ? (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm 
                                 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg 
                                 hover:bg-red-700 transition-all active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg 
                                 hover:bg-green-700 transition-all active:scale-95"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={closeModal}
                        className="px-5 py-2.5 bg-gray-300 text-gray-700 text-sm font-medium 
                                 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <LoadingModal isOpen={sendingEmail} message="Sending email..." />
    </div>
  );
}

export default AppointmentPage;
