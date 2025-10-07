"use client";

import React, { useEffect } from "react";

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  created_at: string;
  project?: { name: string; description?: string };
  user?: { first_name: string; last_name: string; middle_name?: string; email?: string };
};

type LeaderReportDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function LeaderReportDetailsModal({
  isOpen,
  onClose,
  report,
}: LeaderReportDetailsModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_URL}/export/${report.id}/csv`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) throw new Error("Ошибка при экспорте CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Не удалось экспортировать отчет");
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[600px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">{report.title}</h3>

        {/* Описание */}
        {report.description && (
          <p className="text-gray-500 text-base bg-[#F0F0F0] p-4 rounded-md shadow-sm">
            {report.description}
          </p>
        )}

        {/* Автор */}
        {report.user && (
          <div>
            <div className="flex gap-1">
              <p className="font-medium text-black">Автор:</p>
              <p className="text-black">
                {report.user.last_name} {report.user.first_name}{" "}
                {report.user.middle_name || ""}
              </p>
            </div>
            {report.user.email && <p className="text-gray-500">{report.user.email}</p>}
          </div>
        )}

        {/* Проект */}
        {report.project && (
          <div className="flex gap-1">
            <p className="font-medium text-black">Проект:</p>
            <p className="text-black">{report.project.name}</p>
          </div>
        )}

        {/* Дата */}
        <p className="text-black">
          Создано: {new Date(report.created_at).toLocaleString()}
        </p>

        {/* Вложения */}
        <div className="space-y-1">
          <p className="font-medium text-black">Файлы:</p>
          {report.attachments && report.attachments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {report.attachments.map((file) => {
                const filename = file.split("/").pop();
                return (
                  <a
                    key={file}
                    href={`${API_URL}/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {filename}
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Файлов нет</p>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white"
          >
            Экспортировать
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
