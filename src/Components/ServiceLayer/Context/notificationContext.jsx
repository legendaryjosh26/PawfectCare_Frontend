// src/assets/ServiceLayer/Context/notificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationModal from "../../Components/Modals/NotificationModal";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showNotification = useCallback((message, type = "success") => {
    setModal({ isOpen: true, message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, closeNotification }}
    >
      {children}
      <NotificationModal
        isOpen={modal.isOpen}
        message={modal.message}
        type={modal.type}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
}
