/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import DashboardPage from "@/app/(main)/page";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useRouter } from "next/navigation";

// --- Моки хуков и роутера ---
jest.mock("@/hooks/useToken", () => ({ useToken: jest.fn() }));
jest.mock("@/hooks/useRoleGuard", () => ({ useRoleGuard: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

const mockPush = jest.fn();

// --- Мок ResizeObserver для Recharts ---
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  localStorage.clear();
});

// --- Тесты ---
test("показывает 'Загрузка...' до окончания инициализации", async () => {
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(true) });
  (useRoleGuard as jest.Mock).mockReturnValue({ loading: true, role: null });

  await act(async () => {
    render(<DashboardPage />);
  });

  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});

test("редирект на /login если токен невалидный", async () => {
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(false) });
  (useRoleGuard as jest.Mock).mockReturnValue({ loading: false, role: "Менеджер" });

  await act(async () => {
    render(<DashboardPage />);
  });

  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
});

test("рендер менеджера с приветствием и списком отчетов", async () => {
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(true) });
  (useRoleGuard as jest.Mock).mockReturnValue({ loading: false, role: "Менеджер" });

  const reports = [{ id: 1, title: "Отчет 1", created_at: new Date().toISOString() }];

  global.fetch = jest.fn((url: string) => {
    if (url.includes("/api/reports/yours/manager")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ reports }) });
    }
    return Promise.reject("Unknown URL");
  }) as any;

  localStorage.setItem("user", JSON.stringify({ first_name: "Иван" }));

  await act(async () => {
    render(<DashboardPage />);
  });

  await waitFor(() => {
    expect(screen.getByText("Добрый день, Иван!")).toBeInTheDocument();
    expect(screen.getByText("Отчеты, которые нужно проверить:")).toBeInTheDocument();
    expect(screen.getByText("Отчет 1")).toBeInTheDocument();
    expect(screen.getByText("Проверить")).toBeInTheDocument();
  });
});

test("рендер руководителя с графиком и диаграммой дефектов", async () => {
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(true) });
  (useRoleGuard as jest.Mock).mockReturnValue({ loading: false, role: "Руководитель" });

  const reports = [{ id: 1, title: "Отчет A", created_at: new Date().toISOString() }];
  const defectStats = { total_registered: 5, closed: 1, new: 1, resolved: 1, in_progress: 2 };
  const reportsStats = [{ date: new Date().toISOString(), count: 2 }];

  global.fetch = jest.fn((url: string) => {
    if (url.includes("/api/reports/all")) return Promise.resolve({ ok: true, json: () => Promise.resolve(reports) });
    if (url.includes("/api/defects/stats")) return Promise.resolve({ ok: true, json: () => Promise.resolve(defectStats) });
    if (url.includes("/api/reports/stats")) return Promise.resolve({ ok: true, json: () => Promise.resolve(reportsStats) });
    return Promise.reject("Unknown URL");
  }) as any;

  localStorage.setItem("user", JSON.stringify({ first_name: "Мария" }));

  await act(async () => {
    render(<DashboardPage />);
  });

  await waitFor(() => {
    expect(screen.getByText("Добрый день, Мария!")).toBeInTheDocument();
    expect(screen.getByText("Все отчеты (1)")).toBeInTheDocument();
    expect(screen.getByText("Отчет A")).toBeInTheDocument();
    expect(screen.getByText("Статистика дефектов")).toBeInTheDocument();
    expect(screen.getByText("Отчеты за последнюю неделю")).toBeInTheDocument();
  });
});

test("открытие и закрытие модалки деталей отчета", async () => {
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(true) });
  (useRoleGuard as jest.Mock).mockReturnValue({ loading: false, role: "Руководитель" });

  const reports = [{ id: 1, title: "Отчет A", created_at: new Date().toISOString() }];

  global.fetch = jest.fn((url: string) => {
    if (url.includes("/api/reports/all")) return Promise.resolve({ ok: true, json: () => Promise.resolve(reports) });
    if (url.includes("/api/defects/stats")) return Promise.resolve({ ok: true, json: () => Promise.resolve(null) });
    if (url.includes("/api/reports/stats")) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    return Promise.reject("Unknown URL");
  }) as any;

  await act(async () => {
    render(<DashboardPage />);
  });

  await waitFor(() => screen.getByText("Отчет A"));
  fireEvent.click(screen.getByText("Отчет A"));

  expect(screen.getByText(/Закрыть|Close|Details/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Закрыть|Close/i }));
  await waitFor(() => {
    expect(screen.queryByText(/Закрыть|Close|Details/i)).not.toBeInTheDocument();
  });
});
