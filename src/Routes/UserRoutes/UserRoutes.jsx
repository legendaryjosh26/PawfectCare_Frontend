import UserLoginPage from "../../User-Pages/Login/UserLogin";
import AboutUSPage from "../../User-Pages/AboutUs/AboutUsPage";
import UserRegistrationPage from "../../User-Pages/Registration/UserRegistration";
import AdoptionPage from "../../User-Pages/Adoption/AdoptionPage";
import BookingPage from "../../User-Pages/Booking/BookingPage";
import BookingFormPage from "../../User-Pages/Booking/BookingForm";
import AdoptionFormPage from "../../User-Pages/Adoption/AdoptionForm";
import ForgotPasswordPage from "../../User-Pages/ForgotPassword/ForgotPassword";

import PageTransition from "../../Components/PageTransition/PageTransition";
import UserLayout from "../../Components/PageTransition/UserLayout";

// Routes WITH navbar
const UserMainRoute = {
  path: "/user",
  element: <UserLayout />, // Navbar shows here
  children: [
    {
      path: "about",
      element: (
        <PageTransition>
          <AboutUSPage />
        </PageTransition>
      ),
    },
    {
      path: "adoption",
      element: (
        <PageTransition>
          <AdoptionPage />
        </PageTransition>
      ),
    },
    {
      path: "booking",
      element: (
        <PageTransition>
          <BookingPage />
        </PageTransition>
      ),
    },
  ],
};

// Routes WITHOUT navbar
const UserLoginRoute = {
  path: "/",
  element: (
    <PageTransition>
      <UserLoginPage />
    </PageTransition>
  ),
};

const UserRegistrationRoute = {
  path: "/user/registration",
  element: <UserRegistrationPage />,
};

const UserForgotPasswordRoute = {
  path: "/user/forgot-password",
  element: (
    <PageTransition>
      <ForgotPasswordPage />
    </PageTransition>
  ),
};

const UserBookingFormRoute = {
  path: "/user/booking-form",
  element: (
    <PageTransition>
      <BookingFormPage />
    </PageTransition>
  ),
};

const UserAdoptionFormRoute = {
  path: "/user/adoption-form",
  element: (
    <PageTransition>
      <AdoptionFormPage />
    </PageTransition>
  ),
};

export {
  UserMainRoute,
  UserLoginRoute,
  UserRegistrationRoute,
  UserForgotPasswordRoute,
  UserBookingFormRoute,
  UserAdoptionFormRoute,
};
