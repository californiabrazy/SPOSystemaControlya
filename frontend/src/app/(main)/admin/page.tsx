"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserModal from "@/components/forms/UserModal";
import ObjectModal from "@/components/forms/ObjectModal";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

type User = { id: number; first_name: string; last_name: string; role: { id: number; name: string }; };
type Role = { id: number; name: string };
type ObjectItem = { id: number; name: string; description: string };

export default function AdminDashboard() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const refreshTokenFn = useCallback(async (): Promise<boolean> => {
    const refreshToken = getCookie("refresh_token");
    if (!refreshToken) {
      router.push("/login");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        return true;
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
        return false;
      }
    } catch {
      console.error("Ошибка при refreshToken");
      router.push("/login");
      return false;
    }
  }, [router, API_URL]);

  const checkToken = useCallback(async (): Promise<boolean> => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = getCookie("refresh_token");

    if (!accessToken || !refreshToken) {
      router.push("/login");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/auth/check_token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        const data: { role: string } = await res.json();
        if (data.role !== "Админ") {
          router.push("/");
          return false;
        }
        return true;
      } else if (res.status === 401) {
        const refreshed = await refreshTokenFn();
        if (refreshed) return await checkToken();
        return false;
      } else {
        throw new Error("Ошибка проверки токена");
      }
    } catch {
      console.error("Ошибка при checkToken");
      router.push("/login");
      return false;
    }
  }, [router, API_URL, refreshTokenFn]);

  const fetchRoles = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data: Role[] = await res.json();
        setRoles(data);
      }
    } catch {
      console.error("Ошибка загрузки ролей");
    }
  }, [API_URL]);

  const fetchUsers = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch {
      console.error("Ошибка загрузки пользователей");
    }
  }, [API_URL]);

  const fetchObjects = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data: ObjectItem[] = await res.json();
        setObjects(data);
      }
    } catch {
      console.error("Ошибка загрузки объектов");
    }
  }, [API_URL]);

  const fetchManagers = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/available_managers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data: User[] = await res.json();
        setManagers(data);
      }
    } catch {
      console.error("Ошибка загрузки менеджеров");
    }
  }, [API_URL]);

  const addObject = useCallback(
    async (objectData: {
      name: string;
      manager_id: number;
      description: string;
    }) => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      try {
        const res = await fetch(`${API_URL}/admin/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(objectData),
        });

        if (res.ok) {
          await fetchObjects();
          setShowObjectModal(false);
        } else {
          const errData = await res.json();
          setError(errData.error || "Ошибка создания объекта");
        }
      } catch {
        setError("Ошибка запроса к серверу");
      }
    },
    [API_URL, fetchObjects]
  );

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
        const res = await fetch(`${API_URL}/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
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
    [API_URL, fetchUsers]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const tokenOk = await checkToken();
      if (tokenOk) {
        await Promise.all([fetchRoles(), fetchUsers(), fetchObjects(), fetchManagers()]);
      }
      setLoading(false);
    };
    initialize();
  }, [checkToken, fetchRoles, fetchUsers, fetchObjects, fetchManagers]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9fa] p-8">
      <div className="flex gap-8 w-full max-w-5xl">
        <div className="flex-1 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-black">Пользователи</h2>
          <ul className="list-disc list-inside text-[#657166]">
            {users
              .filter((user) => user.role.name !== "Админ") // например, не показываем админов
              .map((user) => (
                <li key={user.id}>
                  {user.first_name} {user.last_name}
                </li>
              ))}
          </ul>
          <button
            className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
            onClick={() => setShowUserModal(true)}
          >
            Добавить пользователя
          </button>
        </div>

        <div className="flex-1 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-black">Строительные объекты</h2>
          <ul className="list-disc list-inside text-[#657166]">
            {objects.map((obj) => (
              <li key={obj.id}>{obj.name}</li>
            ))}
          </ul>
          <button
            className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
            onClick={() => setShowObjectModal(true)}
          >
            Добавить объект
          </button>
        </div>
      </div>

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        roles={roles}
        onSubmit={addUser}
      />
      <ObjectModal
        isOpen={showObjectModal}
        onClose={() => setShowObjectModal(false)}
        managers={managers}
        onSubmit={addObject}
      />
    </div>
  );
}