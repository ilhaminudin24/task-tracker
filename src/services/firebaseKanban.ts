import {
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    Unsubscribe,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Column } from '@/types/task';

// Use a specific document in users/{userId}/settings/kanban
const getKanbanSettingsRef = (userId: string) =>
    doc(db, 'users', userId, 'settings', 'kanban');

export interface KanbanSettings {
    columns: Column[];
    updatedAt: any;
}

export const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', order: 0 },
    { id: 'in-progress', title: 'In Progress', order: 1 },
    { id: 'done', title: 'Done', order: 2 },
];

export function subscribeToColumns(
    userId: string,
    callback: (columns: Column[]) => void
): Unsubscribe {
    return onSnapshot(
        getKanbanSettingsRef(userId),
        (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as KanbanSettings;
                // Sort columns by order
                const sortedColumns = (data.columns || []).sort((a, b) => a.order - b.order);
                callback(sortedColumns);
            } else {
                // Initialize with default columns if settings don't exist
                saveColumns(userId, defaultColumns).then(() => {
                    callback(defaultColumns);
                });
            }
        },
        (error) => {
            console.error('Error subscribing to kanban settings:', error);
            callback(defaultColumns); // Fallback to defaults on error
        }
    );
}

export async function saveColumns(userId: string, columns: Column[]): Promise<void> {
    await setDoc(getKanbanSettingsRef(userId), {
        columns,
        updatedAt: serverTimestamp(),
    });
}

// Helper to update a single task status (generic wrapper for updateTask)
export async function updateTaskStatus(
    userId: string,
    taskId: string,
    newStatus: string
): Promise<void> {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        // If moving to done/completed, set completedAt, else clear it
        completedAt: newStatus === 'done' || newStatus === 'completed' ? serverTimestamp() : null
    });
}
