import { useState, useEffect, useMemo } from 'react';
import { Search, X, Calendar, Tag, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';
import { format, isToday, isPast } from 'date-fns';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

export function SearchModal({ isOpen, onClose, tasks, onSelectTask }: SearchModalProps) {
    const [query, setQuery] = useState('');

    // Reset query when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
        }
    }, [isOpen]);

    // Filter tasks based on search query
    const filteredTasks = useMemo(() => {
        if (!query.trim()) return [];

        const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

        return tasks.filter(task => {
            const titleMatch = searchTerms.every(term =>
                task.title.toLowerCase().includes(term)
            );
            const categoryMatch = searchTerms.some(term =>
                task.category.toLowerCase().includes(term)
            );
            const tagsMatch = task.tags?.some(tag =>
                searchTerms.some(term => tag.toLowerCase().includes(term))
            );

            return titleMatch || categoryMatch || tagsMatch;
        }).slice(0, 10); // Limit to 10 results
    }, [query, tasks]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'work': return 'bg-blue-500/20 text-blue-400';
            case 'personal': return 'bg-purple-500/20 text-purple-400';
            case 'urgent': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getStatusIndicator = (task: Task) => {
        if (task.status === 'completed') {
            return <span className="text-xs text-emerald-400">✓ Completed</span>;
        }
        if (task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))) {
            return <span className="text-xs text-red-400">Overdue</span>;
        }
        if (task.dueDate && isToday(new Date(task.dueDate))) {
            return <span className="text-xs text-amber-400">Due today</span>;
        }
        return null;
    };

    const handleSelectTask = (task: Task) => {
        onSelectTask(task);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-emerald-400" />
                        Search Tasks
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            autoFocus
                            placeholder="Search by title, category, or tags..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {query && filteredTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No tasks found for "{query}"</p>
                            </div>
                        )}

                        {filteredTasks.map((task) => (
                            <button
                                key={task.id}
                                onClick={() => handleSelectTask(task)}
                                className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${task.status === 'completed'
                                                ? 'text-slate-500 line-through'
                                                : 'text-white group-hover:text-emerald-400'
                                            }`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                                                {task.category}
                                            </span>
                                            {task.dueDate && (
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(task.dueDate), 'MMM d')}
                                                </span>
                                            )}
                                            {getStatusIndicator(task)}
                                        </div>
                                        {task.tags && task.tags.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                <Tag className="h-3 w-3 text-slate-500" />
                                                {task.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="text-xs text-slate-400">
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {task.tags.length > 3 && (
                                                    <span className="text-xs text-slate-500">+{task.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Search Hints */}
                    {!query && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                            <p>Start typing to search tasks</p>
                            <p className="text-xs mt-1 text-slate-600">
                                Search by title, category (work, personal, urgent), or tags
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
