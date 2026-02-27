"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, FileText, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ErrorLog from "@/components/ErrorLog";

export default function DocsPage() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchDocs() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .eq("user_id", session.user.id)
                .order("updated_at", { ascending: false });

            if (error) {
                console.error("Fetch Docs Error:", error);
                setDbError(error.message || JSON.stringify(error));
            }

            if (data) {
                setDocs(data);
            }
            setLoading(false);
        }
        fetchDocs();
    }, []);

    const createDoc = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from("documents")
            .insert([
                {
                    user_id: session.user.id,
                    title: "Untitled Document",
                    content: "<p></p>"
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Create Doc Error:", error);
            setDbError(error.message || JSON.stringify(error));
        } else if (data) {
            router.push(`/docs/${data.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8">
            <header className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center text-gray-500 hover:text-black dark:hover:text-white">
                    <ChevronLeft className="w-5 h-5" /> Back to Clipboard
                </Link>
                <h1 className="text-2xl font-bold">My Documents</h1>
                <button
                    onClick={createDoc}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md hover:opacity-80 transition-opacity"
                >
                    <Plus className="w-4 h-4" /> New Doc
                </button>
            </header>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {docs.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500 py-20">
                            No documents yet. Create one to get started.
                        </div>
                    ) : (
                        docs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/docs/${doc.id}`}
                                className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-black dark:hover:border-white transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <h3 className="font-semibold truncate">{doc.title || "Untitled"}</h3>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            )}
            <ErrorLog error={dbError} onClose={() => setDbError(null)} />
        </div>
    );
}
