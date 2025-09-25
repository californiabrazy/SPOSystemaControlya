"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserModal from "@/components/forms/UserModal";
import DeleteUserModal from "@/components/forms/DeleteUserModal";
import ConfirmDeleteModal from "@/components/forms/ConfirmDeleteUserModal";
import { useAdmin } from "@/hooks/useAdmin";

type User = { id: number; first_name: string; last_name: string; middle_name: string; email: string; role: { id: number; name: string } };
type Role = { id: number; name: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function UsersPage() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const router = useRouter();
  const { checkToken } = useAdmin();

  const fetchRoles = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const data: Role[] = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки ролей", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/available_managers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const data: User[] = await res.json();
        setManagers(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки менеджеров", err);
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
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify(userData),
        });

        if (res.ok) {
          await fetchUsers();
          setShowUserModal(false);
        } else {
          const errData = await res.json();
          setError(errData.error || "Ошибка создания пользователя");
        }
      } catch {
        setError("Ошибка запроса к серверу");
      }
    },
    [fetchUsers]
  );

  const DeleteUser = useCallback(
    async (deleteData: {
      id: number,
    }) => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/admin/delete_user`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          credentials: "include",
          body: JSON.stringify(deleteData),
        })

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Ошибка при удалении пользователя");
        }

        await fetchUsers();
        setShowConfirmDeleteModal(false);
        setShowDeleteUserModal(false);
        setSelectedUser(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Ошибка удаления");  
      }
    },
    [fetchUsers]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const tokenOk = await checkToken();
        if (tokenOk) {
          await Promise.all([fetchRoles(), fetchUsers(), fetchManagers()]);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Ошибка инициализации:", err);
        setError("Ошибка при загрузке данных");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [checkToken, fetchRoles, fetchUsers, fetchManagers]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserModal(false);
    setShowConfirmDeleteModal(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

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
              {users.filter((user) => user.role.name !== "Админ").map((user) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="py-3 px-4 text-black">{user.first_name}</td>
                  <td className="py-3 px-4 text-black">{user.last_name}</td>
                  <td className="py-3 px-4 text-black">{user.middle_name}</td>
                  <td className="py-3 px-4 text-black">{user.email}</td>
                  <td className="py-3 px-4 text-black">{user.role.name}</td>
                </tr>
              ))}
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
          onConfirm={() => selectedUser && DeleteUser({ id: selectedUser.id })}
        />
      </div>
    </div>
  );
}