import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role?: string;
}

export function useRoleGuard(allowedRoles: string[]) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (!decoded.role || !allowedRoles.includes(decoded.role)) {
        router.push("/");
        return;
      }
      setRole(decoded.role);
    } catch (err) {
      console.error("Ошибка декодирования токена", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [allowedRoles, router]);

  return { loading, role };
}
