import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Add this line
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import AdoptionBanner from "../../assets/User-Page-Image/AdoptionBanner.png";
import PetGroup from "../../assets/User-Page-Image/PetGroup.svg";
import AdoptionConfirmationModal from "../../Components/Modals/AdoptionConfirmationModal";
import ChatWidget from "../../Components/ChatWidget/ChatWidget";
import CategoryButtons from "../../Components/PetCategory/CategoryButtons";
import PetLists from "../../Components/PetCategory/PetLists";

function AdoptionPage() {
  const location = useLocation();
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  // Default category is "All"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPet, setSelectedPet] = useState(null);

  const { token } = useAuth();

  useEffect(() => {
    let modalTimer;

    if (location.state?.showAdoptionModal) {
      setShowAdoptionModal(true);
      modalTimer = setTimeout(() => setShowAdoptionModal(false), 2000);

      // clear history state so it doesn't reopen on back
      window.history.replaceState({}, document.title);
    }

    return () => {
      if (modalTimer) clearTimeout(modalTimer);
    };
  }, [location.state]);

  return (
    <>
      {/* <ScrollToTopOnce/> */}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c5e3b]/40 via-[#7c5e3b]/20 to-transparent z-10"></div>
          <img
            src={AdoptionBanner}
            alt="Adoption Campaign Banner"
            className="w-full h-auto object-cover"
          />
        </div>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Adoption Features */}
          <section className="py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Safe & Secure
                </h3>
                <p className="text-gray-600">
                  All pets are health-checked and vaccinated
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Easy Process
                </h3>
                <p className="text-gray-600">
                  Simple adoption process with full support
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
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
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Lifetime Support
                </h3>
                <p className="text-gray-600">
                  We're here to help throughout your pet's life
                </p>
              </div>
            </div>
          </section>

          {/* Pet Category Section */}
          <section className="px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto mt-8 sm:mt-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-center">
              Available Pets for Adoption
            </h2>

            {/*Pass token to CategoryButtons */}
            <CategoryButtons
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              token={token}
            />

            {/* Pet Group Image */}
            {!selectedCategory && (
              <div className="flex justify-center -mt-20 sm:-mt-32 md:-mt-48 mb-8 sm:mb-12">
                <img
                  src={PetGroup}
                  alt="Group of pets illustration"
                  className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto"
                />
              </div>
            )}

            {/* Pass token to PetLists */}
            {selectedCategory && (
              <PetLists
                selectedCategory={selectedCategory}
                onSelectPet={setSelectedPet}
                token={token}
              />
            )}
          </section>
        </div>

        {/* Floating Chat Widget */}
        <ChatWidget />
        {/* Adoption Confirmation Modal */}
        <AdoptionConfirmationModal
          isOpen={showAdoptionModal}
          onClose={() => setShowAdoptionModal(false)}
        />
      </div>
    </>
  );
}

export default AdoptionPage;
