export type User = {
  username: string;
  email: string;
  _id: string;
  role?: string;
};

export interface UserTokenPayload {
  username: string;
  _id: string;
  role: string;
  email: string;
}

export interface DecodedJwtPayload {
  user: UserTokenPayload;
  exp: number;
  iat: number;
}

export interface Task {
  _id: string;
  taskId: string;
  title: string;
  description: string;
  duedate: string;
  assignedUser: string;
  status: "toDo" | "inProgress" | "completed";
  priority: "low" | "medium" | "high";
}

export interface TaskCardProps {
  task: Task;
}

export type TaskStatus = "toDo" | "inProgress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
