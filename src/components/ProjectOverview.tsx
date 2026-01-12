import { Project, ProjectColor } from '@/types/task';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectOverviewProps {
  projectStats: Array<{
    project: Project;
    total: number;
    completed: number;
    percentage: number;
    work: { total: number; completed: number };
    personal: { total: number; completed: number };
    urgent: { total: number; completed: number };
  }>;
  onSelectProject: (projectId: string) => void;
}

const colorClasses: Record<ProjectColor, { bg: string; bgLight: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', border: 'border-blue-500/30' },
  amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-500/30' },
  red: { bg: 'bg-red-500', bgLight: 'bg-red-500/10', border: 'border-red-500/30' },
  purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-500/10', border: 'border-purple-500/30' },
  pink: { bg: 'bg-pink-500', bgLight: 'bg-pink-500/10', border: 'border-pink-500/30' },
};

export function ProjectOverview({ projectStats, onSelectProject }: ProjectOverviewProps) {
  if (projectStats.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects yet. Create your first project!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projectStats.map(({ project, total, completed, percentage, work, personal, urgent }, index) => {
        const colors = colorClasses[project.color];

        return (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={cn(
              "group relative p-5 rounded-2xl text-left transition-all duration-300",
              "bg-card border border-border/50",
              "hover:shadow-lg hover:scale-[1.02] hover:border-transparent",
              colors.border
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                colors.bgLight
              )}>
                {project.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {completed}/{total} tasks • {percentage}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 rounded-full bg-secondary mb-4 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", colors.bg)}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Category Breakdown */}
            <div className="flex items-center gap-3 text-xs">
              {work.total > 0 && (
                <span className="flex items-center gap-1 text-work">
                  <span>💼</span> {work.total}
                </span>
              )}
              {personal.total > 0 && (
                <span className="flex items-center gap-1 text-personal">
                  <span>👤</span> {personal.total}
                </span>
              )}
              {urgent.total > 0 && (
                <span className="flex items-center gap-1 text-urgent">
                  <span>🚨</span> {urgent.total}
                </span>
              )}
            </div>

            {/* View Arrow */}
            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
