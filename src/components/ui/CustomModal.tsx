"use client";

import { useUiStore } from "@/stores/useUiStore";
import { useState } from "react";
import { motion } from "framer-motion";

export const CustomModal = () => {
  const { modal, closeModal } = useUiStore();
  const [inputValue, setInputValue] = useState(modal?.defaultValue || "");

  if (!modal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => {
        modal.onCancel?.();
        closeModal();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-yellow-500" />

        <div className="p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-2 font-orbitron">
            {modal.title}
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">{modal.message}</p>

          {modal.type === "prompt" && (
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mb-6 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  modal.onConfirm?.(inputValue);
                  closeModal();
                }
              }}
            />
          )}

          <div className="flex justify-end gap-3">
            {modal.type !== "alert" && (
              <button
                onClick={() => {
                  modal.onCancel?.();
                  closeModal();
                }}
                className="px-5 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={() => {
                modal.onConfirm?.(inputValue);
                closeModal();
              }}
              className="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              {modal.type === "confirm"
                ? "Confirmar"
                : modal.type === "prompt"
                  ? "Aceptar"
                  : "Entendido"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
