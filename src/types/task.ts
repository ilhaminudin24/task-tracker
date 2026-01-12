export type TaskCategory = 'work' | 'personal' | 'urgent';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed';

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
}

export type FilterType = 'all' | 'work' | 'personal' | 'urgent';
export type StatusFilter = 'all' | 'active' | 'completed' | 'today' | 'overdue';
