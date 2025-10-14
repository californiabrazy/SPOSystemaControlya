"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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

type Props = {
  isOpen: boolean;
  report: Report;
  onClose: () => void;
  onApprove: () => void;
};

const MAX_CHARS = 200;

export default function ReportReviewModal({ isOpen, report, onClose, onApprove }: Props) {
  const [approveLoading, setApproveLoading] = useState(false);

  // === Принятие отчёта ===
  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reports/approve/engineer/${report.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ decision: "approve" }),
      });
      if (!res.ok) throw new Error("Ошибка при подтверждении отчёта");
      onApprove();
    } catch (err) {
      console.error(err);
      alert("Не удалось подтвердить отчёт");
    } finally {
      setApproveLoading(false);
    }
  };

  if (!isOpen) return null;

  // Обрезаем описание, если превышает лимит
  const truncatedDescription =
    report.description.length > MAX_CHARS
      ? `${report.description.slice(0, MAX_CHARS)}... (обрезано)`
      : report.description;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">
          Проверка отчёта: {report.title}
        </h3>

        <div className="grid grid-cols-2 gap-4 text-black">
          <div>
            <p className="ml-1 mb-1">Название дефекта</p>
            <input
              type="text"
              value={report.defect?.title || ""}
              disabled
              className="w-full rounded bg-[#F0F0F0] px-4 py-3"
            />
          </div>

          <div>
            <p className="ml-1 mb-1">Статус</p>
            <input
              type="text"
              value={report.defect?.status || ""}
              disabled
              className="w-full rounded bg-[#F0F0F0] px-4 py-3"
            />
          </div>

          <div className="col-span-2">
            <p className="ml-1 mb-1">Описание</p>
            <textarea
              value={truncatedDescription}
              disabled
              className="w-full rounded bg-[#F0F0F0] px-4 py-3 resize-none"
              rows={4}
            />
            {report.description.length > MAX_CHARS && (
              <p className="text-sm text-gray-500 mt-1 text-right">
                Показано {MAX_CHARS} из {report.description.length} символов
              </p>
            )}
          </div>

          <div className="col-span-2">
            <p className="ml-1 mb-1">Вложения</p>
            <div className="flex gap-3 flex-wrap ml-1 mb-1">
              {report.attachments && report.attachments.length > 0 ? (
                report.attachments.map((path, i) => (
                  <a
                    key={i}
                    href={path.startsWith("/uploads") ? `${API_URL}${path}` : path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Файл {i + 1}
                  </a>
                ))
              ) : (
                <span className="text-gray-500">Нет вложений</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={handleApprove}
            disabled={approveLoading}
            className="px-6 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white disabled:opacity-50"
          >
            {approveLoading ? "Сохраняю..." : "Принять"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
