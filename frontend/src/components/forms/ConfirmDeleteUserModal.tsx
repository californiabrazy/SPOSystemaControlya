type User = { id: number; first_name: string; last_name: string; middle_name: string; email: string; role: { id: number; name: string } };

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, onClose, user, onConfirm }: ConfirmDeleteModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-black flex justify-center">Подтверждение удаления</h2>
        <p className="text-[#657166] mb-4 text-center">
          Вы уверены, что хотите удалить пользователя{" "}
          <span className="font-semibold">
            {user.last_name} {user.first_name} {user.middle_name}
          </span>{" "}
          ({user.email})?
        </p>
        <div className="flex justify-center gap-2">
            <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
            onClick={onConfirm}
          >
            Удалить
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}