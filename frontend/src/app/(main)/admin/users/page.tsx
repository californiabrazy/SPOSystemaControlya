"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserModal from "@/components/forms/AddUserModal";
import DeleteUserModal from "@/components/forms/DeleteUserModal";
import ConfirmDeleteModal from "@/components/forms/ConfirmDeleteUserModal";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  role: { id: number; name: string };
};
type Role = { id: number; name: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function UsersPage() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Админ"]);

  const fetchRoles = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const res = await fetch(`${API_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка загрузки ролей");

      const data: Role[] = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки ролей");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка загрузки пользователей");

      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки пользователей");
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const res = await fetch(`${API_URL}/api/admin/available_managers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка загрузки менеджеров");

      const data: User[] = await res.json();
      setManagers(data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки менеджеров");
    }
  }, []);

  const addUser = useCallback(
    async (userData: {
      first_name: string;
      middle_name: string;
      last_name: string;
      email: string;
      password: string;
      role_id: number;
    }) => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const res = await fetch(`${API_URL}/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify(userData),
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Ошибка создания пользователя");
          return;
        }

        await fetchUsers();
        setShowUserModal(false);
      } catch {
        setError("Ошибка запроса к серверу");
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (deleteData: { id: number }) => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const res = await fetch(`${API_URL}/api/admin/delete_user`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify(deleteData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Ошибка при удалении пользователя");
        }

        await fetchUsers();
        setShowConfirmDeleteModal(false);
        setShowDeleteUserModal(false);
        setSelectedUser(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Ошибка удаления");
      }
    },
    [fetchUsers]
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        await Promise.all([fetchRoles(), fetchUsers(), fetchManagers()]);
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных");
        router.push("/login");
      }
    };
    initialize();
  }, [checkToken, fetchRoles, fetchUsers, fetchManagers, router]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserModal(false);
    setShowConfirmDeleteModal(true);
  };

  // --- Рендер страницы ---
  if (roleLoading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (role !== "Админ") return null; // скрываем страницу, если не Админ

  return (
    <div className="bg-[#f0f9fa]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Пользователи</h2>
          <div className="flex gap-2">
            <button
              className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
              onClick={() => setShowUserModal(true)}
            >
              Добавить
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
              onClick={() => setShowDeleteUserModal(true)}
            >
              Удалить
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow-md overflow-hidden table-fixed">
            <thead>
              <tr className="bg-[#8BBCC6] text-white">
                <th className="py-3 px-4 text-left font-normal w-1/5">Имя</th>
                <th className="py-3 px-4 text-left font-normal w-1/5">Фамилия</th>
                <th className="py-3 px-4 text-left font-normal w-1/5">Отчество</th>
                <th className="py-3 px-4 text-left font-normal w-1/5">Почта</th>
                <th className="py-3 px-4 text-left font-normal w-1/5">Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-center text-[#657166]">
                    Нет пользователей
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) => user.role.name !== "Админ")
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-100">
                      <td className="py-3 px-4 text-black">{user.first_name}</td>
                      <td className="py-3 px-4 text-black">{user.last_name}</td>
                      <td className="py-3 px-4 text-black">{user.middle_name}</td>
                      <td className="py-3 px-4 text-black">{user.email}</td>
                      <td className="py-3 px-4 text-black">{user.role.name}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          roles={roles}
          onSubmit={addUser}
        />
        <DeleteUserModal
          isOpen={showDeleteUserModal}
          onClose={() => setShowDeleteUserModal(false)}
          users={users.filter((user) => user.role.name !== "Админ")}
          onSelect={handleSelectUser}
        />
        <ConfirmDeleteModal
          isOpen={showConfirmDeleteModal}
          onClose={() => {
            setShowConfirmDeleteModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={() => selectedUser && deleteUser({ id: selectedUser.id })}
        />
      </div>
    </div>
  );
}
