import { ProgressRing } from './ProgressRing';
import { Briefcase, User, AlertCircle, Calendar, Plus, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatsProps {
  stats: {
    total: number;
    completed: number;
    work: { total: number; completed: number };
    personal: { total: number; completed: number };
    urgent: { total: number; completed: number };
    today: { total: number; completed: number };
    overdue: number;
  };
  completionPercentage: number;
  onAddTask: () => void;
}

function StatBar({ label, completed, total, colorClass }: { 
  label: string; 
  completed: number; 
  total: number; 
  colorClass: string;
}) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{completed}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function StatsSidebar({ stats, completionPercentage, onAddTask }: StatsProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 p-6 space-y-6 border-r border-border/50 bg-card/50">
      {/* Progress Ring */}
      <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
        <ProgressRing percentage={completionPercentage} size={140} strokeWidth={10} />
        <p className="mt-4 text-sm text-muted-foreground">Today's Progress</p>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.today.completed} of {stats.today.total} tasks done
        </p>
      </div>

      {/* Category Stats */}
      <div className="space-y-4 p-5 rounded-2xl glass-card">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          By Category
        </h3>
        
        <StatBar 
          label="Work" 
          completed={stats.work.completed} 
          total={stats.work.total}
          colorClass="bg-work"
        />
        <StatBar 
          label="Personal" 
          completed={stats.personal.completed} 
          total={stats.personal.total}
          colorClass="bg-personal"
        />
        <StatBar 
          label="Urgent" 
          completed={stats.urgent.completed} 
          total={stats.urgent.total}
          colorClass="bg-urgent"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-secondary/50 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-primary/10">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.today.total}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/50 text-center">
          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-urgent/10">
            <AlertCircle className="w-4 h-4 text-urgent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h3>
        <Button
          onClick={onAddTask}
          className="w-full h-11 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
        <Button
          variant="outline"
          className="w-full h-11 gap-2 rounded-xl border-border/50 hover:bg-secondary"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="ghost"
          className="w-full h-11 gap-2 rounded-xl hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Now
        </Button>
      </div>
    </aside>
  );
}
