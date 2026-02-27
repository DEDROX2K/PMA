"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Chrome } from "lucide-react";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
            }
        });

        if (error) {
            alert(error.message);
        } else {
            setMessage("Check your email for the login link!");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
            }
        });

        if (error) {
            alert(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Air Paste</h1>
            {message ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded text-center">
                    <p className="text-green-800 dark:text-green-200">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center font-semibold"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign in with Magic Link"}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-black text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Chrome className="w-5 h-5" />
                        Sign in with Google
                    </button>
                </form>
            )}
        </div>
    );
}
