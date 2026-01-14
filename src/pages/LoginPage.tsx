import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get redirect path from state or default to home
    const from = location.state?.from?.pathname || '/';

    const handleGoogleSignIn = async () => {
        try {
            setIsSubmitting(true);
            await signInWithGoogle();
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error('Failed to sign in with Google');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            setIsSubmitting(true);
            await signInWithEmail(email, password);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error('Invalid email or password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            setIsSubmitting(true);
            await signUpWithEmail(email, password);
            toast.success('Account created successfully!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error('Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            {/* Login card */}
            <div className="relative w-full max-w-md">
                {/* Glassmorphism card */}
                <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    {/* Logo and title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-glow overflow-hidden mb-4 bg-transparent">
                            <img
                                src="/favicon.png"
                                alt="Task Tracker Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Task Tracker</h1>
                        <p className="text-slate-400 text-sm">Your personal task management companion</p>
                    </div>

                    {/* Auth tabs */}
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-700/30 border border-slate-600/30 mb-6">
                            <TabsTrigger
                                value="signin"
                                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-slate-400"
                            >
                                Sign In
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-slate-400"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        {/* Sign In tab */}
                        <TabsContent value="signin">
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-700/30 border-slate-600/30 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-700/30 border-slate-600/30 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Sign Up tab */}
                        <TabsContent value="signup">
                            <form onSubmit={handleEmailSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-700/30 border-slate-600/30 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-700/30 border-slate-600/30 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                    />
                                    <p className="text-xs text-slate-500">Must be at least 6 characters</p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                    )}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600/30" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-slate-500">or continue with</span>
                        </div>
                    </div>

                    {/* Google sign in button */}
                    <Button
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full bg-slate-700/30 border-slate-600/30 text-white hover:bg-slate-600/30 hover:text-white"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>
            </div>
        </div>
    );
}
