import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task';

// Firestore paths helper
const getUserTasksRef = (userId: string) =>
    collection(db, 'users', userId, 'tasks');

const getTaskDocRef = (userId: string, taskId: string) =>
    doc(db, 'users', userId, 'tasks', taskId);

// Converter: Firestore -> App
const convertTask = (id: string, data: Record<string, unknown>): Task => ({
    id,
    title: data.title as string,
    description: data.description as string | undefined,
    category: data.category as TaskCategory,
    priority: data.priority as TaskPriority,
    status: data.status as TaskStatus,
    dueDate: (data.dueDate as Timestamp)?.toDate() || new Date(),
    projectId: data.projectId as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    completedAt: data.completedAt
        ? (data.completedAt as Timestamp).toDate()
        : undefined,
});

// Types for create/update
export interface CreateTaskData {
    title: string;
    description?: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate: Date;
    projectId: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: Date;
    projectId?: string;
    completedAt?: Date | null;
}

// Subscribe to real-time tasks updates (optionally filtered by projectId)
export function subscribeToTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    projectId?: string | null,
    onError?: (error: Error) => void
): Unsubscribe {
    let q = query(
        getUserTasksRef(userId),
        orderBy('createdAt', 'desc')
    );

    // Add project filter if specified
    if (projectId) {
        q = query(
            getUserTasksRef(userId),
            where('projectId', '==', projectId),
            orderBy('createdAt', 'desc')
        );
    }

    return onSnapshot(
        q,
        (snapshot) => {
            const tasks = snapshot.docs.map((doc) =>
                convertTask(doc.id, doc.data())
            );
            callback(tasks);
        },
        (error) => {
            console.error('Error subscribing to tasks:', error);
            onError?.(error);
        }
    );
}

// Add a new task
export async function addTask(
    userId: string,
    data: CreateTaskData
): Promise<string> {
    const docRef = await addDoc(getUserTasksRef(userId), {
        ...data,
        status: 'active' as TaskStatus,
        dueDate: Timestamp.fromDate(data.dueDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update an existing task
export async function updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskData
): Promise<void> {
    const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    // Convert Date to Timestamp
    if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
    }
    if (data.completedAt) {
        updateData.completedAt = Timestamp.fromDate(data.completedAt);
    } else if (data.completedAt === null) {
        updateData.completedAt = null;
    }

    await updateDoc(getTaskDocRef(userId, taskId), updateData);
}

// Toggle task status (active <-> completed)
export async function toggleTaskStatus(
    userId: string,
    taskId: string,
    currentStatus: TaskStatus
): Promise<void> {
    const newStatus: TaskStatus = currentStatus === 'active' ? 'completed' : 'active';
    const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
    };

    if (newStatus === 'completed') {
        updateData.completedAt = serverTimestamp();
    } else {
        updateData.completedAt = null;
    }

    await updateDoc(getTaskDocRef(userId, taskId), updateData);
}

// Delete a task
export async function deleteTask(
    userId: string,
    taskId: string
): Promise<void> {
    await deleteDoc(getTaskDocRef(userId, taskId));
}

// Move task to another project
export async function moveTaskToProject(
    userId: string,
    taskId: string,
    newProjectId: string
): Promise<void> {
    await updateDoc(getTaskDocRef(userId, taskId), {
        projectId: newProjectId,
        updatedAt: serverTimestamp(),
    });
}
