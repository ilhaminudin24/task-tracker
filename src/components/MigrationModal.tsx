import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    hasLocalStorageData,
    migrateToFirestore,
    clearLocalStorageData,
} from '@/utils/migrateLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CloudUpload, Database, CheckCircle2, Loader2 } from 'lucide-react';

type MigrationStatus = 'idle' | 'checking' | 'prompt' | 'migrating' | 'success' | 'error';

export function MigrationModal() {
    const { user } = useAuth();
    const [status, setStatus] = useState<MigrationStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState('');
    const [result, setResult] = useState<{ projects: number; tasks: number } | null>(null);

    // Check for migration data on mount
    useEffect(() => {
        if (user) {
            setStatus('checking');
            const hasData = hasLocalStorageData();
            setStatus(hasData ? 'prompt' : 'idle');
        }
    }, [user]);

    const handleMigrate = useCallback(async () => {
        if (!user) return;

        setStatus('migrating');
        setProgress(0);

        try {
            const migrationResult = await migrateToFirestore(
                user.uid,
                (current, total, message) => {
                    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
                    setProgress(percentage);
                    setCurrentMessage(message);
                }
            );

            setResult(migrationResult);
            setStatus('success');

            // Clear localStorage after successful migration
            clearLocalStorageData();

            toast.success('Data migrated successfully!');
        } catch (error) {
            console.error('Migration failed:', error);
            setStatus('error');
            toast.error('Failed to migrate data. Please try again.');
        }
    }, [user]);

    const handleSkip = useCallback(() => {
        setStatus('idle');
        // Don't set migration flag - user can migrate later
        toast.info('You can migrate your data later from settings.');
    }, []);

    const handleClose = useCallback(() => {
        setStatus('idle');
    }, []);

    // Don't show modal for non-prompt states
    if (status !== 'prompt' && status !== 'migrating' && status !== 'success') {
        return null;
    }

    return (
        <Dialog open={true} onOpenChange={() => status !== 'migrating' && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {status === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Database className="w-5 h-5 text-purple-500" />
                        )}
                        {status === 'success' ? 'Migration Complete!' : 'Migrate Your Data'}
                    </DialogTitle>
                    <DialogDescription>
                        {status === 'prompt' && (
                            <>
                                We found existing task data stored locally. Would you like to migrate
                                it to the cloud so you can access it anywhere?
                            </>
                        )}
                        {status === 'migrating' && (
                            <>Migrating your data to the cloud...</>
                        )}
                        {status === 'success' && result && (
                            <>
                                Successfully migrated {result.projects} projects and {result.tasks} tasks
                                to your account.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {status === 'migrating' && (
                        <div className="space-y-3">
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-muted-foreground text-center">
                                {currentMessage || 'Preparing...'}
                            </p>
                        </div>
                    )}

                    {status === 'prompt' && (
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleMigrate} className="w-full">
                                <CloudUpload className="w-4 h-4 mr-2" />
                                Migrate to Cloud
                            </Button>
                            <Button variant="outline" onClick={handleSkip} className="w-full">
                                Skip for Now
                            </Button>
                        </div>
                    )}

                    {status === 'success' && (
                        <Button onClick={handleClose} className="w-full">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Get Started
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
