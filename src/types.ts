export type Project = {
  project_id: string;
  title: string;
};

export type Status = "TODO" | "DOING" | "DONE";
export type Task = {
  task_id: string;
  project: string;
  title: string;
  description?: string;
  date: number;
  status: Status;
};
