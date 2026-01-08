import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// ... other imports

// Add this ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};
