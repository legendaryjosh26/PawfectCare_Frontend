import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#7c5e3b] to-[#6b4f32] text-white mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section with Logo/Brand */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">🐾</span>
            </div>
            <h3 className="text-3xl font-bold">Pawfect Care</h3>
          </div>
          <p className="text-amber-100 text-lg max-w-2xl mx-auto">
            Making pet adoption easier and more accessible for residents of
            Tacurong City
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Location */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-amber-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-amber-100">Location</h4>
              </div>
              <p className="text-white/90 leading-relaxed">
                Office of Veterinary Services
                <br />
                Bonifacio Street, Barangay Poblacion
                <br />
                Tacurong, Philippines 9800
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-amber-100">Email</h4>
              </div>
              <a
                href="mailto:ovstacurong@gmail.com"
                className="text-white/90 hover:text-amber-200 transition-colors duration-300 break-all"
              >
                ovstacurong@gmail.com
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-amber-100">Phone</h4>
              </div>
              <a
                href="tel:09705475747"
                className="text-white/90 hover:text-amber-200 transition-colors duration-300"
              >
                +63 970 547 5747
              </a>
            </div>
          </div>

          {/* Website */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-full hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-purple-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-xl text-amber-100">Website</h4>
              </div>
              <a
                href="https://www.pawfectcare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-amber-200 transition-colors duration-300"
              >
                www.pawfectcare.com
              </a>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="border-t border-white/20 pt-12 mb-12">
          <h4 className="text-2xl font-bold text-center text-amber-100 mb-8">
            Our Services
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-900"
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
              <h5 className="text-lg font-semibold text-white mb-2">
                Pet Adoption
              </h5>
              <p className="text-white/80 text-sm">
                Find your perfect companion from our loving pets
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h5 className="text-lg font-semibold text-white mb-2">
                Consultation
              </h5>
              <p className="text-white/80 text-sm">
                Expert veterinary advice for your pets
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-900"
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
              <h5 className="text-lg font-semibold text-white mb-2">
                Vaccination
              </h5>
              <p className="text-white/80 text-sm">
                Keep your pets healthy with proper vaccination
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/80 text-sm mb-4 md:mb-0">
              © 2025 Pawfect Care. All rights reserved. | Making pet adoption
              accessible in Tacurong City.
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-white/60 hover:text-amber-200 transition-colors duration-300 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-amber-200 transition-colors duration-300 text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-white/60 hover:text-amber-200 transition-colors duration-300 text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
