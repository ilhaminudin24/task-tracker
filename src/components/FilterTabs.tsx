import { FilterType, StatusFilter, Project } from '@/types/task';
import { Briefcase, User, AlertCircle, LayoutGrid, CheckCircle, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterTabsProps {
  categoryFilter: FilterType;
  statusFilter: StatusFilter;
  setCategoryFilter: (filter: FilterType) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  stats: {
    work: { total: number; completed: number };
    personal: { total: number; completed: number };
    urgent: { total: number; completed: number };
    total: number;
    completed: number;
    overdue: number;
  };
  activeProject?: Project | null;
}

export function FilterTabs({
  categoryFilter,
  statusFilter,
  setCategoryFilter,
  setStatusFilter,
  stats,
  activeProject,
}: FilterTabsProps) {
  const categoryTabs = [
    { id: 'all' as FilterType, label: 'All', icon: LayoutGrid, count: stats.total },
    { id: 'work' as FilterType, label: 'Work', icon: Briefcase, count: stats.work.total, colorClass: 'text-work', activeColor: 'bg-work/10 text-work ring-work/20' },
    { id: 'personal' as FilterType, label: 'Personal', icon: User, count: stats.personal.total, colorClass: 'text-personal', activeColor: 'bg-personal/10 text-personal ring-personal/20' },
    { id: 'urgent' as FilterType, label: 'Urgent', icon: AlertCircle, count: stats.urgent.total, colorClass: 'text-urgent', activeColor: 'bg-urgent/10 text-urgent ring-urgent/20' },
  ];

  const statusTabs = [
    { id: 'all' as StatusFilter, label: 'All' },
    { id: 'active' as StatusFilter, label: 'Active', icon: Clock },
    { id: 'completed' as StatusFilter, label: 'Done', icon: CheckCircle },
    { id: 'today' as StatusFilter, label: 'Today', icon: Calendar },
    { id: 'overdue' as StatusFilter, label: 'Overdue', icon: AlertTriangle, count: stats.overdue },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Active Project Badge */}
      {activeProject && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{activeProject.icon}</span>
          <span className="text-sm font-semibold text-foreground">{activeProject.name}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{stats.total} tasks</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = categoryFilter === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? tab.activeColor || "bg-primary/10 text-primary ring-2 ring-primary/20 scale-105"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "" : tab.colorClass)} />
              <span>{tab.label}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                isActive ? "bg-white/20" : "bg-secondary text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground font-medium mr-2">Filter:</span>
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold",
                  isActive ? "bg-background/20" : "bg-urgent/20 text-urgent"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
