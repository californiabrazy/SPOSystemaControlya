type User = { id: number; first_name: string; last_name: string; middle_name: string; email: string; role: { id: number; name: string } };

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSelect: (user: User) => void;
}

export default function DeleteUserModal({ isOpen, onClose, users, onSelect }: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-black">Выберите пользователя для удаления</h2>
        <div className="max-h-64 overflow-y-auto mb-4">
          {users.length === 0 ? (
            <p className="text-gray-500">Нет пользователей для удаления</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => onSelect(user)}
                >
                  <p className="text-black">
                    {user.last_name} {user.first_name} {user.middle_name}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-center gap-2">
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