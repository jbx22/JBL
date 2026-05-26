import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} dir={dir}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
