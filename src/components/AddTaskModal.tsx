import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Star, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskCategory, TaskPriority, Project } from '@/types/task';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: Date;
    projectId: string;
  }) => void;
  projects?: Project[];
  activeProjectId?: string | null;
}

const categories: { id: TaskCategory; label: string; icon: string }[] = [
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'urgent', label: 'Urgent', icon: '🚨' },
];

const priorities: { id: TaskPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export function AddTaskModal({ 
  isOpen, 
  onClose, 
  onAdd,
  projects = [],
  activeProjectId,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [projectId, setProjectId] = useState<string>(activeProjectId || projects[0]?.id || '');

  // Update projectId when activeProjectId changes
  useEffect(() => {
    if (activeProjectId) {
      setProjectId(activeProjectId);
    } else if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [activeProjectId, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate,
      projectId,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('work');
    setPriority('medium');
    setDueDate(new Date());
    onClose();
  };

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === projectId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 mb-0 sm:mb-0 animate-slide-in-bottom">
        <div className="bg-card rounded-t-3xl sm:rounded-2xl shadow-xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">New Task</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-xl hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Project Selector */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 bg-secondary/30 hover:bg-background"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      {selectedProject ? (
                        <span className="flex items-center gap-2">
                          <span>{selectedProject.icon}</span>
                          <span>{selectedProject.name}</span>
                        </span>
                      ) : (
                        "Select project"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2 rounded-xl" align="start">
                    <div className="space-y-1">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setProjectId(project.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            projectId === project.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary"
                          )}
                        >
                          <span className="text-lg">{project.icon}</span>
                          <span className="font-medium">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="h-12 rounded-xl border-border/50 bg-secondary/30 focus:bg-background"
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200",
                      category === cat.id
                        ? cat.id === 'work' 
                          ? "bg-work/10 border-work/30 text-work"
                          : cat.id === 'personal'
                            ? "bg-personal/10 border-personal/30 text-personal"
                            : "bg-urgent/10 border-urgent/30 text-urgent"
                        : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 bg-secondary/30 hover:bg-background",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <div className="flex gap-2">
                {priorities.map((pri) => (
                  <button
                    key={pri.id}
                    type="button"
                    onClick={() => setPriority(pri.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200",
                      priority === pri.id
                        ? pri.id === 'high'
                          ? "bg-urgent/10 border-urgent/30 text-urgent"
                          : pri.id === 'medium'
                            ? "bg-personal/10 border-personal/30 text-personal"
                            : "bg-secondary border-border text-foreground"
                        : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {pri.id === 'high' && <Star className="w-4 h-4 fill-current" />}
                    <span className="text-sm font-medium">{pri.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                className="min-h-[100px] rounded-xl border-border/50 bg-secondary/30 focus:bg-background resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border-border/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !projectId}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow disabled:opacity-50"
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
