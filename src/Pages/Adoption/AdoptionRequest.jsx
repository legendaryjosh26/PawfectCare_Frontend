import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import EmailSentModal from "../../Components/Modals/EmailSentModal";
import LoadingModal from "../../Components/Modals/LoadingModal";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";

function AdoptionRequest() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);

  const { apiClient, logout } = useAuth();

  const fetchRequests = async () => {
    try {
      setIsPageLoading(true);
      const res = await apiClient.get("/dashboard/user/adoption/detail");
      const raw = Array.isArray(res.data) ? res.data : res.data?.requests || [];

      const formatted = raw.map((item) => ({
        id: item.adoption_id,
        pet_id: item.pet_id,
        user_id: item.user_id,
        email: item.email,
        adopterName: item.adopter_name,
        petName: item.name,
        dateRequested: item.dateRequested,
        dateAdopted: item.dateAdopted,
        status: item.status,
        purpose: item.purpose_of_adoption,
      }));

      setRequests(formatted);
    } catch (err) {
      console.error("Error fetching adoption requests:", err);
      setRequests([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoading(true);

    try {
      await apiClient.put(`/adoption/${selectedRequest.id}/adoptionApproved`, {
        adopterName: selectedRequest.adopterName,
        email: selectedRequest.email,
        petName: selectedRequest.petName,
      });

      await fetchRequests();
      setEmailSent(true);
    } catch (err) {
      console.error("Error approving request:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to approve adoption";
      alert(msg);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setLoading(true);

    try {
      await apiClient.put(`/adoption/${selectedRequest.id}/adoptionRejected`, {
        adopterName: selectedRequest.adopterName,
        email: selectedRequest.email,
        petName: selectedRequest.petName,
      });

      await fetchRequests();
      setEmailSent(true);
    } catch (err) {
      console.error("Error rejecting request:", err);
      const msg =
        err.response?.data?.error || err.message || "Failed to reject adoption";
      alert(msg);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleReview = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const closeModal = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
  };

  // Filter requests based on search
  const filteredRequests = requests.filter((req) => {
    const adopterName = (req.adopterName || "").toLowerCase();
    const petName = (req.petName || "").toLowerCase();
    const status = (req.status || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      adopterName.includes(query) ||
      petName.includes(query) ||
      status.includes(query)
    );
  });

  // Get counts by status
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  // NEW PET-THEMED FULL PAGE LOADING
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
              Preparing Adoptions
            </div>
            <div className="text-lg text-[#7c5e3b]/80">
              Loading adoption requests...
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
                  Adoption Requests
                </h2>
                <p className="text-sm text-gray-600">
                  Review and manage all adoption requests (
                  {filteredRequests.length} requests)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search adoptions..."
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

        {/* Adoption Requests Table */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Adopter Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Adopted
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
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No adoption requests found matching your search"
                          : "No adoption requests found."}
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {req.adopterName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.petName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.dateRequested
                            ? new Date(req.dateRequested).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {req.dateAdopted
                            ? new Date(req.dateAdopted).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {req.status === "Approved" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Approved
                            </span>
                          )}
                          {req.status === "Rejected" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Rejected
                            </span>
                          )}
                          {req.status === "Pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleReview(req)}
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
        {showReviewModal && selectedRequest && (
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
                      Adoption Request Details
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
                        Adopter Name
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedRequest.adopterName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Pet Name
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedRequest.petName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Date Requested
                    </p>
                    <p className="text-base text-gray-900">
                      {selectedRequest.dateRequested
                        ? new Date(
                            selectedRequest.dateRequested,
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Purpose of Adoption
                    </p>
                    <p className="text-base text-gray-900">
                      {selectedRequest.purpose || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </p>
                    {selectedRequest.status === "Approved" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    )}
                    {selectedRequest.status === "Rejected" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Rejected
                      </span>
                    )}
                    {selectedRequest.status === "Pending" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  {selectedRequest.status === "Pending" ? (
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

      <LoadingModal isOpen={loading} message="Sending email..." />
      <EmailSentModal
        isOpen={emailSent}
        message="Adoption status has been sent successfully."
        onClose={() => setEmailSent(false)}
      />
    </div>
  );
}

export default AdoptionRequest;
