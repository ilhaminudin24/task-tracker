import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, ProjectColor } from '@/types/task';

// Firestore paths helper
const getUserProjectsRef = (userId: string) =>
    collection(db, 'users', userId, 'projects');

const getProjectDocRef = (userId: string, projectId: string) =>
    doc(db, 'users', userId, 'projects', projectId);

// Converter: Firestore -> App
const convertProject = (id: string, data: Record<string, unknown>): Project => ({
    id,
    name: data.name as string,
    color: data.color as ProjectColor,
    icon: data.icon as string,
    description: data.description as string | undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
});

// Types for create/update
export interface CreateProjectData {
    name: string;
    color: ProjectColor;
    icon: string;
    description?: string;
}

export interface UpdateProjectData {
    name?: string;
    color?: ProjectColor;
    icon?: string;
    description?: string;
}

// Subscribe to real-time projects updates
export function subscribeToProjects(
    userId: string,
    callback: (projects: Project[]) => void,
    onError?: (error: Error) => void
): Unsubscribe {
    const q = query(
        getUserProjectsRef(userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const projects = snapshot.docs.map((doc) =>
                convertProject(doc.id, doc.data())
            );
            callback(projects);
        },
        (error) => {
            console.error('Error subscribing to projects:', error);
            onError?.(error);
        }
    );
}

// Add a new project
export async function addProject(
    userId: string,
    data: CreateProjectData
): Promise<string> {
    const docRef = await addDoc(getUserProjectsRef(userId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

// Update an existing project
export async function updateProject(
    userId: string,
    projectId: string,
    data: UpdateProjectData
): Promise<void> {
    await updateDoc(getProjectDocRef(userId, projectId), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// Delete a project
export async function deleteProject(
    userId: string,
    projectId: string
): Promise<void> {
    await deleteDoc(getProjectDocRef(userId, projectId));
}
