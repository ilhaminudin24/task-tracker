import { useState, useRef, useEffect } from 'react';
import { Project, ProjectColor } from '@/types/task';
import { ChevronDown, Plus, Check, FolderOpen, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId: string | null;
  projectStats: Array<{
    project: Project;
    total: number;
    completed: number;
    percentage: number;
  }>;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: () => void;
  onEditProject?: (project: Project) => void;
}

const colorClasses: Record<ProjectColor, { bg: string; ring: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-500', ring: 'ring-blue-500/30', text: 'text-blue-500' },
  amber: { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-500' },
  red: { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-500' },
  purple: { bg: 'bg-purple-500', ring: 'ring-purple-500/30', text: 'text-purple-500' },
  pink: { bg: 'bg-pink-500', ring: 'ring-pink-500/30', text: 'text-pink-500' },
};

export function ProjectSwitcher({
  projects,
  activeProjectId,
  projectStats,
  onSelectProject,
  onCreateProject,
  onEditProject,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeStats = projectStats.find(ps => ps.project.id === activeProjectId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
          "bg-secondary/50 hover:bg-secondary border border-border/50",
          isOpen && "ring-2 ring-primary/20"
        )}
      >
        {activeProject ? (
          <>
            <span className="text-lg">{activeProject.icon}</span>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-foreground">{activeProject.name}</span>
              {activeStats && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({activeStats.completed}/{activeStats.total})
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline text-sm text-muted-foreground">All Projects</span>
          </>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-popover border border-border shadow-xl z-50 animate-scale-in">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Projects
          </div>

          {/* All Projects Option */}
          <button
            onClick={() => {
              onSelectProject(null);
              setIsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              !activeProjectId
                ? "bg-gradient-to-r from-primary/10 to-primary/5 ring-2 ring-primary/20"
                : "hover:bg-secondary hover:translate-x-1"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-foreground">All Projects</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({projectStats.reduce((acc, ps) => acc + ps.total, 0)} tasks)
              </span>
            </div>
            {!activeProjectId && <Check className="w-4 h-4 text-primary" />}
          </button>

          <div className="h-px bg-border my-2" />

          {/* Project List */}
          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
            {projectStats.map(({ project, total, completed, percentage }) => {
              const colors = colorClasses[project.color];
              const isActive = project.id === activeProjectId;

              return (
                <button
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-r from-${project.color}-500/10 to-transparent ring-2 ${colors.ring} scale-[1.02]`
                      : "hover:bg-secondary hover:translate-x-1"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                    `bg-${project.color}-500/10`
                  )}>
                    {project.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground">({completed}/{total})</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-secondary mt-1 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", colors.bg)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  {onEditProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                        setIsOpen(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit project"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-px bg-border my-2" />

          {/* Create New Project */}
          <button
            onClick={() => {
              onCreateProject();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all duration-200 animate-pulse-slow"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">New Project...</span>
          </button>
        </div>
      )}
    </div>
  );
}
