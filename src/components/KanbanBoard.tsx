import { useMemo, useState } from 'react';
import { Task, Project, Column } from '@/types/task';
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    closestCorners,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Input } from './ui/input';

interface KanbanBoardProps {
    tasks: Task[];
    projects: Project[];
    columns: Column[];
    onAddColumn: (title: string) => void;
    onUpdateColumn: (id: string, updates: Partial<Column>) => void;
    onDeleteColumn: (id: string) => void;
    onMoveColumn: (activeId: string, overId: string) => void;
    onToggleTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onEditTask: (task: Task) => void;
    onMoveTaskToProject: (taskId: string, projectId: string) => void;
    onTaskDragEnd: (activeId: string, overId: string, activeColumnId: string, overColumnId: string) => void;
}

export function KanbanBoard({
    tasks,
    projects,
    columns,
    onAddColumn,
    onUpdateColumn,
    onDeleteColumn,
    onMoveColumn,
    onToggleTask,
    onDeleteTask,
    onEditTask,
    onMoveTaskToProject,
    onTaskDragEnd,
}: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        // Implemented in onDragEnd mostly, drag over can just show visual feedback if needed
        // Logic for moving betwen columns during drag is handled by parent or local state if strictly needed for visual correctness before drop
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        setActiveColumn(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const isActiveColumn = active.data.current?.type === 'Column';
        if (isActiveColumn) {
            onMoveColumn(activeId, overId);
            return;
        }

        // Task Dragging
        const activeTaskData = active.data.current?.task as Task;
        const overTaskData = over.data.current?.task as Task;

        // Find column IDs
        const activeColumnId = activeTaskData?.status || 'todo'; // Fallback
        let overColumnId = '';

        if (over.data.current?.type === 'Column') {
            overColumnId = overId;
        } else if (over.data.current?.type === 'Task') {
            overColumnId = overTaskData?.status || 'todo';
        }

        if (activeColumnId && overColumnId) {
            onTaskDragEnd(activeId, overId, activeColumnId, overColumnId);
        }
    };

    const handleAddColumnSubmit = () => {
        if (newColumnTitle.trim()) {
            onAddColumn(newColumnTitle.trim());
            setNewColumnTitle('');
            setIsAddingColumn(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-6 overflow-x-auto pb-6 px-1">
                    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                        {columns.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={tasks.filter(t => {
                                    // Map legacy 'active' to first column and 'completed' to last column if status not in columns?
                                    // Actually better to handle this normalization in the parent or a helper
                                    if (t.status === col.id) return true;
                                    // Basic migration fallback for display
                                    if (t.status === 'active' && col.id === columns[0]?.id) return true;
                                    if (t.status === 'completed' && col.id === columns[columns.length - 1]?.id) return true;
                                    return false;
                                })}
                                projects={projects}
                                onToggleTask={onToggleTask}
                                onDeleteTask={onDeleteTask}
                                onEditTask={onEditTask}
                                onMoveTaskToProject={onMoveTaskToProject}
                                onDeleteColumn={onDeleteColumn}
                                onUpdateColumn={onUpdateColumn}
                            />
                        ))}
                    </SortableContext>

                    {/* Add Column Button/Input */}
                    <div className="flex-shrink-0 w-80">
                        {isAddingColumn ? (
                            <div className="p-4 bg-card/50 rounded-2xl border border-border/50 space-y-3">
                                <Input
                                    placeholder="Column Title"
                                    value={newColumnTitle}
                                    onChange={e => setNewColumnTitle(e.target.value)}
                                    autoFocus
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddColumnSubmit();
                                        if (e.key === 'Escape') setIsAddingColumn(false);
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleAddColumnSubmit}>Add</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full h-14 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground"
                                onClick={() => setIsAddingColumn(true)}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Column
                            </Button>
                        )}
                    </div>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <div className="w-80 h-[500px] bg-card rounded-2xl border border-border opacity-80 shadow-xl p-4">
                                <h3 className="font-semibold">{activeColumn.title}</h3>
                            </div>
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                index={0}
                                project={projects.find(p => p.id === activeTask.projectId)}
                                onToggle={() => { }}
                                onDelete={() => { }}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
