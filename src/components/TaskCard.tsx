import { useState } from 'react';
import { Task, Project, ProjectColor } from '@/types/task';
import { Check, Pencil, Trash2, Star, ChevronDown, ChevronUp, GripVertical, Calendar, Clock, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onMoveToProject?: (taskId: string, projectId: string) => void;
  projects?: Project[];
  index: number;
}

const categoryConfig = {
  work: {
    label: 'Work',
    bgClass: 'bg-work/10',
    textClass: 'text-work',
    borderClass: 'border-work/30',
    icon: '💼'
  },
  personal: {
    label: 'Personal',
    bgClass: 'bg-personal/10',
    textClass: 'text-personal',
    borderClass: 'border-personal/30',
    icon: '👤'
  },
  urgent: {
    label: 'Urgent',
    bgClass: 'bg-urgent/10',
    textClass: 'text-urgent',
    borderClass: 'border-urgent/30',
    icon: '🚨'
  },
};

const priorityConfig = {
  low: { label: 'Low', class: 'text-muted-foreground' },
  medium: { label: 'Medium', class: 'text-personal' },
  high: { label: 'High', class: 'text-urgent' },
};

const projectColorClasses: Record<ProjectColor, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/30' },
};

export function TaskCard({ task, project, onToggle, onDelete, onEdit, onMoveToProject, projects, index }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const category = categoryConfig[task.category];
  const priority = priorityConfig[task.priority];
  const isCompleted = task.status === 'completed' || task.status === 'done';
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !isCompleted;

  const handleToggle = () => {
    if (!isCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 600);
    }
    onToggle(task.id);
  };

  const formatDueDate = () => {
    if (isToday(dueDate)) return 'Today';
    return format(dueDate, 'MMM d');
  };

  const projectColors = project ? projectColorClasses[project.color] : null;

  return (
    <div
      className={cn(
        "group relative p-4 rounded-2xl border transition-all duration-300",
        "bg-card hover:bg-card/80",
        isCompleted ? "opacity-60" : "",
        isHovered ? "shadow-lg scale-[1.01]" : "shadow-sm",
        isOverdue && !isCompleted ? "border-urgent/50 bg-urgent/5" : "border-border/50"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMoveMenu(false); }}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-confetti" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pt-1">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        </div>

        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300",
            "flex items-center justify-center",
            isCompleted
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary hover:scale-110"
          )}
        >
          {isCompleted && (
            <Check className="w-3.5 h-3.5 text-primary-foreground animate-scale-in" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              "font-medium text-foreground transition-all duration-300",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>

            {/* Priority Star */}
            {task.priority === 'high' && (
              <Star className="w-4 h-4 text-personal fill-personal flex-shrink-0" />
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Project Badge - Largest, first */}
            {project && projectColors && (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                projectColors.bg, projectColors.text, projectColors.border
              )}>
                <span>{project.icon}</span>
                {project.name}
              </span>
            )}

            {/* Category Badge */}
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
              category.bgClass, category.textClass, category.borderClass
            )}>
              <span>{category.icon}</span>
              {category.label}
            </span>

            {/* Due Date */}
            <span className={cn(
              "inline-flex items-center gap-1 text-xs",
              isOverdue ? "text-urgent font-medium" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              {formatDueDate()}
              {isOverdue && <span className="ml-1">(Overdue)</span>}
            </span>

            {/* Time Ago */}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mt-2">
              <p className={cn(
                "text-sm text-muted-foreground",
                !expanded && "line-clamp-1"
              )}>
                {task.description}
              </p>
              {task.description.length > 60 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
                >
                  {expanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={cn(
        "absolute right-4 top-4 flex items-center gap-1 transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(task)}
          className="h-8 w-8 rounded-lg hover:bg-secondary"
        >
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </Button>

        {/* Move to Project */}
        {onMoveToProject && projects && projects.length > 1 && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="h-8 w-8 rounded-lg hover:bg-secondary"
            >
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </Button>

            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 p-2 rounded-xl bg-popover border border-border shadow-xl z-50 animate-scale-in">
                <p className="px-2 py-1 text-xs text-muted-foreground font-medium">Move to:</p>
                {projects.filter(p => p.id !== task.projectId).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onMoveToProject(task.id, p.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
