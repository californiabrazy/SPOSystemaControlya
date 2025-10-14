import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ManagerDefects from "@/app/(main)/defects/manager/page";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useToken", () => ({
  useToken: jest.fn(),
}));

jest.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: jest.fn(),
}));

jest.mock("@/components/forms/ManagerEditDefectModal", () => () =>
  React.createElement("div", { "data-testid": "DefectEditModal" })
);

jest.mock("@/components/forms/SelectManagerEditDefectModal", () => () =>
  React.createElement("div", { "data-testid": "SelectDefectModal" })
);

const mockPush = jest.fn();
const mockCheckToken = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useToken as jest.Mock).mockReturnValue({ checkToken: mockCheckToken });
  (useRoleGuard as jest.Mock).mockReturnValue({
    loading: false,
    role: "Менеджер",
  });

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            title: "Ошибка в отчёте",
            description: "Не отображаются данные",
            priority: "high",
            status: "new",
            projectId: 1,
          },
        ]),
    })
  ) as any;

  mockCheckToken.mockResolvedValue(true);
});

afterEach(() => {
  jest.resetAllMocks();
});


test("показывает текст 'Загрузка...' во время загрузки данных", async () => {
  (useRoleGuard as jest.Mock).mockReturnValueOnce({
    loading: true,
    role: "Менеджер",
  });

  render(<ManagerDefects />);

  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});


test("рендерит карточку дефекта после загрузки", async () => {
  render(<ManagerDefects />);

  await waitFor(() => {
    expect(screen.getByText("Ошибка в отчёте")).toBeInTheDocument();
  });

  expect(screen.getByText(/Приоритет: Высокий/i)).toBeInTheDocument();
  expect(screen.getByText(/Статус: Новый/i)).toBeInTheDocument();
});


test("фильтрует дефекты по приоритету", async () => {
  render(<ManagerDefects />);

  await waitFor(() =>
    expect(screen.getByText("Ошибка в отчёте")).toBeInTheDocument()
  );

  const prioritySelect = screen.getAllByRole("combobox")[0];
  fireEvent.change(prioritySelect, { target: { value: "low" } });

  await waitFor(() => {
    expect(screen.queryByText("Ошибка в отчёте")).not.toBeInTheDocument();
  });
});
