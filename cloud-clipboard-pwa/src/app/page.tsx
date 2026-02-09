"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import Clipboard from "@/components/Clipboard";
import Link from "next/link";
import { FileText, Clipboard as ClipboardIcon, MessageSquare } from "lucide-react";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center p-24">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <header className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 font-bold text-xl">
          <ClipboardIcon className="w-6 h-6" /> Cloud Clipboard
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/docs" className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> <span className="hidden sm:inline">Docs</span>
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            Sign Out
          </button>
        </nav>
      </header>
      <div className="flex-1">
        <Clipboard session={session} />
      </div>
    </main>
  );
}
