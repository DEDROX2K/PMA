"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { supabase } from '@/lib/supabase'
import { Loader2, Save } from 'lucide-react'

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-900">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                Bold
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                Italic
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                H2
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                Bullet List
            </button>
        </div>
    )
}

export default function Editor({ docId, initialContent }: { docId: string, initialContent: string }) {
    const [status, setStatus] = useState<"saved" | "saving" | "error" | "idle">("idle");

    const saveContent = useDebouncedCallback(async (content: string) => {
        setStatus("saving");
        const { error } = await supabase
            .from('documents')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', docId);

        if (error) {
            console.error("Supabase Save Error Details:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            setStatus("error");
        } else {
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 2000);
        }
    }, 1000);

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent || '<p>Start writing...</p>',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert focus:outline-none max-w-none p-4 min-h-[500px]',
            },
        },
        onUpdate: ({ editor }) => {
            saveContent(editor.getHTML());
        },
    })

    // Update content if initialContent changes (e.g. form async fetch, though usually valid on mount)
    useEffect(() => {
        if (editor && initialContent && editor.getHTML() === '<p>Start writing...</p>') {
            // This check is a bit naive, ideally we only set content on mount.
            // But since we pass initialContent from parent component which fetches it,
            // we might not render Editor until content is ready.
        }
    }, [initialContent, editor])

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs text-gray-500">
                    {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : ''}
                </span>
            </div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
