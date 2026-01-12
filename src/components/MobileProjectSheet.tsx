import { Project, ProjectColor, FilterType } from '@/types/task';
import { X, Plus, Check, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileProjectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  projectStats: Array<{
    project: Project;
    total: number;
    completed: number;
    percentage: number;
  }>;
  categoryFilter: FilterType;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: () => void;
  setCategoryFilter: (filter: FilterType) => void;
}

const colorClasses: Record<ProjectColor, { bg: string }> = {
  emerald: { bg: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-500' },
  amber: { bg: 'bg-amber-500' },
  red: { bg: 'bg-red-500' },
  purple: { bg: 'bg-purple-500' },
  pink: { bg: 'bg-pink-500' },
};

export function MobileProjectSheet({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  projectStats,
  categoryFilter,
  onSelectProject,
  onCreateProject,
  setCategoryFilter,
}: MobileProjectSheetProps) {
  if (!isOpen) return null;

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeStats = projectStats.find(ps => ps.project.id === activeProjectId);

  const categoryOptions: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'urgent', label: 'Urgent', icon: '🚨' },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl border-t border-border/50 animate-slide-in-bottom safe-area-pb">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Active Project Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeProject ? (
                <>
                  <span className="text-2xl">{activeProject.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{activeProject.name}</h3>
                    {activeStats && (
                      <p className="text-sm text-muted-foreground">
                        {activeStats.completed}/{activeStats.total} tasks
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">All Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      {projectStats.reduce((acc, ps) => acc + ps.total, 0)} tasks
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Quick Filters */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Category Filter
            </span>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    categoryFilter === cat.id
                      ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Other Projects */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Switch Project
            </span>
            <div className="space-y-2">
              {/* All Projects Option */}
              <button
                onClick={() => {
                  onSelectProject(null);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  !activeProjectId
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "bg-secondary hover:bg-secondary/80"
                )}
              >
                <FolderOpen className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-left font-medium text-foreground">All Projects</span>
                {!activeProjectId && <Check className="w-4 h-4 text-primary" />}
              </button>

              {projectStats.map(({ project, total, completed }) => {
                const isActive = project.id === activeProjectId;
                const colors = colorClasses[project.color];

                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      onSelectProject(project.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive
                        ? "bg-primary/10 ring-2 ring-primary/20"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                      `bg-${project.color}-500/10`
                    )}>
                      {project.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-foreground">{project.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({completed}/{total})
                      </span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Project */}
          <button
            onClick={() => {
              onCreateProject();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Project</span>
          </button>

          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
