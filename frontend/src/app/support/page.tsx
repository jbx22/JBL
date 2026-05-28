"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type FeedbackType = "bug" | "feature" | "question" | "other";

export default function SupportPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [authLoading, isAuthenticated, pathname, router]);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("question");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const feedbackTypes: {
        value: FeedbackType;
        label: string;
        description: string;
    }[] = [
        {
            value: "bug",
            label: "Ø¨Ù„Ø§Øº Ø¹Ù† Ù…Ø´ÙƒÙ„Ø©",
            description: "Ø£Ø¨Ù„ØºÙ†Ø§ Ø¹Ù† Ø´ÙŠØ¡ Ù„Ø§ ÙŠØ¹Ù…Ù„ ÙƒÙ…Ø§ ÙŠØ¬Ø¨",
        },
        {
            value: "feature",
            label: "Ø§Ù‚ØªØ±Ø§Ø­ Ù…ÙŠØ²Ø©",
            description: "Ø§Ù‚ØªØ±Ø­ Ù…ÙŠØ²Ø© Ø¬Ø¯ÙŠØ¯Ø© Ø£Ùˆ ØªØ­Ø³ÙŠÙ†Ø§Ù‹",
        },
        {
            value: "question",
            label: "Ø³Ø¤Ø§Ù„",
            description: "Ø§Ø³Ø£Ù„ Ø¹Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¬Ø¨Ù„ Ø¨ÙŠØ² Ù„Ùˆ",
        },
        {
            value: "other",
            label: "Ø£Ø®Ø±Ù‰",
            description: "Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø¹Ø§Ù…Ø© Ø£Ùˆ Ø§Ø³ØªÙØ³Ø§Ø±Ø§Øª Ø£Ø®Ø±Ù‰",
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: feedbackType,
                    subject,
                    message,
                    email: user?.email,
                    link,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit support request");
            }

            setIsSubmitted(true);
        } catch (err) {
            console.error("Error submitting support request:", err);
            setError("ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨Ùƒ. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const locale =
        pathname === "/en" ||
        pathname?.startsWith("/en/") ||
        (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "en")
            ? "en"
            : "ar";
    const dir = locale === "ar" ? "rtl" : "ltr";

    if (isSubmitted) {
        return (
            <div className="h-full flex items-center justify-center p-4" dir={dir}>
                <div className="max-w-md w-full bg-white rounded-xl text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Ø´ÙƒØ±Ø§Ù‹ Ù„ÙƒØŒ ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø·Ù„Ø¨Ùƒ.
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Ø³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ù‚Ø±ÙŠØ¨Ø§Ù‹ Ø¹Ø¨Ø± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                        Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col px-6 h-full" dir={dir}>
            <div className="w-full max-w-4xl m-auto flex flex-col h-full">
                {/* Fixed Header Section */}
                <div className="flex-shrink-0 pt-6 md:pt-10 pb-0">
                    <div className="mb-5">
                        <h1 className="text-4xl font-medium font-eb-garamond text-gray-900 mb-3">
                            Ø§Ù„Ø¯Ø¹Ù…
                        </h1>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 overflow-y-auto pb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Feedback Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    ÙƒÙŠÙ ÙŠÙ…ÙƒÙ†Ù†Ø§ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒØŸ
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {feedbackTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() =>
                                                setFeedbackType(type.value)
                                            }
                                            className={`p-4 rounded-lg border-2 ${locale === "ar" ? "text-right" : "text-left"} transition-all ${
                                                feedbackType === type.value
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div
                                                className={`font-medium ${
                                                    feedbackType === type.value
                                                        ? "text-blue-700"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {type.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {type.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Link (for bugs) */}
                            {feedbackType === "bug" && (
                                <div>
                                    <label
                                        htmlFor="link"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø´ÙƒÙ„Ø© (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
                                    </label>
                                    <input
                                        type="url"
                                        id="link"
                                        value={link}
                                        onChange={(e) =>
                                            setLink(e.target.value)
                                        }
                                        placeholder="https://agdlawai.com/..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¯Ø§Ø®Ù„ Ù…Ø­Ø§Ø¯Ø«Ø©ØŒ Ø§ÙØªØ­ Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ù…Ù† Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ Ø«Ù… Ø§Ø®ØªØ± Ù…Ø´Ø§Ø±ÙƒØ© ÙˆØ§Ù„ØµÙ‚ Ø§Ù„Ø±Ø§Ø¨Ø· Ù‡Ù†Ø§.
                                    </p>
                                </div>
                            )}

                            {/* Subject */}
                            <div>
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Ø§Ù„Ù…ÙˆØ¶ÙˆØ¹
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Ø§Ù„Ø±Ø³Ø§Ù„Ø©
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ø§ÙƒØªØ¨ Ø³Ø¤Ø§Ù„Ùƒ Ø£Ùˆ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø£Ùˆ Ø§Ù„Ø§Ù‚ØªØ±Ø§Ø­ Ø¨Ø§Ù„ØªÙØµÙŠÙ„..."
                                    rows={5}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* Email Display (if logged in) */}
                            {user?.email && (
                                <div className="text-sm text-gray-500">
                                    Ø³Ù†Ø±Ø¯ Ø¹Ù„Ù‰:{" "}
                                    <span className="font-medium">
                                        {user.email}
                                    </span>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    !subject.trim() ||
                                    !message.trim()
                                }
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Ø¬Ø§Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Ø¥Ø±Ø³Ø§Ù„</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

