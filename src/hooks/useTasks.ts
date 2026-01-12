import { useState, useMemo, useCallback } from 'react';
import { Task, FilterType, StatusFilter, TaskCategory, TaskPriority } from '@/types/task';
import { mockTasks } from '@/data/mockTasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (date: Date, status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && status === 'active';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Category filter
      if (categoryFilter !== 'all' && task.category !== categoryFilter) {
        return false;
      }

      // Status filter
      switch (statusFilter) {
        case 'active':
          return task.status === 'active';
        case 'completed':
          return task.status === 'completed';
        case 'today':
          return isToday(new Date(task.dueDate));
        case 'overdue':
          return isOverdue(new Date(task.dueDate), task.status);
        default:
          return true;
      }
    });
  }, [tasks, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const work = tasks.filter(t => t.category === 'work');
    const personal = tasks.filter(t => t.category === 'personal');
    const urgent = tasks.filter(t => t.category === 'urgent');
    const today = tasks.filter(t => isToday(new Date(t.dueDate)));
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      work: { total: work.length, completed: work.filter(t => t.status === 'completed').length },
      personal: { total: personal.length, completed: personal.filter(t => t.status === 'completed').length },
      urgent: { total: urgent.length, completed: urgent.filter(t => t.status === 'completed').length },
      today: { total: today.length, completed: today.filter(t => t.status === 'completed').length },
      overdue: tasks.filter(t => isOverdue(new Date(t.dueDate), t.status)).length,
    };
  }, [tasks]);

  const completionPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'active' ? 'completed' : 'active',
          completedAt: task.status === 'active' ? new Date() : undefined,
        };
      }
      return task;
    }));
  }, []);

  const addTask = useCallback((taskData: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: Date;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: 'active',
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      return task;
    }));
  }, []);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    stats,
    completionPercentage,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    toggleTaskStatus,
    addTask,
    deleteTask,
    updateTask,
  };
}
