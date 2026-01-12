import { useState } from 'react';
import { Task } from '@/types/task';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  isToday,
  addWeeks,
  subWeeks
} from 'date-fns';

interface CalendarWidgetProps {
  tasks: Task[];
  onSelectDate?: (date: Date) => void;
}

export function CalendarWidget({ tasks, onSelectDate }: CalendarWidgetProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
  };

  const getTaskIndicator = (tasksForDay: Task[]) => {
    if (tasksForDay.length === 0) return null;
    
    const hasUrgent = tasksForDay.some(t => t.category === 'urgent' && t.status === 'active');
    const hasWork = tasksForDay.some(t => t.category === 'work');
    const hasPersonal = tasksForDay.some(t => t.category === 'personal');

    if (hasUrgent) return 'urgent';
    if (tasksForDay.length > 1) return 'multiple';
    if (hasWork) return 'work';
    if (hasPersonal) return 'personal';
    return 'default';
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="p-5 rounded-2xl glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Week of {format(weekStart, 'MMM d')}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="h-7 w-7 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="h-7 px-2 rounded-lg text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="h-7 w-7 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div key={`header-${day.toISOString()}`} className="text-center">
            <span className="text-[10px] font-medium text-muted-foreground uppercase">
              {format(day, 'EEE')}
            </span>
          </div>
        ))}

        {/* Day Cells */}
        {weekDays.map((day) => {
          const tasksForDay = getTasksForDate(day);
          const indicator = getTaskIndicator(tasksForDay);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : isTodayDate
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary text-foreground"
              )}
            >
              <span className={cn(
                "text-sm font-medium",
                isSelected && "font-bold"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Task Indicator */}
              {indicator && (
                <div className="flex items-center gap-0.5 mt-1">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    indicator === 'urgent' && "bg-urgent",
                    indicator === 'work' && "bg-work",
                    indicator === 'personal' && "bg-personal",
                    indicator === 'multiple' && "bg-primary",
                    indicator === 'default' && "bg-muted-foreground",
                    isSelected && "bg-primary-foreground"
                  )} />
                  {tasksForDay.length > 1 && (
                    <span className={cn(
                      "text-[9px] font-bold",
                      isSelected ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {tasksForDay.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-urgent" />
          <span className="text-[10px] text-muted-foreground">Urgent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-work" />
          <span className="text-[10px] text-muted-foreground">Work</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-personal" />
          <span className="text-[10px] text-muted-foreground">Personal</span>
        </div>
      </div>
    </div>
  );
}
