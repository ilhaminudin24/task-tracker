import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task, Project } from '@/types/task';
import { SortableTaskCard } from './SortableTaskCard';
import { MoreHorizontal, Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    projects: Project[];
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onEditTask: (task: Task) => void;
    onMoveTaskToProject: (taskId: string, projectId: string) => void;
    onDeleteColumn: (id: string) => void;
    onUpdateColumn: (id: string, updates: Partial<Column>) => void;
}

export function KanbanColumn({
    column,
    tasks,
    projects,
    onToggleTask,
    onDeleteTask,
    onEditTask,
    onMoveTaskToProject,
    onDeleteColumn,
    onUpdateColumn,
}: KanbanColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    const handleTitleSubmit = () => {
        if (editTitle.trim() && editTitle !== column.title) {
            onUpdateColumn(column.id, { title: editTitle });
        }
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="min-w-[20rem] flex-1 max-h-full flex flex-col bg-card/50 rounded-2xl border border-border/50"
        >
            {/* Column Header */}
            <div
                className="p-4 flex items-center justify-between group/header cursor-grab"
                {...attributes}
                {...listeners}
            >
                <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover/header:opacity-100 transition-opacity" />

                    {isEditing ? (
                        <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                            autoFocus
                            className="h-7 text-sm font-semibold"
                            onMouseDown={(e) => e.stopPropagation()} // Allow clicking input without dragging
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">{column.title}</h3>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {tasks.length}
                            </span>
                        </div>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDeleteColumn(column.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-3 pt-0 min-h-[150px] space-y-3">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task, index) => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            project={projects.find((p) => p.id === task.projectId)}
                            onToggle={onToggleTask}
                            onDelete={onDeleteTask}
                            onEdit={onEditTask}
                            onMoveToProject={onMoveTaskToProject}
                            projects={projects}
                        />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-xl bg-muted/20 text-muted-foreground text-sm">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
}
