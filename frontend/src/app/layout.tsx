import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
    variable: "--font-eb-garamond",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://jblbizlaw.com"),
    title: "JBL BIZ LAW | \u062c\u0628\u0644 \u0628\u064a\u0632 \u0644\u0648 - AI Legal & Business Platform",
    description:
        "AI-powered legal document analysis, contract review, and business intelligence platform for Saudi professionals. \u0645\u0646\u0635\u0629 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0644\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a \u0648\u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0644\u0644\u0645\u062d\u062a\u0631\u0641\u064a\u0646 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u064a\u0646.",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/favicon.ico" },
        ],
        apple: "/apple-touch-icon.png",
    },
    openGraph: {
        type: "website",
        url: "https://jblbizlaw.com",
        siteName: "JBL BIZ LAW",
        title: "JBL BIZ LAW | \u062c\u0628\u0644 \u0628\u064a\u0632 \u0644\u0648 - AI Legal & Business Platform",
        description:
            "AI-powered legal document analysis, contract review, and business intelligence platform for Saudi professionals. \u0645\u0646\u0635\u0629 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0644\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a \u0648\u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0644\u0644\u0645\u062d\u062a\u0631\u0641\u064a\u0646 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u064a\u0646.",
        images: [
            {
                url: "/link-image.jpg",
                width: 1200,
                height: 651,
                alt: "JBL BIZ LAW",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "JBL BIZ LAW | \u062c\u0628\u0644 \u0628\u064a\u0632 \u0644\u0648 - AI Legal & Business Platform",
        description:
            "AI-powered legal document analysis, contract review, and business intelligence platform for Saudi professionals. \u0645\u0646\u0635\u0629 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0644\u0644\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064a \u0648\u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0644\u0644\u0645\u062d\u062a\u0631\u0641\u064a\u0646 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u064a\u0646.",
        images: ["/link-image.jpg"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" dir="ltr">
            <head>
                <meta name="theme-color" content="#1a1a2e" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body
                className={`${inter.variable} ${ebGaramond.variable} font-sans antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
