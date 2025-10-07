"use client";

import React, { useEffect, } from "react";

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  created_at: string;
};

type ReportDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ReportDetailsModal({ isOpen, onClose, report }: ReportDetailsModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[600px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">{report.title}</h3>
        <p className="text-gray-500 text-base bg-[#F0F0F0] p-4 rounded-md shadow-sm">{report.description}</p>
        <p className="text-black">Создано: {new Date(report.created_at).toLocaleString()}</p>

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


        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
