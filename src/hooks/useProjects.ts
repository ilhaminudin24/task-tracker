import { useState, useMemo, useCallback } from 'react';
import { Project, ProjectColor, Task } from '@/types/task';
import { mockProjects } from '@/data/mockProjects';

export function useProjects(allTasks: Task[] = []) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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

  const addProject = useCallback((projectData: {
    name: string;
    color: ProjectColor;
    icon: string;
    description?: string;
  }) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...projectData,
      createdAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return { ...project, ...updates };
      }
      return project;
    }));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  }, [activeProjectId]);

  return {
    projects,
    activeProjectId,
    activeProject,
    projectStats,
    activeProjectStats,
    setActiveProject,
    addProject,
    updateProject,
    deleteProject,
  };
}
