import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ExternalLink,
    LayoutTemplate,
    Maximize2,
    MessageSquare,
    Monitor,
    Package,
    Pencil,
    Smartphone,
    Sparkles,
    Tablet,
} from 'lucide-react';
import { useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import DesignShareActions from '@/components/site/design-share-actions';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatShortDate } from '@/lib/format';
import { useAnalytics } from '@/hooks/use-analytics';
import type { DesignBriefResult, DesignVariant, Seo, SharedProps } from '@/types';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICES: { key: Device; label: string; Icon: typeof Monitor; width: string }[] = [
    { key: 'desktop', label: 'Desktop', Icon: Monitor, width: '100%' },
    { key: 'tablet', label: 'Tablet', Icon: Tablet, width: '820px' },
    { key: 'mobile', label: 'Ponsel', Icon: Smartphone, width: '390px' },
];

export default function DesignResult({ brief, seo }: { brief: DesignBriefResult; seo: Seo }) {
    const { site } = usePage<SharedProps>().props;
    const { track } = useAnalytics();
    const [previewing, setPreviewing] = useState<DesignVariant | null>(null);
    const [device, setDevice] = useState<Device>('desktop');
    const [selecting, setSelecting] = useState<string | null>(null);

    const chosen = brief.chosen;
    const chosenVariant = brief.variants.find((variant) => variant.key === chosen) ?? null;

    const select = (template: string) => {
        setSelecting(template);
        router.post(
            `/desain/${brief.token}/pilih`,
            { template },
            {
                preserveScroll: true,
                onFinish: () => setSelecting(null),
            },
        );
    };

    const openPreview = (variant: DesignVariant) => {
        setDevice('desktop');
        setPreviewing(variant);
    };

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-10 sm:py-14">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Coba desain' }]} />
                    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="eyebrow">Tiga opsi untuk {brief.brand_name}</p>
                            <h1 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                                Pilih arah desain yang paling mendekati bayangan Anda
                            </h1>
                            <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                                Dibuat dari brief {brief.category_label.toLowerCase()} dengan gaya {brief.style_label.toLowerCase()}.
                                Buka preview penuh, bandingkan, lalu pilih satu. Anda bisa lanjut konsultasi atau melihat paket — keduanya
                                tanpa kewajiban.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-white px-4 py-3 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1.5 font-semibold text-navy">
                                <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                                Preview bersifat sementara
                            </p>
                            <p className="mt-1">Tautan pribadi · tidak diindeks mesin pencari</p>
                            {brief.expires_at ? <p>Berlaku sampai {formatShortDate(brief.expires_at)}</p> : null}
                            <div className="mt-3">
                                <DesignShareActions
                                    url={typeof window === 'undefined' ? `/desain/${brief.token}` : window.location.href}
                                    title={`Opsi desain ${brief.brand_name}`}
                                    metadata={{ template: brief.chosen ?? 'all', design_category: brief.category, source: 'design_result' }}
                                    compact
                                />
                            </div>
                            <div className="mt-3 border-t border-border pt-3">
                                {brief.edit_url ? (
                                    <Link
                                        href={brief.edit_url}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                        Edit brief &amp; buat ulang preview
                                    </Link>
                                ) : (
                                    <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                                        Brief ini sudah dikirim bersama konsultasi, jadi tidak bisa diubah lagi dari tautan ini.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-y bg-white">
                <div className="container-page">
                    {chosenVariant ? (
                        <div className="mb-8 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50/50">
                            <div className="flex flex-col gap-3 border-b border-brand-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-navy">
                                            Desain pilihan Anda: {chosenVariant.label}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                            Pilihan tersimpan di tautan ini. Anda masih bisa mengganti dengan memilih opsi lain di bawah.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={chosenVariant.preview_url}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                                >
                                    Buka preview penuh
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            </div>

                            <div className="grid gap-4 p-5 md:grid-cols-2">
                                <div className="flex flex-col rounded-xl border border-border bg-white p-5">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                                        <MessageSquare className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                        Diskusikan desain ini
                                    </span>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                        Ceritakan kebutuhan dan batasan Anda. Kami bantu menerjemahkan pilihan desain menjadi ruang lingkup
                                        yang jelas, termasuk estimasi waktu dan biaya.
                                    </p>
                                    <Button asChild className="mt-4 w-full rounded-xl">
                                        <Link href={brief.lead_url}>
                                            Konsultasi desain
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                    {brief.whatsapp_url ? (
                                        <a
                                            href={brief.whatsapp_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => track('whatsapp_click', { metadata: { template: chosenVariant.key, design_category: brief.category, source: 'design_result' } })}
                                            className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                                        >
                                            Chat tentang desain ini
                                        </a>
                                    ) : null}
                                    {site.conversion.booking_url ? (
                                        <a
                                            href={site.conversion.booking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => track('booking_click', { metadata: { template: chosenVariant.key, design_category: brief.category, source: 'design_result' } })}
                                            className="mt-1.5 text-center text-xs font-semibold text-brand-700 hover:underline"
                                        >
                                            {site.conversion.booking_label || 'Jadwalkan konsultasi'}
                                        </a>
                                    ) : null}
                                </div>

                                <div className="flex flex-col rounded-xl border border-border bg-white p-5">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                                        <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                        Lihat paket &amp; estimasi
                                    </span>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                                        Bandingkan paket yang tersedia beserta batas ruang lingkupnya. Cocok jika Anda ingin melihat kisaran
                                        biaya sebelum berbicara dengan tim.
                                    </p>
                                    <Button asChild className="mt-4 w-full rounded-xl">
                                        <Link href={brief.packages_url}>
                                            Lihat paket
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 rounded-2xl border border-border bg-ice/70 p-5">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy">
                                <LayoutTemplate className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                Tiga layout, satu brief
                            </p>
                            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                                Setiap opsi memakai teks, layanan, dan warna yang sama dengan susunan berbeda. Setelah memilih, Anda
                                menentukan sendiri langkah berikutnya: konsultasi atau melihat paket.
                            </p>
                        </div>
                    )}

                    <div className="grid gap-5 lg:grid-cols-3">
                        {brief.variants.map((variant, index) => {
                            const isChosen = variant.key === chosen;

                            return (
                                <article
                                    key={variant.key}
                                    className={cn(
                                        'flex flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition-colors',
                                        isChosen ? 'border-brand-400 ring-1 ring-brand-200' : 'border-border',
                                    )}
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-ice">
                                        <iframe
                                            src={variant.embed_url}
                                            title={`Pratinjau ${variant.label}`}
                                            loading="lazy"
                                            tabIndex={-1}
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                                            style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/25 via-transparent to-transparent" />
                                        <button
                                            type="button"
                                            onClick={() => openPreview(variant)}
                                            className="absolute inset-0 flex items-end justify-center p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                        >
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm">
                                                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Buka preview
                                            </span>
                                        </button>
                                        {isChosen ? (
                                            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                                                <Check className="h-3 w-3" aria-hidden="true" />
                                                Dipilih
                                            </span>
                                        ) : (
                                            <span className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[0.7rem] font-bold text-navy">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-5">
                                        <h2 className="font-display text-lg font-bold text-navy">{variant.label}</h2>
                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{variant.description}</p>
                                        {variant.best_for ? (
                                            <p className="mt-3 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                                                Cocok untuk: {variant.best_for}
                                            </p>
                                        ) : null}

                                        <div className="mt-4 flex flex-col gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant={isChosen ? 'outline' : 'default'}
                                                onClick={() => select(variant.key)}
                                                disabled={selecting !== null || isChosen}
                                                className="w-full rounded-xl"
                                            >
                                                {isChosen ? (
                                                    <>
                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                        Desain terpilih
                                                    </>
                                                ) : selecting === variant.key ? (
                                                    'Menyimpan…'
                                                ) : (
                                                    'Pakai desain ini'
                                                )}
                                            </Button>
                                            <Link
                                                href={variant.preview_url}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-navy"
                                            >
                                                Lihat versi penuh
                                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-ice p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                            Preview ini adalah simulasi layout, bukan website final. Gambar masih placeholder dan tidak ada angka,
                            testimoni, atau klien fiktif di dalamnya. Brief disimpan maksimal 30 hari.
                        </p>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {brief.edit_url ? (
                                <Button asChild variant="outline" className="rounded-xl bg-white">
                                    <Link href={brief.edit_url}>
                                        <Pencil className="h-4 w-4" aria-hidden="true" />
                                        Edit brief
                                    </Link>
                                </Button>
                            ) : null}
                            <Button asChild variant="outline" className="rounded-xl bg-white">
                                <Link href="/desain">
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                    Buat brief baru
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <Dialog open={previewing !== null} onOpenChange={(open) => (open ? undefined : setPreviewing(null))}>
                <DialogContent className="flex h-[92vh] w-[96vw] max-w-[1400px] flex-col gap-0 overflow-hidden p-0">
                    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="pr-8">
                            <DialogTitle className="text-base font-bold text-navy">
                                {previewing?.label} — {brief.brand_name}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs">
                                Preview sementara. Gulir di dalam bingkai untuk melihat seluruh halaman.
                            </DialogDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1 rounded-lg border border-border p-1" role="group" aria-label="Ukuran pratinjau">
                                {DEVICES.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setDevice(item.key)}
                                        aria-pressed={device === item.key}
                                        title={item.label}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                                            device === item.key ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-ice',
                                        )}
                                    >
                                        <item.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            {previewing ? (
                                <>
                                    <Button asChild variant="outline" size="sm" className="rounded-lg">
                                        <Link href={previewing.preview_url}>
                                            Buka tab baru
                                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                            const variant = previewing;
                                            setPreviewing(null);
                                            select(variant.key);
                                        }}
                                        disabled={selecting !== null || previewing.key === chosen}
                                        className="rounded-lg"
                                    >
                                        {previewing.key === chosen ? 'Desain terpilih' : 'Pakai desain ini'}
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-1 justify-center overflow-hidden bg-slate-100 p-3 sm:p-5">
                        {previewing ? (
                            <iframe
                                src={previewing.embed_url}
                                title={`Preview ${previewing.label}`}
                                className="h-full rounded-lg border border-border bg-white shadow-sm transition-[width]"
                                style={{ width: DEVICES.find((item) => item.key === device)?.width ?? '100%', maxWidth: '100%' }}
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </SiteLayout>
    );
}
