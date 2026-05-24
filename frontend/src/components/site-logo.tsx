import Link from "next/link";

interface SiteLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    animate?: boolean;
    asLink?: boolean;
}

export function SiteLogo({
    size = "md",
    className = "",
    animate = false,
    asLink = false,
}: SiteLogoProps) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl",
        xl: "text-6xl",
    };

    const logo = (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* JBL mountain icon */}
            <div className="relative flex-shrink-0">
                <svg
                    width={size === "sm" ? 28 : size === "md" ? 34 : size === "lg" ? 48 : 64}
                    height={size === "sm" ? 28 : size === "md" ? 34 : size === "lg" ? 48 : 64}
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Mountain peak representing "جبل" */}
                    <path
                        d="M4 56L32 8L60 56H4Z"
                        fill="#1a1a2e"
                        stroke="#c9a84c"
                        strokeWidth="2"
                    />
                    {/* Secondary peak */}
                    <path
                        d="M14 56L32 22L50 56H14Z"
                        fill="#16213e"
                        stroke="#c9a84c"
                        strokeWidth="1.5"
                    />
                    {/* Snow cap */}
                    <path
                        d="M26 28L32 20L38 28H26Z"
                        fill="#c9a84c"
                    />
                    {/* Base line */}
                    <line x1="2" y1="56" x2="62" y2="56" stroke="#1a1a2e" strokeWidth="2.5" />
                </svg>
            </div>
            <div className={`flex flex-col ${animate ? "sidebar-fade-in" : ""}`}>
                <h1 className={`font-bold tracking-tight leading-none ${
                    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : size === "lg" ? "text-2xl" : "text-4xl"
                }`}>
                    <span className="text-[#1a1a2e]">JBL</span>
                    <span className="text-[#c9a84c]"> BIZ LAW</span>
                </h1>
                <span className={`text-[#c9a84c] font-medium tracking-wider ${
                    size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-sm"
                }`}>
                    جبل بيز لو
                </span>
            </div>
        </div>
    );

    if (asLink) {
        return (
            <Link
                href="/"
                className="cursor-pointer hover:opacity-80 transition-opacity"
            >
                {logo}
            </Link>
        );
    }

    return logo;
}
