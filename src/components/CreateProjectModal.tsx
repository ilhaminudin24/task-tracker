import { useState } from 'react';
import { ProjectColor } from '@/types/task';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: {
    name: string;
    color: ProjectColor;
    icon: string;
    description?: string;
  }) => void;
}

const colorOptions: { value: ProjectColor; label: string; class: string }[] = [
  { value: 'emerald', label: 'Green', class: 'bg-emerald-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

const iconOptions = ['🎯', '💻', '📱', '🎨', '📚', '🚀', '💼', '🏠', '🎮', '🎵', '📊', '✨'];

export function CreateProjectModal({ isOpen, onClose, onCreateProject }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ProjectColor>('emerald');
  const [icon, setIcon] = useState('🎯');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      color,
      icon,
      description: description.trim() || undefined,
    });

    // Reset form
    setName('');
    setColor('emerald');
    setIcon('🎯');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border/50 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Create New Project
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Client B"
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Color <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    "w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center",
                    option.class,
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                      : "opacity-70 hover:opacity-100 hover:scale-105"
                  )}
                >
                  {color === option.value && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl transition-all duration-200 flex items-center justify-center",
                    "bg-secondary hover:bg-secondary/80",
                    icon === emoji
                      ? "ring-2 ring-primary scale-110 bg-primary/10"
                      : "hover:scale-105"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Landing page redesign..."
              className="resize-none rounded-xl"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
