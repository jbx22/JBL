import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";

export default async function LocalePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (locale !== "en" && locale !== "ar") notFound();
    return <HomePage locale={locale} />;
}
