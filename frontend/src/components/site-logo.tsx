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
    const markSize =
        size === "sm" ? 38 : size === "md" ? 54 : size === "lg" ? 76 : 104;
    const titleSize =
        size === "sm" ? "text-sm" : size === "md" ? "text-lg" : size === "lg" ? "text-2xl" : "text-4xl";
    const arabicSize =
        size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-sm";

    const logo = (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex-shrink-0 overflow-hidden rounded-md bg-white">
                <img
                    src="/agd-logo.svg"
                    alt="AGD LAW AI"
                    width={markSize}
                    height={markSize}
                    className="block object-contain"
                    style={{ width: markSize, height: markSize }}
                />
            </div>
            <div className={`flex flex-col ${animate ? "sidebar-fade-in" : ""}`}>
                <h1 className={`font-bold tracking-tight leading-none ${titleSize}`}>
                    <span className="text-[#1a1a2e]">AGD</span>
                    <span className="text-[#c9a84c]"> LAW AI</span>
                </h1>
                <span className={`text-[#c9a84c] font-medium tracking-wider ${arabicSize}`}>
                    الذكاء القانوني للعقود
                </span>
            </div>
        </div>
    );

    if (asLink) {
        return (
            <Link href="/" className="cursor-pointer transition-opacity hover:opacity-80">
                {logo}
            </Link>
        );
    }

    return logo;
}
