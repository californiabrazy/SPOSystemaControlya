"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserModal from "@/components/forms/UserModal";
import ObjectModal from "@/components/forms/ObjectModal";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function AdminDashboard() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>(["Ivan Petrov", "Maria Ivanova"]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 refresh-token из cookie
  const refreshTokenFn = async (): Promise<boolean> => {
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
    } catch (err) {
      console.error("Ошибка при refreshToken:", err);
      router.push("/login");
      return false;
    }
  };

  const checkToken = async (): Promise<boolean> => {
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
        const data = await res.json();
        if (data.role !== "admin") {
          router.push("/login");
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
    } catch (err) {
      console.error("Ошибка при checkToken:", err);
      router.push("/login");
      return false;
    }
  };

  const fetchRoles = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки ролей:", err);
    }
  };

  const addUser = async (userData: {
    first_name: string;
    second_name: string;
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
        const data = await res.json();
        setUsers((prev) => [...prev, `${data.user.first_name} ${data.user.last_name}`]);
        setShowUserModal(false);
      } else {
        const errData = await res.json();
        setError(errData.error || "Ошибка создания пользователя");
      }
    } catch (err) {
      setError("Ошибка запроса к серверу");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const tokenOk = await checkToken();
      if (tokenOk) {
        await fetchRoles();
      }
      setLoading(false);
    };
    initialize();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9fa] p-8">
      <div className="flex gap-8 w-full max-w-5xl">
        <div className="flex-1 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-black">Пользователи</h2>
          <ul className="list-disc list-inside text-[#657166]">
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
          <button className="bg-[#99CDD8] text-white px-4 py-2 rounded" onClick={() => setShowUserModal(true)}>
            Добавить пользователя
          </button>
        </div>

        <div className="flex-1 bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-black">Строительные объекты</h2>
          <ul className="list-disc list-inside text-[#657166]">
            {["Объект 1", "Объект 2"].map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
          <button className="bg-[#99CDD8] text-white px-4 py-2 rounded" onClick={() => setShowObjectModal(true)}>
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
      <ObjectModal isOpen={showObjectModal} onClose={() => setShowObjectModal(false)} />
    </div>
  );
}
