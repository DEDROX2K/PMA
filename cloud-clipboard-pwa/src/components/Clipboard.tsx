"use client";

import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { supabase } from "@/lib/supabase";
import { Loader2, Save } from "lucide-react";

export default function Clipboard({ session }: { session: any }) {
    const [text, setText] = useState("");
    const [status, setStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");
    const [loading, setLoading] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fetch initial data
    useEffect(() => {
        async function fetchNote() {
            const { data, error } = await supabase
                .from("notes")
                .select("content")
                .eq("user_id", session.user.id)
                .order("updated_at", { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setText(data.content);
            }
            setLoading(false);
        }
        fetchNote();
    }, [session.user.id]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel("realtime-notes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notes",
                    filter: `user_id=eq.${session.user.id}`,
                },
                (payload) => {
                    if (payload.new && (payload.new as any).content !== text) {
                        // Only update if content is different to avoid cursor jumps/loops if we were the trigger
                        // But actually, simple equality check might be enough for now.
                        // A better approach for concurrent editing is more complex, but for sync across devices:
                        // If we are currently editing (focused), we might want to be careful.
                        // For now, let's just update if it's external.
                        // We can compare with the last saved version maybe? 
                        // Simplest: Just update local state if document is not focused? 
                        // Or update and try to preserve cursor? 

                        // Simplest "last write wins" synchronization:
                        setText((payload.new as any).content);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session.user.id]);

    const saveToDb = useDebouncedCallback(async (content: string) => {
        setStatus("saving");
        const { error } = await supabase.from("notes").upsert(
            { user_id: session.user.id, content, updated_at: new Date().toISOString() },
            { onConflict: "user_id" } // Assuming one note per user for the clipboard
        );

        if (error) {
            console.error(error);
            setStatus("error");
        } else {
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 2000);
        }
    }, 1000);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        saveToDb(newText);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="w-full h-[calc(100vh-100px)] relative md:p-4">
            <div className="absolute top-2 right-4 md:top-6 md:right-8 z-10 flex items-center gap-2 text-sm text-gray-500">
                {status === "saving" && <span>Saving...</span>}
                {status === "saved" && <span className="text-green-500 flex items-center gap-1"><Save className="w-4 h-4" /> Saved</span>}
                {status === "error" && <span className="text-red-500">Error saving</span>}
            </div>
            <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                placeholder="Type here to sync across devices..."
                className="w-full h-full p-4 md:p-8 bg-transparent text-lg md:text-xl resize-none outline-none font-mono placeholder:text-gray-300 dark:placeholder:text-gray-700"
                autoFocus
                spellCheck={false}
            />
        </div>
    );
}
