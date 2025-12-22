import React, { createContext, useContext, useState, useCallback } from "react";

// Your actual modal component.
function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const ConfirmationContext = createContext();

export function useConfirmation() {
  return useContext(ConfirmationContext);
}

export function ConfirmationProvider({ children }) {
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    // additional handlers
    onConfirm: null,
    onCancel: null,
  });

  // Call this anywhere in the app!
  const requestConfirmation = useCallback(
    ({
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm,
    }) => {
      setModal({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          setModal((m) => ({ ...m, open: false }));
        },
        onCancel: () => setModal((m) => ({ ...m, open: false })),
      });
    },
    []
  );

  return (
    <ConfirmationContext.Provider value={{ requestConfirmation }}>
      {children}
      <ConfirmModal {...modal} />
    </ConfirmationContext.Provider>
  );
}
