"use client";

import { useEffect, useState } from "react";

type Defect = {
  id: number;
  title: string;
  status: string;
};

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  status: string;
  defect: Defect;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (report: Report) => void;
  reports: Report[];
}

export default function SelectReportModal({ isOpen, onClose, onSelect, reports }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredReports = reports.filter(
    (report) =>
      report.status === "pending" &&
      report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">
          Выберите отчёт для проверки
        </h3>

        {/* Поле поиска */}
        <input
          type="text"
          placeholder="Поиск по названию отчёта..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />

        {/* Список отчётов */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredReports.length === 0 ? (
            <p className="text-[#657166] text-center">Нет отчётов, соответствующих поиску</p>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  onSelect(report);
                  onClose();
                }}
                className="p-3 hover:bg-[#F0F0F0] cursor-pointer transition rounded"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className="font-medium text-black">{report.title}</p>
                  <p className="text-sm text-gray-600">
                    Дефект: {report.defect?.title || "—"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}