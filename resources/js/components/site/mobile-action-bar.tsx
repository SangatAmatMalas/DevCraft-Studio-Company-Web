import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import type { SharedProps } from '@/types';

const HIDDEN_PREFIXES = ['/kontak', '/desain', '/admin'];

export function showMobileActionBar(url: string): boolean {
    const path = url.split('?')[0];

    return !HIDDEN_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export default function MobileActionBar() {
    const page = usePage<SharedProps>();
    const { whatsapp } = page.props;
    const { track } = useAnalytics();

    return (
        <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="container-page flex items-center gap-2 py-2.5">
                {whatsapp.configured && whatsapp.url ? (
                    <a
                        href={whatsapp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('whatsapp_click', { metadata: { source: 'mobile_bar' } })}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                    >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        WhatsApp
                    </a>
                ) : null}
                <Button asChild className="h-11 flex-1 rounded-xl">
                    <Link href="/kontak">
                        Kirim brief
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
