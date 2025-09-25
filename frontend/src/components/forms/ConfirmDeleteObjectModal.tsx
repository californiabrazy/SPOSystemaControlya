"use client";

type ObjectItem = {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  manager: { id: number; first_name: string; last_name: string; middle_name: string };
};

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  object: ObjectItem | null;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, onClose, object, onConfirm }: ConfirmDeleteModalProps) {
  if (!isOpen || !object) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-black flex justify-center">Подтверждение удаления</h2>
        <p className="text-black text-center">
          Вы уверены, что хотите удалить объект{" "}
          <span className="font-semibold">{object.name}</span>?
        </p>
        <div className="flex justify-center gap-2">
            <button
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white"
            onClick={onConfirm}
          >
            Удалить
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}