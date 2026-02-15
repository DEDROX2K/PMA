"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

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

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Cloud Clipboard</h1>
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
                        className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign in with Magic Link"}
                    </button>
                </form>
            )}
        </div>
    );
}
