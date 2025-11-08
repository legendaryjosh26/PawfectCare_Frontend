// ConfirmSignOut.jsx
import { useEffect, useRef } from "react";
import { LogOut, X } from "lucide-react";

export default function ConfirmSignOut({ open, onClose, onConfirm }) {
  const cancelBtnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-title"
      aria-describedby="signout-desc"
    >
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
        tabIndex={-1}
        style={{ cursor: "default" }}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-sm rounded-xl border bg-white p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 id="signout-title" className="text-base font-medium">
            Confirm sign out
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div className="mt-0.5 rounded-md border p-1">
            <LogOut className="h-5 w-5 text-gray-700" />
          </div>
          <p id="signout-desc" className="text-sm text-gray-600">
            This will end the current session and return to the login screen.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await onConfirm?.();
              } finally {
                onClose();
              }
            }}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
