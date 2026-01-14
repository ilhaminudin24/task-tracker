import { useState, useMemo, useCallback, useEffect } from 'react';
import { Task, FilterType, StatusFilter, TaskCategory, TaskPriority } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeToTasks,
  addTask as addTaskToFirestore,
  updateTask as updateTaskInFirestore,
  deleteTask as deleteTaskFromFirestore,
  toggleTaskStatus as toggleTaskStatusInFirestore,
  moveTaskToProject as moveTaskToProjectInFirestore,
  CreateTaskData,
} from '@/services/firebaseTasks';

export function useTasks(activeProjectId: string | null = null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to Firestore tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Subscribe to ALL tasks (not filtered by project) so we can compute stats
    const unsubscribe = subscribeToTasks(
      user.uid,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
        setError(null);
      },
      null, // No project filter - get all tasks
      (err) => {
        console.error('Error fetching tasks:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

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

  // Tasks filtered by active project
  const projectTasks = useMemo(() => {
    if (!activeProjectId) return tasks;
    return tasks.filter(task => task.projectId === activeProjectId);
  }, [tasks, activeProjectId]);

  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
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
  }, [projectTasks, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const tasksForStats = projectTasks;
    const work = tasksForStats.filter(t => t.category === 'work');
    const personal = tasksForStats.filter(t => t.category === 'personal');
    const urgent = tasksForStats.filter(t => t.category === 'urgent');
    const today = tasksForStats.filter(t => isToday(new Date(t.dueDate)));

    return {
      total: tasksForStats.length,
      completed: tasksForStats.filter(t => t.status === 'completed').length,
      work: { total: work.length, completed: work.filter(t => t.status === 'completed').length },
      personal: { total: personal.length, completed: personal.filter(t => t.status === 'completed').length },
      urgent: { total: urgent.length, completed: urgent.filter(t => t.status === 'completed').length },
      today: { total: today.length, completed: today.filter(t => t.status === 'completed').length },
      overdue: tasksForStats.filter(t => isOverdue(new Date(t.dueDate), t.status)).length,
    };
  }, [projectTasks]);

  const completionPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const toggleTaskStatus = useCallback(async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'active' ? 'completed' : 'active',
          completedAt: t.status === 'active' ? new Date() : undefined,
        };
      }
      return t;
    }));

    try {
      await toggleTaskStatusInFirestore(user.uid, taskId, task.status);
    } catch (error) {
      // Rollback handled by onSnapshot
      console.error('Failed to toggle task status:', error);
      throw error;
    }
  }, [user, tasks]);

  const addTask = useCallback(async (taskData: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: Date;
    projectId: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      ...taskData,
      status: 'active',
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);

    try {
      await addTaskToFirestore(user.uid, taskData as CreateTaskData);
      // Real data will be set by onSnapshot listener
    } catch (error) {
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw error;
    }
  }, [user]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    const deletedTask = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await deleteTaskFromFirestore(user.uid, taskId);
    } catch (error) {
      // Rollback on error
      if (deletedTask) {
        setTasks(prev => [...prev, deletedTask]);
      }
      throw error;
    }
  }, [user, tasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, ...updates };
      }
      return t;
    }));

    try {
      await updateTaskInFirestore(user.uid, taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, [user]);

  const moveTaskToProject = useCallback(async (taskId: string, projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, projectId };
      }
      return t;
    }));

    try {
      await moveTaskToProjectInFirestore(user.uid, taskId, projectId);
    } catch (error) {
      console.error('Failed to move task:', error);
      throw error;
    }
  }, [user]);

  const clearFilters = useCallback(() => {
    setCategoryFilter('all');
    setStatusFilter('all');
  }, []);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    projectTasks,
    stats,
    completionPercentage,
    categoryFilter,
    statusFilter,
    loading,
    error,
    setCategoryFilter,
    setStatusFilter,
    toggleTaskStatus,
    addTask,
    deleteTask,
    updateTask,
    moveTaskToProject,
    clearFilters,
  };
}
