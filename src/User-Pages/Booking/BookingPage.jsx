import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import BookingPoster from "../../assets/User-Page-Image/BookingPoster.png";
import consultation from "../../assets/User-Page-Image/consultation.svg";
import deworm from "../../assets/User-Page-Image/deworm.svg";
import Footer from "../../Components/Footer/Footer";
import ChatWidget from "../../Components/ChatWidget/ChatWidget";

function BookingPage() {
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(true);

  const services = [
    {
      key: "Consultation",
      icon: consultation,
      title: "Consultation",
      description:
        "Get expert veterinary advice and personalized care for your pets.",
      color: "from-[#7c5e3b] to-[#8b6f47]",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
    },
    {
      key: "General",
      icon: consultation, // change icon if you have a dedicated one
      title: "General",
      description:
        "General visit that may include both consultation and vaccination.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
    },
    {
      key: "Vaccination",
      icon: deworm,
      title: "Vaccination",
      description:
        "Maintain your pet's health with proper deworming and anti-rabies treatments.",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c5e3b]/40 via-[#7c5e3b]/20 to-transparent z-10"></div>
        <div className="relative ">
          <img
            src={BookingPoster}
            alt="Booking Services"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Indicators */}
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
                Expert Care
              </h3>
              <p className="text-gray-600">
                Professional veterinarians with years of experience
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-gray-600">
                Book appointments at times that work for you
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
                Compassionate Care
              </h3>
              <p className="text-gray-600">
                We treat your pets with love and gentle care
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              We Provide Best Services
            </h2>
            <div className="w-24 h-1 bg-[#7c5e3b] mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our professional veterinary services designed to keep
              your pets healthy and happy
            </p>
          </div>

          {/* Services Row: Consultation | General | Vaccination */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto mb-16">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() =>
                  navigate("/user/booking-form", {
                    state: { preselectedService: service.key },
                  })
                }
                className="flex-1 max-w-sm mx-auto group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-[#7c5e3b]/30 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <div className="p-8 md:p-10">
                  <div className="flex items-center mb-6">
                    <div
                      className={`${service.iconBg} rounded-2xl w-16 h-16 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <img
                        src={service.icon}
                        alt={`${service.title} icon`}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="flex items-center text-[#7c5e3b] font-medium group-hover:text-[#6b4f32] transition-colors">
                    <span>Learn more</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#7c5e3b] to-[#8b6f47] rounded-3xl p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Book Your Appointment?
              </h3>
              <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
                Take the first step towards better pet health. Our experienced
                veterinarians are here to help.
              </p>
              <button
                onClick={() =>
                  navigate("/user/booking-form", {
                    state: { preselectedService: "" },
                  })
                }
                className="bg-white text-[#7c5e3b] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg inline-flex items-center"
              >
                <svg
                  className="w-6 h-6 mr-3"
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
                Schedule Appointment
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Pawfect Care?
            </h2>
            <div className="w-24 h-1 bg-[#7c5e3b] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#7c5e3b] to-[#8b6f47] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Expert Knowledge
              </h4>
              <p className="text-gray-600">
                Licensed veterinarians with extensive training
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Modern Equipment
              </h4>
              <p className="text-gray-600">
                State-of-the-art medical equipment and facilities
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
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
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Compassionate Care
              </h4>
              <p className="text-gray-600">
                We treat every pet with love and compassion
              </p>
            </div>
          </div>
        </section>
      </div>
      <ChatWidget />
      <Footer />
    </div>
  );
}

export default BookingPage;
