// Project Types
export type ProjectColor = 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'pink';

export interface Project {
  id: string;
  name: string;
  color: ProjectColor;
  icon: string;
  description?: string;
  createdAt: Date;
}

// Task Types
export type TaskCategory = 'work' | 'personal' | 'urgent';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = string;

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  projectId: string;
}

export type FilterType = 'all' | 'work' | 'personal' | 'urgent';
export type StatusFilter = 'all' | 'active' | 'completed' | 'today' | 'overdue';
