import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsSidebar } from '@/components/StatsSidebar';
import { FilterTabs } from '@/components/FilterTabs';
import { TaskList } from '@/components/TaskList';
import { CalendarWidget } from '@/components/CalendarWidget';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { MobileNav } from '@/components/MobileNav';
import { MobileProjectSheet } from '@/components/MobileProjectSheet';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { MigrationModal } from '@/components/MigrationModal';
import { SearchModal } from '@/components/SearchModal';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/hooks/useTasks';
import { useKanban } from '@/hooks/useKanban';
import { updateTaskStatus } from '@/services/firebaseKanban';
import { useProjects } from '@/hooks/useProjects';
import { Task, Project } from '@/types/task';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    updateTask,
    moveTaskToProject,
  } = useTasks(activeProjectId);

  const {
    projects,
    activeProject,
    projectStats,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects(allTasks);

  const {
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
  } = useKanban();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditProjectModalOpen(true);
  };

  const handleSaveProject = async (projectId: string, updates: Partial<Project>) => {
    await updateProject(projectId, updates);
    setIsEditProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
    setIsEditProjectModalOpen(false);
    setEditingProject(null);
  };

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
        onEditProject={handleEditProject}
        onSearch={() => setIsSearchOpen(true)}
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
          <div className={cn(
            "mx-auto transition-all duration-300",
            viewMode === 'list' ? "max-w-4xl" : "max-w-full"
          )}>
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
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Content Grid */}
            <div className={cn(
              "grid gap-6 transition-all duration-300",
              viewMode === 'list' ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {viewMode === 'list' ? (
                <>
                  {/* Task List */}
                  <div className="xl:col-span-2">
                    <TaskList
                      tasks={tasks}
                      onToggle={toggleTaskStatus}
                      onDelete={deleteTask}
                      onEdit={handleEditTask}
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
                </>
              ) : (
                <div className="h-[calc(100vh-16rem)] overflow-hidden">
                  <KanbanBoard
                    tasks={tasks}
                    projects={projects}
                    columns={columns}
                    onAddColumn={addColumn}
                    onUpdateColumn={updateColumn}
                    onDeleteColumn={deleteColumn}
                    onMoveColumn={moveColumn}
                    onToggleTask={toggleTaskStatus}
                    onDeleteTask={deleteTask}
                    onEditTask={handleEditTask}
                    onMoveTaskToProject={moveTaskToProject}
                    onTaskDragEnd={async (activeId, overId, activeColumnId, overColumnId) => {
                      // If status changed
                      if (activeColumnId !== overColumnId) {
                        // Optimistic / Fire & Forget (handled by sub-component or hook usually, but here we invoke service directly or via hook)
                        if (activeProjectId) {
                          // If we are in project view, we just update status
                          // The user might be reordering in the same column? 
                          // Board supports drag between columns, so status update is implied.
                        }
                        // We can use updateTask from useTasks, or updateTaskStatus from firebaseKanban
                        // using useTasks generic update
                        await updateTask(activeId, {
                          status: overColumnId,
                          completedAt: (overColumnId === 'done' || overColumnId === 'completed') ? new Date() : null
                        });
                      }
                    }}
                  />
                </div>
              )}
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
      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        task={editingTask}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        projects={projects}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={addProject}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={editingProject}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      {/* Migration Modal - shows on first login with localStorage data */}
      <MigrationModal />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={allTasks}
        onSelectTask={handleEditTask}
      />
    </div>
  );
};

export default Index;
