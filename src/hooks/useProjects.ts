import { useState, useMemo, useCallback, useEffect } from 'react';
import { Project, ProjectColor, Task } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeToProjects,
  addProject as addProjectToFirestore,
  updateProject as updateProjectInFirestore,
  deleteProject as deleteProjectFromFirestore,
  CreateProjectData,
} from '@/services/firebaseProjects';

export function useProjects(allTasks: Task[] = []) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to Firestore projects
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToProjects(
      user.uid,
      (fetchedProjects) => {
        setProjects(fetchedProjects);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const total = projectTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      const workTasks = projectTasks.filter(t => t.category === 'work');
      const personalTasks = projectTasks.filter(t => t.category === 'personal');
      const urgentTasks = projectTasks.filter(t => t.category === 'urgent');

      return {
        project,
        total,
        completed,
        percentage,
        work: { total: workTasks.length, completed: workTasks.filter(t => t.status === 'completed').length },
        personal: { total: personalTasks.length, completed: personalTasks.filter(t => t.status === 'completed').length },
        urgent: { total: urgentTasks.length, completed: urgentTasks.filter(t => t.status === 'completed').length },
      };
    });
  }, [projects, allTasks]);

  const activeProjectStats = useMemo(() => {
    if (!activeProjectId) return null;
    return projectStats.find(ps => ps.project.id === activeProjectId) || null;
  }, [projectStats, activeProjectId]);

  const setActiveProject = useCallback((projectId: string | null) => {
    setActiveProjectId(projectId);
  }, []);

  const addProject = useCallback(async (projectData: CreateProjectData) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempProject: Project = {
      id: tempId,
      ...projectData,
      createdAt: new Date(),
    };
    setProjects(prev => [tempProject, ...prev]);

    try {
      const newId = await addProjectToFirestore(user.uid, projectData);
      // Real ID will be set by onSnapshot listener
      return { ...tempProject, id: newId };
    } catch (error) {
      // Rollback on error
      setProjects(prev => prev.filter(p => p.id !== tempId));
      throw error;
    }
  }, [user]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, ...updates };
      }
      return project;
    }));

    try {
      await updateProjectInFirestore(user.uid, projectId, updates);
    } catch (error) {
      // Refresh on error (onSnapshot will restore correct state)
      console.error('Failed to update project:', error);
      throw error;
    }
  }, [user]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Optimistic update
    const deletedProject = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }

    try {
      await deleteProjectFromFirestore(user.uid, projectId);
    } catch (error) {
      // Rollback on error
      if (deletedProject) {
        setProjects(prev => [...prev, deletedProject]);
      }
      throw error;
    }
  }, [user, projects, activeProjectId]);

  return {
    projects,
    activeProjectId,
    activeProject,
    projectStats,
    activeProjectStats,
    loading,
    error,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
  };
}
