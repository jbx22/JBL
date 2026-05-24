import { notFound } from "next/navigation";
import { ContactPage } from "@/components/contact-page";

export default async function LocaleContactPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (locale !== "en" && locale !== "ar") notFound();
    return <ContactPage locale={locale} />;
}
