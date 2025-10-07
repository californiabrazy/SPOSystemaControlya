export type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  author?: { id: number; first_name: string; last_name: string; middle_name: string };
  project?: { id: number; name: string };
};