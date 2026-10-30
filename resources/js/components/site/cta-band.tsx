import { Link } from '@inertiajs/react';
import { ArrowRight, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';

export default function CtaBand({
    title = 'Punya kebutuhan yang ingin didiskusikan?',
    description = 'Ceritakan konteks dan batasan Anda. Kami akan membantu memetakan langkah berikutnya tanpa komitmen awal.',
    whatsappUrl,
    whatsappLabel = 'Chat WhatsApp',
    contactHref = '/kontak',
    contactLabel = 'Kirim project brief',
}: {
    title?: string;
    description?: string;
    whatsappUrl?: string | null;
    whatsappLabel?: string;
    contactHref?: string;
    contactLabel?: string;
}) {
    const { track } = useAnalytics();

    return (
        <div className="hero-gradient relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="grid-lines absolute inset-0" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild size="lg" className="rounded-xl bg-white text-navy hover:bg-brand-50">
                        <Link href={contactHref}>
                            {contactLabel}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </Button>
                    {whatsappUrl ? (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('whatsapp_click', { metadata: { source: 'cta_band' } })}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            {whatsappLabel}
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
