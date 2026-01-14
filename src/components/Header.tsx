import { Sun, Moon, Plus, Download, Search, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import { Project } from '@/types/task';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  totalTasks: number;
  completionPercentage: number;
  onAddTask: () => void;
  userName?: string;
  // Project props
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
  onSearch?: () => void;
}

export function Header({
  theme,
  toggleTheme,
  totalTasks,
  completionPercentage,
  onAddTask,
  userName = 'Task Tracker',
  projects,
  activeProjectId,
  projectStats,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onSearch,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-xl shadow-glow transition-transform hover:scale-105">
            <img
              src="/favicon.png"
              alt="Task Tracker Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">{userName}</h1>
            <p className="text-xs text-muted-foreground">
              {totalTasks} Tasks • {completionPercentage}% Complete
            </p>
          </div>
        </div>

        {/* Center: Project Switcher */}
        <div className="hidden md:block">
          <ProjectSwitcher
            projects={projects}
            activeProjectId={activeProjectId}
            projectStats={projectStats}
            onSelectProject={onSelectProject}
            onCreateProject={onCreateProject}
            onEditProject={onEditProject}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
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

          {/* Logout Button - Desktop */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-destructive/10"
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}

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
            {user && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full h-12 gap-2 rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
