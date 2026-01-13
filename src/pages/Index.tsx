import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsSidebar } from '@/components/StatsSidebar';
import { FilterTabs } from '@/components/FilterTabs';
import { TaskList } from '@/components/TaskList';
import { CalendarWidget } from '@/components/CalendarWidget';
import { AddTaskModal } from '@/components/AddTaskModal';
import { MobileNav } from '@/components/MobileNav';
import { MobileProjectSheet } from '@/components/MobileProjectSheet';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Plus } from 'lucide-react';

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Initialize state for project selection
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const {
    tasks,
    allTasks,
    stats,
    completionPercentage,
    categoryFilter,
    statusFilter,
    setCategoryFilter,
    setStatusFilter,
    toggleTaskStatus,
    addTask,
    deleteTask,
    moveTaskToProject,
  } = useTasks(activeProjectId);

  const {
    projects,
    activeProject,
    projectStats,
    addProject,
  } = useProjects(allTasks);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const handleSelectProject = (projectId: string | null) => {
    setActiveProjectId(projectId);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        totalTasks={stats.total}
        completionPercentage={completionPercentage}
        onAddTask={() => setIsAddModalOpen(true)}
        userName="Task Tracker"
        projects={projects}
        activeProjectId={activeProjectId}
        projectStats={projectStats}
        onSelectProject={handleSelectProject}
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Stats Sidebar - Desktop */}
        <StatsSidebar
          stats={stats}
          completionPercentage={completionPercentage}
          onAddTask={() => setIsAddModalOpen(true)}
          activeProject={activeProject}
          projectStats={projectStats}
          onSwitchProject={() => setIsProjectSheetOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section - Mobile */}
            <div className="lg:hidden mb-6 p-6 rounded-2xl glass-card">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <svg width="80" height="80" className="transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-secondary"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="url(#mobileProgressGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={220}
                      strokeDashoffset={220 - (completionPercentage / 100) * 220}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="mobileProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(160 84% 50%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{completionPercentage}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Today's Progress</h2>
                  <p className="text-sm text-muted-foreground">
                    {stats.today.completed} of {stats.today.total} tasks complete
                  </p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-work font-medium">💼 {stats.work.total} Work</span>
                    <span className="text-xs text-personal font-medium">👤 {stats.personal.total} Personal</span>
                    <span className="text-xs text-urgent font-medium">🚨 {stats.urgent.total} Urgent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <FilterTabs
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              setCategoryFilter={setCategoryFilter}
              setStatusFilter={setStatusFilter}
              stats={stats}
              activeProject={activeProject}
            />

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="xl:col-span-2">
                <TaskList
                  tasks={tasks}
                  onToggle={toggleTaskStatus}
                  onDelete={deleteTask}
                  projects={projects}
                  onMoveToProject={moveTaskToProject}
                />
              </div>

              {/* Calendar Widget - Desktop */}
              <div className="hidden xl:block">
                <div className="sticky top-24">
                  <CalendarWidget tasks={allTasks} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button - Mobile */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fab md:hidden"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        onAddTask={() => setIsAddModalOpen(true)} 
        onOpenProjects={() => setIsProjectSheetOpen(true)}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addTask}
        projects={projects}
        activeProjectId={activeProjectId}
      />

      {/* Mobile Project Sheet */}
      <MobileProjectSheet
        isOpen={isProjectSheetOpen}
        onClose={() => setIsProjectSheetOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        projectStats={projectStats}
        onSelectProject={(id) => {
          handleSelectProject(id);
          setIsProjectSheetOpen(false);
        }}
        onCreateProject={() => {
          setIsProjectSheetOpen(false);
          setIsCreateProjectOpen(true);
        }}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={addProject}
      />
    </div>
  );
};

export default Index;
