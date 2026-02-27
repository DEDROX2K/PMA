"use client";

import { useEffect, useState } from "react";
import { XCircle, AlertCircle } from "lucide-react";

export default function ErrorLog({ error, onClose }: { error: string | null; onClose: () => void }) {
    if (!error) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-4 shadow-lg flex items-start gap-3 max-w-sm">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Error Occurred</h3>
                    <p className="text-sm border-t border-red-200 dark:border-red-800 mt-2 pt-2 text-red-600 dark:text-red-300 break-words font-mono">
                        {error}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-700 bg-red-100 dark:bg-red-900/50 rounded-full p-1 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
