import DogAndCat from "../../assets/User-Page-Image/DogAndCatImage.png";
import Footer from "../../Components/Footer/Footer";
import ChatWidget from "../../Components/ChatWidget/ChatWidget";

function AboutUsPage() {
  const steps = [
    {
      title: "Browse a pet",
      desc: "View detailed profiles of dogs and cats available for adoption in your area",
      step: 1,
    },
    {
      title: "Apply for adoption",
      desc: "Submit an adoption request with your information and preferences",
      step: 2,
    },
    {
      title: "Schedule a Consultation",
      desc: "Easily book an appointment with veterinary services for your new pet",
      step: 3,
    },
    {
      title: "Book Vaccination",
      desc: "Ensure your pet stays healthy with scheduled vaccination appointments",
      step: 4,
    },
    {
      title: "Stay Updated",
      desc: "Receive notifications about your adoption status and appointment reminders",
      step: 5,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#f9f7f7] to-white">
        {/* Hero Section */}
        <div className="relative">
          <div className="w-full relative overflow-hidden rounded-b-3xl shadow-lg">
            <img
              src={DogAndCat}
              alt="Happy dog and cat"
              className="w-full h-auto object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          {/* About Section */}
          <section className="py-12 md:py-20">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#7c5e3b] mb-6">
                About Pawfect Care
              </h1>
              <div className="w-24 h-1 bg-[#7c5e3b] mx-auto rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 text-center max-w-4xl mx-auto">
                Pawfect Care is a web-based management system designed to make
                pet adoption easier and more accessible for residents of
                Tacurong City. Our platform connects adopters with loving pets
                in need of a home while also providing a seamless way to
                schedule veterinary consultations. By reducing the need for
                manual processing, we help streamline adoption efforts and
                ensure a smooth experience for adopters, pet owners, and the
                Tacurong City Veterinary Services Office.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 hover:shadow-xl transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#7c5e3b] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h3 className="text-2xl font-bold text-[#7c5e3b] mb-2">
                    OUR MISSION
                  </h3>
                  <div className="w-12 h-1 bg-[#7c5e3b] mx-auto rounded-full"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-center">
                  Our mission is to create a more efficient and compassionate
                  pet adoption process while ensuring that pet owners have easy
                  access to veterinary services. We strive to connect animals
                  with responsible owners and promote a community where every
                  pet receives the care and love they deserve.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 hover:shadow-xl transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#7c5e3b] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#7c5e3b] mb-2">
                    OUR VISION
                  </h3>
                  <div className="w-12 h-1 bg-[#7c5e3b] mx-auto rounded-full"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-center">
                  We envision a future where pet adoption is hassle-free,
                  ensuring that every stray or abandoned pet finds a loving and
                  responsible home. Through technology, we aim to bridge the gap
                  between adopters and available pets, making the process
                  simple, transparent, and efficient. Additionally, we seek to
                  improve pet healthcare by providing an easy-to-use platform
                  for booking consultations and vaccinations.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-12 md:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#7c5e3b] mb-6">
                How It Works
              </h2>
              <div className="w-24 h-1 bg-[#7c5e3b] mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="w-12 h-12 bg-[#7c5e3b] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {step.step}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Connector line for larger screens */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#7c5e3b] transform -translate-y-1/2 z-10">
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-[#7c5e3b] rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        <ChatWidget />
        <Footer />
      </div>
    </>
  );
}

export default AboutUsPage;
