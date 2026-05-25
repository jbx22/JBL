"use client";

import { useRef, useState } from "react";
import { PlusIcon, Upload, LayoutGridIcon, Loader2Icon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadStandaloneDocument } from "@/app/lib/mikeApi";
import type { MikeDocument } from "../shared/types";

interface Props {
    onSelectDoc: (doc: MikeDocument) => void;
    onBrowseAll: () => void;
    selectedDocIds?: string[];
}

export function AddDocButton({ onSelectDoc, onBrowseAll, selectedDocIds = [] }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        setUploadError(null);
        try {
            const uploaded = await Promise.all(
                files.map((f) => uploadStandaloneDocument(f)),
            );
            uploaded.forEach((doc) => onSelectDoc(doc));
        } catch (err) {
            setUploadError(readUploadError(err));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                multiple
                className="hidden"
                onChange={handleUpload}
            />
            <div className="relative">
            <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={`flex items-center gap-1 px-2 h-8 rounded-lg text-sm transition-colors cursor-pointer ${
                            selectedDocIds.length > 0
                                ? "text-black hover:bg-gray-100"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        } ${isOpen ? "bg-gray-100" : ""}`}
                        title="Add documents"
                        aria-label="Add documents"
                    >
                        {selectedDocIds.length > 0 ? (
                            <span className="font-medium tabular-nums">{selectedDocIds.length}</span>
                        ) : (
                            <PlusIcon
                                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-[135deg]" : ""}`}
                            />
                        )}
                        <span className="hidden sm:inline">
                            {selectedDocIds.length === 1
                                ? "Document"
                                : "Documents"}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-44 z-50"
                    side="bottom"
                    align="start"
                >
                    <DropdownMenuItem
                        className="cursor-pointer"
                        disabled={uploading}
                        onSelect={(e) => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                        }}
                    >
                        {uploading ? (
                            <Loader2Icon className="h-4 w-4 mr-2 animate-spin text-gray-400" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2 text-gray-500" />
                        )}
                        <span className="text-sm">
                            {uploading ? "Uploading…" : "Upload files"}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={onBrowseAll}
                    >
                        <LayoutGridIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Browse all</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
                {uploadError && (
                    <div className="absolute top-10 left-0 max-w-xs rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 shadow-lg z-50">
                        {uploadError}
                    </div>
                )}
            </div>
        </>
    );
}

function readUploadError(err: unknown): string {
    if (err instanceof Error && err.message) {
        try {
            const parsed = JSON.parse(err.message) as { detail?: string };
            return parsed.detail ?? err.message;
        } catch {
            return err.message;
        }
    }
    return "Upload failed. Please try a PDF, DOCX, or DOC file.";
}
