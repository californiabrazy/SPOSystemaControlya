"use client";

type ObjectItem = {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  manager: { id: number; first_name: string; last_name: string; middle_name: string };
};

interface DeleteObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  objects: ObjectItem[];
  onSelect: (object: ObjectItem) => void;
}

export default function DeleteObjectModal({ isOpen, onClose, objects, onSelect }: DeleteObjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-black">Выберите объект для удаления</h2>
        <div className="max-h-64 overflow-y-auto">
          {objects.length === 0 ? (
            <p className="text-gray-500">Нет объектов для удаления</p>
          ) : (
            <ul className="space-y-2">
              {objects.map((object) => (
                <li
                  key={object.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => onSelect(object)}
                >
                  <p className="text-black">{object.name}</p>
                  <p className="text-sm text-gray-500">{object.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-center gap-2">
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