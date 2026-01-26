import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Task, Project } from '@/types/task';
import { CSSProperties } from 'react';

interface SortableTaskCardProps {
    task: Task;
    index: number;
    project?: Project;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit?: (task: Task) => void;
    onMoveToProject?: (taskId: string, projectId: string) => void;
    projects?: Project[];
}

export function SortableTaskCard(props: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.task.id,
        data: {
            type: 'Task',
            task: props.task,
        },
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard {...props} />
        </div>
    );
}
