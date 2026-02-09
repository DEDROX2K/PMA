"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "@/components/Editor";
import { useParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DocPage() {
    const { id } = useParams();
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

    useEffect(() => {
        async function fetchDoc() {
            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setDoc(data);
                setTitle(data.title);
            }
            setLoading(false);
        }
        if (id) fetchDoc();
    }, [id]);

    const saveTitle = useDebouncedCallback(async (newTitle: string) => {
        setSaveStatus("saving");
        const { error } = await supabase
            .from("documents")
            .update({ title: newTitle, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (!error) {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }
    }, 1000);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        saveTitle(newTitle);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!doc) return <div className="p-20 text-center">Document not found</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8">
            <header className="mb-6 flex items-center justify-between">
                <Link href="/docs" className="flex items-center text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back
                </Link>
                <div className="text-sm text-gray-400">
                    {saveStatus === 'saving' ? 'Saving title...' : saveStatus === 'saved' ? 'Title saved' : ''}
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled Document"
                    className="w-full text-4xl font-bold bg-transparent outline-none mb-6 placeholder:text-gray-300 dark:placeholder:text-gray-700"
                />

                <Editor docId={id as string} initialContent={doc.content} />
            </div>
        </div>
    );
}
