import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react"; // Исправленный импорт act
import ManagerProject from "@/app/(main)/projects/manager/page";
import { useToken } from "@/hooks/useToken";
import { useRouter } from "next/navigation";

jest.mock("@/hooks/useToken", () => ({ useToken: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useToken as jest.Mock).mockReturnValue({ checkToken: jest.fn().mockResolvedValue(true) });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  global.fetch = jest.fn((url) =>
    new Promise((resolve) =>
      setTimeout(() => {
        if (url?.toString().includes("/api/projects/yours/manager")) {
          resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  id: 1,
                  name: "Проект A",
                  description: "Описание проекта A",
                  defects_count: 2,
                  engineers_count: 1,
                  assignees_count: 1,
                },
              ]),
          });
        } else if (url?.toString().includes("/api/defects/yours/manager")) {
          resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  id: 1,
                  title: "Ошибка 1",
                  description: "Описание ошибки 1",
                  author: { id: 1, first_name: "Иван", last_name: "Иванов", middle_name: "И." },
                  assignee: { id: 2, first_name: "Петр", last_name: "Петров", middle_name: "" },
                },
              ]),
          });
        } else {
          resolve(Promise.reject(new Error("Unknown URL")));
        }
      }, 100) // Задержка 100 мс для имитации асинхронной загрузки
    )
  ) as any;
});

test("показывает 'Загрузка...' перед получением данных", async () => {
  // Мокаем начальное состояние загрузки
  global.fetch = jest.fn(() =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve([]), // Пустой ответ для имитации загрузки
        });
      }, 100)
    )
  ) as any;

  await act(async () => {
    render(<ManagerProject />);
  });

  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});

test("рендерит проект и дефекты после загрузки", async () => {
  await act(async () => {
    render(<ManagerProject />);
  });

  await waitFor(() => {
    expect(screen.getByText("Проект A")).toBeInTheDocument();
    expect(screen.getByText("Описание проекта A")).toBeInTheDocument();
    expect(screen.getByText("Дефекты")).toBeInTheDocument();
    expect(screen.getByText("Ошибка 1")).toBeInTheDocument();
    expect(screen.getByText("Описание ошибки 1")).toBeInTheDocument();
    expect(screen.getByText("Инженеры")).toBeInTheDocument();
    expect(screen.getByText("Иван Иванов И.")).toBeInTheDocument();
    expect(screen.getByText("Исполнители")).toBeInTheDocument();
    expect(screen.getByText("Петр Петров")).toBeInTheDocument();
  });
});

test("переключает отображение дефектов, инженеров и исполнителей", async () => {
  await act(async () => {
    render(<ManagerProject />);
  });

  await waitFor(() => {
    expect(screen.getByText("Ошибка 1")).toBeInTheDocument();
  });

  const defectsBtn = screen.getByText("Дефекты").closest("button")!;
  const engineersBtn = screen.getByText("Инженеры").closest("button")!;
  const assigneesBtn = screen.getByText("Исполнители").closest("button")!;

  await act(async () => {
    fireEvent.click(defectsBtn);
  });
  await waitFor(() => {
    expect(screen.queryByText("Ошибка 1")).not.toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(engineersBtn);
  });
  await waitFor(() => {
    expect(screen.queryByText("Иван Иванов И.")).not.toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(assigneesBtn);
  });
  await waitFor(() => {
    expect(screen.queryByText("Петр Петров")).not.toBeInTheDocument();
  });
});