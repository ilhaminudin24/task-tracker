import { Rocket, ClipboardList, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 'no-projects' | 'no-tasks' | 'no-matching';

interface EmptyStateProps {
  type: EmptyStateType;
  projectName?: string;
  onAction?: () => void;
  onClearFilters?: () => void;
}

const emptyStates = {
  'no-projects': {
    icon: Rocket,
    emoji: '🚀',
    title: 'Create your first project',
    description: 'Start organizing your tasks by creating a project!',
    actionLabel: 'Create Project',
    gradient: 'from-primary/20 to-emerald-500/20',
  },
  'no-tasks': {
    icon: ClipboardList,
    emoji: '📝',
    title: 'All done!',
    description: 'No tasks here. Add a new task or switch projects.',
    actionLabel: 'Add Task',
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  'no-matching': {
    icon: Filter,
    emoji: '❌',
    title: 'No matching tasks',
    description: 'Try adjusting your filters to see more tasks.',
    actionLabel: 'Clear Filters',
    gradient: 'from-amber-500/20 to-red-500/20',
  },
};

export function EmptyState({ type, projectName, onAction, onClearFilters }: EmptyStateProps) {
  const config = emptyStates[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {/* Animated Icon */}
      <div className={cn(
        "relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6",
        "bg-gradient-to-br",
        config.gradient
      )}>
        <span className="text-5xl animate-bounce-subtle">{config.emoji}</span>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {config.title}
        {projectName && type === 'no-tasks' && (
          <span className="text-primary"> in {projectName}</span>
        )}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {config.description}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {type === 'no-matching' && onClearFilters ? (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="rounded-xl"
          >
            Clear Filters
          </Button>
        ) : onAction ? (
          <Button
            onClick={onAction}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            {config.actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
