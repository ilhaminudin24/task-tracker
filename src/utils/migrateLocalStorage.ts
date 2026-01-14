import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Task } from '@/types/task';

const PROJECTS_STORAGE_KEY = 'task-tracker-projects-data';
const TASKS_STORAGE_KEY = 'task-tracker-tasks-data';
const MIGRATION_FLAG_KEY = 'task-tracker-data-migrated';

// Check if there's localStorage data to migrate
export function hasLocalStorageData(): boolean {
    if (typeof window === 'undefined') return false;

    const hasMigrated = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
    if (hasMigrated) return false;

    const hasProjects = localStorage.getItem(PROJECTS_STORAGE_KEY) !== null;
    const hasTasks = localStorage.getItem(TASKS_STORAGE_KEY) !== null;

    return hasProjects || hasTasks;
}

// Get projects from localStorage
function getLocalProjects(): Project[] {
    try {
        const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return parsed.map((p: Record<string, unknown>) => ({
            ...p,
            createdAt: new Date(p.createdAt as string),
        }));
    } catch (error) {
        console.error('Failed to parse local projects:', error);
        return [];
    }
}

// Get tasks from localStorage
function getLocalTasks(): Task[] {
    try {
        const stored = localStorage.getItem(TASKS_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return parsed.map((t: Record<string, unknown>) => ({
            ...t,
            dueDate: new Date(t.dueDate as string),
            createdAt: new Date(t.createdAt as string),
            completedAt: t.completedAt ? new Date(t.completedAt as string) : undefined,
        }));
    } catch (error) {
        console.error('Failed to parse local tasks:', error);
        return [];
    }
}

// Migrate data to Firestore
export async function migrateToFirestore(
    userId: string,
    onProgress?: (current: number, total: number, message: string) => void
): Promise<{ projects: number; tasks: number }> {
    const projects = getLocalProjects();
    const tasks = getLocalTasks();
    const total = projects.length + tasks.length;
    let current = 0;

    // Map old project IDs to new Firestore IDs
    const projectIdMap = new Map<string, string>();

    // Migrate projects
    onProgress?.(current, total, 'Migrating projects...');

    for (const project of projects) {
        const docRef = await addDoc(
            collection(db, 'users', userId, 'projects'),
            {
                name: project.name,
                color: project.color,
                icon: project.icon,
                description: project.description || null,
                createdAt: Timestamp.fromDate(project.createdAt),
                updatedAt: serverTimestamp(),
            }
        );

        projectIdMap.set(project.id, docRef.id);
        current++;
        onProgress?.(current, total, `Migrated project: ${project.name}`);
    }

    // Migrate tasks
    onProgress?.(current, total, 'Migrating tasks...');

    for (const task of tasks) {
        // Map old projectId to new one, or use original if not found
        const newProjectId = projectIdMap.get(task.projectId) || task.projectId;

        await addDoc(
            collection(db, 'users', userId, 'tasks'),
            {
                title: task.title,
                description: task.description || null,
                category: task.category,
                priority: task.priority,
                status: task.status,
                dueDate: Timestamp.fromDate(task.dueDate),
                projectId: newProjectId,
                createdAt: Timestamp.fromDate(task.createdAt),
                updatedAt: serverTimestamp(),
                completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
            }
        );

        current++;
        onProgress?.(current, total, `Migrated task: ${task.title}`);
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    return { projects: projects.length, tasks: tasks.length };
}

// Clear localStorage after successful migration (optional)
export function clearLocalStorageData(): void {
    localStorage.removeItem(PROJECTS_STORAGE_KEY);
    localStorage.removeItem(TASKS_STORAGE_KEY);
}

// Reset migration flag (for testing)
export function resetMigrationFlag(): void {
    localStorage.removeItem(MIGRATION_FLAG_KEY);
}
