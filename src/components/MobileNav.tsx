import { Home, BarChart2, Plus, Search, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onAddTask: () => void;
  onOpenProjects: () => void;
  activeView?: 'home' | 'stats' | 'projects' | 'search';
}

export function MobileNav({ onAddTask, onOpenProjects, activeView = 'home' }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 px-6 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          <NavItem icon={Home} label="Home" isActive={activeView === 'home'} />
          <NavItem icon={BarChart2} label="Stats" isActive={activeView === 'stats'} />
          
          {/* Floating Add Button */}
          <button
            onClick={onAddTask}
            className="flex items-center justify-center w-14 h-14 -mt-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>

          <NavItem 
            icon={FolderOpen} 
            label="Projects" 
            isActive={activeView === 'projects'}
            onClick={onOpenProjects}
          />
          <NavItem icon={Search} label="Search" isActive={activeView === 'search'} />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ 
  icon: Icon, 
  label, 
  isActive = false,
  onClick,
}: { 
  icon: React.ElementType; 
  label: string; 
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}
