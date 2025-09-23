"use client";

import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50">
      <div className="bg-white rounded shadow-lg p-6 w-96">
        <h2 className="justify-center flex text-xl font-semibold text-black mb-4">
          Подтверждение выхода
        </h2>
        <p className="text-[#657166] mb-6 flex justify-center">
          Вы уверены, что хотите выйти из аккаунта?
        </p>

        <div className="flex justify-center space-x-3">
            <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white transition"
          >
            Выйти
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black transition"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
