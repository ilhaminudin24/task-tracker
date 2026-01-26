import { useState, useEffect, useCallback } from 'react';
import { Column } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import {
    subscribeToColumns,
    saveColumns,
    defaultColumns,
} from '@/services/firebaseKanban';
import { arrayMove } from '@dnd-kit/sortable';

export function useKanban() {
    const { user } = useAuth();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setColumns(defaultColumns);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToColumns(user.uid, (fetchedColumns) => {
            setColumns(fetchedColumns);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addColumn = useCallback(async (title: string) => {
        if (!user) return;
        const newId = title.toLowerCase().replace(/\s+/g, '-');
        const newColumn: Column = {
            id: newId,
            title,
            order: columns.length,
        };
        const newColumns = [...columns, newColumn];
        setColumns(newColumns); // Optimistic
        await saveColumns(user.uid, newColumns);
    }, [user, columns]);

    const updateColumn = useCallback(async (id: string, updates: Partial<Column>) => {
        if (!user) return;
        const newColumns = columns.map((col) =>
            col.id === id ? { ...col, ...updates } : col
        );
        setColumns(newColumns); // Optimistic
        await saveColumns(user.uid, newColumns);
    }, [user, columns]);

    const deleteColumn = useCallback(async (id: string) => {
        if (!user) return;
        const newColumns = columns.filter((col) => col.id !== id);
        setColumns(newColumns); // Optimistic
        await saveColumns(user.uid, newColumns);
    }, [user, columns]);

    const moveColumn = useCallback(async (activeId: string, overId: string) => {
        if (!user) return;
        const oldIndex = columns.findIndex((col) => col.id === activeId);
        const newIndex = columns.findIndex((col) => col.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newColumns = arrayMove(columns, oldIndex, newIndex).map(
                (col, index) => ({ ...col, order: index })
            );
            setColumns(newColumns); // Optimistic
            await saveColumns(user.uid, newColumns);
        }
    }, [user, columns]);

    return {
        columns,
        loading,
        addColumn,
        updateColumn,
        deleteColumn,
        moveColumn,
    };
}
