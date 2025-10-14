import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

  global.fetch = jest.fn((url) => {
    if (url?.toString().includes("/api/projects/yours/manager")) {
      return Promise.resolve({
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
      return Promise.resolve({
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
    }
    return Promise.reject(new Error("Unknown URL"));
  }) as any;
});

test("показывает 'Загрузка...' перед получением данных", () => {
  render(<ManagerProject />);
  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});

test("рендерит проект и дефекты после загрузки", async () => {
  render(<ManagerProject />);
  
  await waitFor(() => {
    expect(screen.getByText("Проект A")).toBeInTheDocument();
    expect(screen.getByText("Описание проекта A")).toBeInTheDocument();
  });

  expect(screen.getByText("Дефекты")).toBeInTheDocument();
  expect(screen.getByText("Ошибка 1")).toBeInTheDocument();
  expect(screen.getByText("Описание ошибки 1")).toBeInTheDocument();

  expect(screen.getByText("Инженеры")).toBeInTheDocument();
  expect(screen.getByText("Иван Иванов И.")).toBeInTheDocument();

  expect(screen.getByText("Исполнители")).toBeInTheDocument();
  expect(screen.getByText("Петр Петров")).toBeInTheDocument();
});

test("переключает отображение дефектов, инженеров и исполнителей", async () => {
  render(<ManagerProject />);

  await waitFor(() => screen.getByText("Ошибка 1"));

  const defectsBtn = screen.getByText("Дефекты").closest("button")!;
  const engineersBtn = screen.getByText("Инженеры").closest("button")!;
  const assigneesBtn = screen.getByText("Исполнители").closest("button")!;
  
  fireEvent.click(defectsBtn);
  expect(screen.queryByText("Ошибка 1")).not.toBeInTheDocument();

  fireEvent.click(engineersBtn);
  expect(screen.queryByText("Иван Иванов I.")).not.toBeInTheDocument();

  fireEvent.click(assigneesBtn);
  expect(screen.queryByText("Петр Петров")).not.toBeInTheDocument();
});
