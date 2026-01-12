import { Sun, Moon, Plus, Download, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  totalTasks: number;
  completionPercentage: number;
  onAddTask: () => void;
  userName?: string;
}

export function Header({
  theme,
  toggleTheme,
  totalTasks,
  completionPercentage,
  onAddTask,
  userName = 'Task Tracker'
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 shadow-glow">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">{userName}</h1>
            <p className="text-xs text-muted-foreground">
              {totalTasks} Tasks • {completionPercentage}% Complete
            </p>
          </div>
        </div>

        {/* Center: Stats (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/50">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-foreground">{totalTasks}</span>
            <span className="text-muted-foreground">tasks</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-primary">{completionPercentage}%</span>
            <span className="text-muted-foreground">done</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-secondary"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Export - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-secondary"
          >
            <Download className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Add Task */}
          <Button
            onClick={onAddTask}
            className="hidden sm:flex h-10 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl hover:bg-secondary"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-muted-foreground transition-transform hover:rotate-12" />
            ) : (
              <Sun className="h-5 w-5 text-amber-400 transition-transform hover:rotate-45" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-10 w-10 rounded-xl hover:bg-secondary"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-slide-in-bottom">
          <div className="container px-4 py-4 space-y-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <span className="font-semibold text-foreground">{totalTasks}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50">
              <span className="text-sm text-muted-foreground">Completion</span>
              <span className="font-semibold text-primary">{completionPercentage}%</span>
            </div>
            <Button
              onClick={() => {
                onAddTask();
                setMobileMenuOpen(false);
              }}
              className="w-full h-12 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            >
              <Plus className="h-5 w-5" />
              Add New Task
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
