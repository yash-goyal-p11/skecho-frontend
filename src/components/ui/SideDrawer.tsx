import React from "react";
import { createPortal } from "react-dom";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; // e.g., 'w-1/2' or 'w-[50vw]'
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ open, onClose, children, widthClass = "w-1/2" }) => {
  if (typeof window === "undefined") return null;
  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full ${widthClass} max-w-full bg-white shadow-xl transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          &times;
        </button>
        <div className="h-full flex flex-col pt-16 px-6">{/* pt-16 for space below close btn */}
          {children}
        </div>
      </aside>
    </>,
    document.body
  );
}; 