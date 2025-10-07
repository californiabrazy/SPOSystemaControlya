export type ObjectItem = {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  manager: { id: number; first_name: string; last_name: string; middle_name: string };
};