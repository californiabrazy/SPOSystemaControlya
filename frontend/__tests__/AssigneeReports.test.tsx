import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyDefects from "@/app/(main)/reports/assignee/page";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useRouter } from "next/navigation";

jest.mock("@/components/forms/AssigneeAddReportModal", () =>
  () => <div data-testid="ReportModal" />
);
jest.mock("@/components/forms/SelectDefectAssigneeModal", () =>
  () => <div data-testid="SelectDefectModal" />
);

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/useToken", () => ({ useToken: jest.fn() }));
jest.mock("@/hooks/useRoleGuard", () => ({ useRoleGuard: jest.fn() }));

const mockPush = jest.fn();
const mockCheckToken = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useToken as jest.Mock).mockReturnValue({ checkToken: mockCheckToken });
  (useRoleGuard as jest.Mock).mockReturnValue({
    loading: false,
    role: "Исполнитель",
  });

  mockCheckToken.mockResolvedValue(true);

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            title: "Ошибка в отчёте",
            description: "Тестовый дефект",
            priority: "high",
            status: "new",
            projectId: 1,
          },
        ]),
    })
  ) as any;
});

afterEach(() => {
  jest.resetAllMocks();
});


test("показывает 'Загрузка...' при загрузке данных или роли", async () => {
  (useRoleGuard as jest.Mock).mockReturnValueOnce({ loading: true, role: "Исполнитель" });

  render(<MyDefects />);
  
  await waitFor(() => {
    expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
  });
});


test("рендерит карточку дефекта после успешной загрузки", async () => {
  render(<MyDefects />);

  await waitFor(() => {
    expect(screen.getByText("Ошибка в отчёте")).toBeInTheDocument();
  });

  expect(screen.getByText(/Приоритет: Высокий/i)).toBeInTheDocument();
});


test("открывает SelectDefectModal при нажатии на кнопку 'Добавить отчёт'", async () => {
  render(<MyDefects />);

  const button = await screen.findByText(/Добавить отчёт/i);

  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByTestId("SelectDefectModal")).toBeInTheDocument();
  });
});
