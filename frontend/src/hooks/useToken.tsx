import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useToken() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const refreshTokenFn = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
        return false;
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      return true;
    } catch (err) {
      console.error("Ошибка при refreshToken", err);
      router.push("/login");
      return false;
    }
  }, [router, API_URL]);

  const checkToken = useCallback(async (): Promise<boolean> => {
    let accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      const refreshed = await refreshTokenFn();
      if (!refreshed) return false;
      accessToken = localStorage.getItem("access_token")!;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/check_token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (res.ok) {
        return true;
      }

      if (res.status === 401) {
        const refreshed = await refreshTokenFn();
        if (refreshed) return await checkToken();
        return false;
      }

      throw new Error("Ошибка проверки токена");
    } catch (err) {
      console.error("Ошибка при checkToken", err);
      router.push("/login");
      return false;
    }
  }, [router, API_URL, refreshTokenFn]);

  return { checkToken };
}
