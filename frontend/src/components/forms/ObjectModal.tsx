"use client";

interface ObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ObjectModal({ isOpen, onClose }: ObjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">Добавить объект</h3>
        <input
          type="text"
          placeholder="Название объекта"
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <textarea
          placeholder="Описание"
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-[#657166]"
            onClick={onClose}
          >
            Отмена
          </button>
          <button className="px-4 py-2 rounded bg-[#99CDD8] hover:bg-[#88B8C3] text-white">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}