import { Task, Project } from '@/types/task';
import { TaskCard } from './TaskCard';
import { ClipboardList } from 'lucide-react';
import { mockProjects } from '@/data/mockProjects';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  projects?: Project[];
  onMoveToProject?: (taskId: string, projectId: string) => void;
}

export function TaskList({ 
  tasks, 
  onToggle, 
  onDelete, 
  onEdit,
  projects = mockProjects,
  onMoveToProject,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          No tasks match your current filters. Try adjusting your filters or add a new task.
        </p>
      </div>
    );
  }

  // Helper to find project for a task
  const getTaskProject = (task: Task): Project | undefined => {
    return projects.find(p => p.id === task.projectId);
  };

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          project={getTaskProject(task)}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          index={index}
          projects={projects}
          onMoveToProject={onMoveToProject}
        />
      ))}
    </div>
  );
}
