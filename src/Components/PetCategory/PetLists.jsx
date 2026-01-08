import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ServiceLayer/Context/authContext";

// Skeleton Loading Component
const PetCardSkeleton = () => (
  <div className="bg-white shadow-md rounded-lg p-2 sm:p-3 md:p-4 animate-pulse">
    <div className="aspect-square w-full bg-gray-300 rounded-lg mb-3"></div>
    <div className="h-4 bg-gray-300 rounded mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

function PetLists({ selectedCategory, onLoadingChange }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const navigate = useNavigate();
  const { apiClient } = useAuth();

  // Get the best available image URL
  const getPetImageUrl = (pet) => {
    return pet.imageUrl || pet.image || "/default-pet.png";
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setFadeOut(true);
        setLoading(true);
        setError(null);
        onLoadingChange?.(true);

        await new Promise((resolve) => setTimeout(resolve, 200));

        let url = `/pets/getAllPets`;
        if (selectedCategory !== "All") {
          url = `/pets/${selectedCategory}`;
        }

        const res = await apiClient.get(url);
        setPets(Array.isArray(res.data) ? res.data : []);

        setFadeOut(false);
        setTimeout(() => setFadeIn(true), 50);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setError(error.message || "Error loading pets");
        setPets([]);
        setFadeOut(false);
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    };

    setFadeIn(false);
    fetchPets();
  }, [selectedCategory, onLoadingChange, apiClient]);

  const openImageViewer = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setImageViewerOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeImageViewer();
    };
    if (imageViewerOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [imageViewerOpen]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <PetCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 font-medium">Error loading pets</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v4.01"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">No pets available</p>
          <p className="text-gray-500 text-sm mt-1">
            Check back later for new arrivals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PET GRID */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          fadeOut
            ? "opacity-0 transform translate-y-4"
            : fadeIn
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-4"
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {pets.map((pet, index) => (
            <div
              key={pet.pet_id}
              className="group bg-white shadow-md rounded-lg p-2 sm:p-3 md:p-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              onClick={() => setSelectedPet(pet)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: fadeIn ? "slideInUp 0.6s ease-out forwards" : "none",
              }}
            >
              <div
                className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageViewer(getPetImageUrl(pet));
                }}
              >
                <img
                  src={getPetImageUrl(pet)}
                  alt={pet.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-xs sm:text-sm md:text-lg font-bold text-gray-900 group-hover:text-[#a16f4a] transition-colors duration-300">
                  {pet.name}
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600">
                  {pet.breed}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pet.gender && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {pet.gender}
                    </span>
                  )}
                  {pet.size && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {pet.size}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PET DETAILS MODAL */}
      {selectedPet && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setSelectedPet(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto relative animate-slideInUp max-w-4xl">
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 z-10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6 sm:p-8">
              {/* CLICK IMAGE TO FULLSCREEN - NO OVERLAY */}
              <div
                className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 mb-6 cursor-pointer hover:brightness-105 transition-all duration-300 relative"
                onClick={() => openImageViewer(getPetImageUrl(selectedPet))}
              >
                <img
                  src={getPetImageUrl(selectedPet)}
                  alt={selectedPet.name}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              {/* Pet details */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedPet.name}
                </h2>
                <p className="text-xl text-gray-600">{selectedPet.breed}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center border-b pb-2">
                  Pet Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Size
                    </p>
                    <p className="text-blue-900 font-semibold">
                      {selectedPet.size || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                    <p className="text-sm text-pink-600 font-medium mb-1">
                      Gender
                    </p>
                    <p className="text-pink-900 font-semibold">
                      {selectedPet.gender || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-1">
                      Weight
                    </p>
                    <p className="text-green-900 font-semibold">
                      {selectedPet.weight
                        ? `${selectedPet.weight} kg`
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      Color
                    </p>
                    <p className="text-purple-900 font-semibold">
                      {selectedPet.color || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center border-b pb-2">
                  Medical Status
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                  <p className="text-emerald-900 font-medium text-center">
                    {selectedPet.medical_status ||
                      "Healthy - No medical issues reported"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setSelectedPet(null)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    navigate("/user/adoption-form", {
                      state: { pet_id: selectedPet.pet_id },
                    })
                  }
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-[#a16f4a] to-[#b8784e] text-white font-semibold rounded-xl hover:from-[#8f5e3f] hover:to-[#a16f4a] transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Adopt {selectedPet.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE VIEWER */}
      {imageViewerOpen && currentImageUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
          onClick={closeImageViewer}
        >
          <button
            onClick={closeImageViewer}
            className="absolute top-8 right-8 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white text-3xl font-bold transition-all duration-300 hover:scale-110 z-[101]"
            aria-label="Close fullscreen image"
          >
            ×
          </button>

          <img
            src={currentImageUrl}
            alt="Fullscreen pet image"
            className="w-auto h-auto max-w-full max-h-[95vh] object-contain rounded-2xl shadow-2xl cursor-zoom-out hover:brightness-105 transition-all duration-300 select-none"
            onClick={(e) => e.stopPropagation()}
            loading="lazy"
            draggable="false"
          />
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.4s ease-out; }
      `}</style>
    </>
  );
}

export default PetLists;
