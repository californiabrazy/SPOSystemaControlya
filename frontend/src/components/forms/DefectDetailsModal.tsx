import { useEffect } from "react";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  author?: { id: number; first_name: string; last_name: string; middle_name: string };
  project?: { id: number; name: string };
};

type DefectDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defect: Defect | null;
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Критический",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  resolved: "Решён",
  closed: "Закрыт",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function DefectDetailsModal({ isOpen, onClose, defect }: DefectDetailsModalProps) {
  // Эффект для управления прокруткой
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Очистка при размонтировании или закрытии модалки
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !defect) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-6">
        <h3 className="text-xl font-semibold text-black mb-4">Детали дефекта</h3>

        <div className="grid grid-cols-1 gap-6">
          {/* Секция с названием и описанием */}
          <div className="space-y-2">
            <h4 className="font-bold text-lg text-gray-900">{defect.title}</h4>
            <p className="text-gray-500 text-base bg-[#F0F0F0] p-4 rounded-md shadow-sm">{defect.description}</p>
          </div>

          {/* Секция с приоритетом и статусом */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <p className="font-medium text-black mb-1">Приоритет:</p>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded w-max ${
                defect.priority === "critical" ? "bg-[#F3B2AA] text-black" :
                defect.priority === "high" ? "bg-[#F3C3B2] text-black" :
                defect.priority === "medium" ? "bg-[#F3D1B2] text-black" :
                "bg-[#F3E0B2] text-black"
              }`}>
                {PRIORITY_LABELS[defect.priority] || defect.priority}
              </span>
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-black mb-1">Статус:</p>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded w-max ${
                defect.status === "new" ? "bg-[#D0E8FF] text-black" :
                defect.status === "in_progress" ? "bg-[#E5D6FF] text-black" :
                defect.status === "resolved" ? "bg-[#D1FCD8] text-black" :
                defect.status === "closed" ? "bg-[#F3F4F6] text-black" :
                "bg-[#FEF3C7] text-black"
              }`}>
                {STATUS_LABELS[defect.status] || defect.status}
              </span>
            </div>
          </div>

          {/* Секция с вложениями */}
          <div className="space-y-2">
            <p className="font-medium text-black">Вложения:</p>
            {defect.attachments?.length ? (
              <div className="flex flex-wrap gap-2">
                {defect.attachments.map((file) => {
                  const filename = file.split("/").pop();
                  return (
                    <a
                      key={file}
                      href={`${API_URL}/api/defects/download/${encodeURIComponent(filename!)}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {filename}
                    </a>
                  );
                })}
              </div>
            ) : (
              <span className="text-gray-500">Нет вложений</span>
            )}
          </div>

          {/* Секция с дополнительной информацией */}
          <div className="grid grid-cols-2 gap-4 text-[#657166]">
            <div className="space-y-1">
              <p className="text-gray-500"><span className="font-medium text-black">Проект:</span> {defect.project ? defect.project.name : `ID ${defect.projectId}`}</p>
              <p className="text-gray-500"><span className="font-medium text-black">Автор:</span> {defect.author ? `${defect.author.first_name} ${defect.author.last_name} ${defect.author.middle_name}` : `ID ${defect.authorId}`}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500"><span className="font-medium text-black">Создано:</span> {new Date(defect.createdAt).toLocaleString()}</p>
              <p className="text-gray-500"><span className="font-medium text-black">Обновлено:</span> {new Date(defect.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4">
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