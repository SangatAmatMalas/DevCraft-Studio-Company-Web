import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Menu, MessageCircle } from 'lucide-react';
import { useState } from 'react';

import Logo from '@/components/site/logo';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types';

const NAV = [
    { label: 'Layanan', href: '/layanan' },
    { label: 'Paket', href: '/paket' },
    { label: 'Preview Desain', href: '/desain' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Kontak', href: '/kontak' },
];

const SECONDARY_NAV = [
    { label: 'Tentang Kami', href: '/tentang-kami' },
    { label: 'Tim', href: '/tim' },
    { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
];

export default function SiteHeader() {
    const { site, whatsapp } = usePage<SharedProps>().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    const isActive = (href: string) => (href === '/' ? url === '/' : url.startsWith(href));

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
            <div className="container-page flex h-16 items-center justify-between gap-4">
                <Logo name={site.brand.name ?? 'DevCraft Studio'} />

                <nav aria-label="Navigasi utama" className="hidden items-center gap-0.5 md:flex">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            className={cn(
                                'rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 xl:px-3',
                                isActive(item.href) && 'bg-brand-50 text-brand-700',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Link
                        href="/tim"
                        aria-current={isActive('/tim') ? 'page' : undefined}
                        className={cn(
                            'hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 lg:inline-flex',
                            isActive('/tim') && 'bg-brand-50 text-brand-700',
                        )}
                    >
                        Tim
                    </Link>
                    {whatsapp.configured && whatsapp.url ? (
                        <a
                            href={whatsapp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700 xl:inline-flex"
                        >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            WhatsApp
                        </a>
                    ) : null}
                    <Button asChild size="sm" className="h-9 rounded-lg px-4">
                        <Link href="/kontak">
                            Konsultasi
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-navy transition-colors hover:bg-ice md:hidden"
                            aria-label="Buka menu navigasi"
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="left-auto top-0 h-full max-h-none w-[86vw] max-w-xs translate-x-0 translate-y-0 gap-0 rounded-none border-l border-border p-0">
                        <DialogTitle className="sr-only">Menu navigasi</DialogTitle>
                        <div className="flex h-16 items-center border-b border-border px-5">
                            <Logo name={site.brand.name ?? 'DevCraft Studio'} />
                        </div>
                        <nav aria-label="Navigasi mobile" className="flex flex-col gap-0.5 p-4">
                            {NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    aria-current={isActive(item.href) ? 'page' : undefined}
                                    className={cn(
                                        'rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700',
                                        isActive(item.href) && 'bg-brand-50 text-brand-700',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto space-y-2 border-t border-border p-4">
                            <Button asChild className="w-full">
                                <Link href="/kontak" onClick={() => setOpen(false)}>
                                    Konsultasi proyek
                                </Link>
                            </Button>
                            {whatsapp.configured && whatsapp.url ? (
                                <a
                                    href={whatsapp.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-navy"
                                >
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    Chat WhatsApp
                                </a>
                            ) : null}
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
                                {SECONDARY_NAV.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="transition-colors hover:text-brand-700"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    );
}
