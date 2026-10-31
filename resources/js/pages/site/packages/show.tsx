import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, MessageCircle, Minus, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import type { DesignBriefSummary, PackageCard as PackageCardType, PackageDetail, Seo, SharedProps } from '@/types';

export default function PackageShow({
    package: pkg,
    otherPackages,
    designBrief,
    seo,
}: {
    package: PackageDetail;
    otherPackages: PackageCardType[];
    designBrief: DesignBriefSummary | null;
    seo: Seo;
}) {
    const { whatsapp } = usePage<SharedProps>().props;
    const { track } = useAnalytics();

    useEffect(() => {
        track('package_view', { entity_type: 'package', entity_id: pkg.id, metadata: { package_slug: pkg.slug } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pkg.id]);

    const consultationHref = `/kontak?paket=${pkg.slug}${designBrief ? `&desain=${encodeURIComponent(designBrief.token)}` : ''}`;

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-14">
                    <Breadcrumbs
                        items={[{ label: 'Beranda', href: '/' }, { label: 'Paket', href: '/paket' }, { label: pkg.name }]}
                    />
                    {designBrief ? (
                        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-xs text-ink/75">
                            <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
                            <span>
                                Anda sedang melihat paket untuk preview <strong className="text-navy">{designBrief.brand_name}</strong>
                                {designBrief.template_label ? ` (${designBrief.template_label})` : ''}.
                            </span>
                            <Link href={designBrief.preview_url} className="font-semibold text-brand-700 hover:underline">
                                Lihat preview
                            </Link>
                        </div>
                    ) : null}
                    <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
                        <div>
                            {pkg.target_audience ? (
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{pkg.target_audience}</p>
                            ) : null}
                            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{pkg.name}</h1>
                            {pkg.tagline ? <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">{pkg.tagline}</p> : null}
                        </div>
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimasi biaya</p>
                            <p className="mt-1 font-display text-2xl font-bold text-navy">{pkg.price_display}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {pkg.billing_label}
                                {pkg.timeline_label ? ` · ${pkg.timeline_label}` : ''}
                            </p>
                            <div className="mt-4 space-y-2">
                                <Button asChild className="w-full rounded-xl">
                                    <Link
                                        href={consultationHref}
                                        onClick={() => track('package_cta_click', { entity_type: 'package', entity_id: pkg.id, metadata: { package_slug: pkg.slug, source: 'package_page' } })}
                                    >
                                        Konsultasi paket ini
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                                {whatsapp.configured && whatsapp.url ? (
                                    <a
                                        href={whatsapp.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => track('whatsapp_click', { metadata: { source: 'package_page', package_slug: pkg.slug } })}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                                    >
                                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                        Chat WhatsApp
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Section tone="white">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-white p-6">
                        <h2 className="font-display text-lg font-bold text-navy">Termasuk</h2>
                        {pkg.included_items.length > 0 ? (
                            <ul className="mt-4 space-y-2.5 text-sm text-ink/80">
                                {pkg.included_items.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">Rincian akan dilengkapi pada penawaran.</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-6">
                        <h2 className="font-display text-lg font-bold text-navy">Tidak termasuk</h2>
                        {pkg.excluded_items.length > 0 ? (
                            <ul className="mt-4 space-y-2.5 text-sm text-ink/80">
                                {pkg.excluded_items.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">Tidak ada pengecualian khusus yang dicatat.</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-6">
                        <h2 className="font-display text-lg font-bold text-navy">Batasan</h2>
                        {pkg.limitations.length > 0 ? (
                            <ul className="mt-4 space-y-2.5 text-sm text-ink/80">
                                {pkg.limitations.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">Batasan akan ditulis pada penawaran.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-ice p-6">
                        <h2 className="font-display text-lg font-bold text-navy">Timeline dan revisi</h2>
                        {pkg.timeline_label ? (
                            <p className="mt-3 text-sm text-ink/80">
                                <span className="font-semibold">Estimasi:</span> {pkg.timeline_label}
                            </p>
                        ) : null}
                        {pkg.revision_policy ? <p className="mt-2 text-sm leading-relaxed text-ink/75">{pkg.revision_policy}</p> : null}
                        <p className="mt-3 text-xs text-muted-foreground">
                            Estimasi bersifat rentang, bukan tanggal pasti. Perubahan ruang lingkup memengaruhi durasi.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-6">
                        <h2 className="font-display text-lg font-bold text-navy">Add-on</h2>
                        {pkg.addons.length > 0 ? (
                            <ul className="mt-4 space-y-3 text-sm">
                                {pkg.addons.map((addon) => (
                                    <li key={addon.id} className="rounded-xl border border-border p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-semibold text-navy">{addon.name}</p>
                                            {addon.price_label ? <span className="shrink-0 text-xs font-medium text-brand-700">{addon.price_label}</span> : null}
                                        </div>
                                        {addon.description ? <p className="mt-1 text-muted-foreground">{addon.description}</p> : null}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">
                                Add-on dapat disusun sesuai kebutuhan. Sampaikan saat konsultasi.
                            </p>
                        )}
                    </div>
                </div>
            </Section>

            {otherPackages.length > 0 ? (
                <Section tone="ice">
                    <h2 className="font-display text-xl font-bold text-navy">Paket lain yang mungkin sesuai</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {otherPackages.map((other) => (
                            <Link
                                key={other.id}
                                href={other.url}
                                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-card"
                            >
                                <div>
                                    <p className="font-display font-bold text-navy">{other.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{other.price_display}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-brand-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                </Section>
            ) : null}

            <Section tone="white" className="pt-0 pb-20">
                <CtaBand
                    title="Masih ragu memilih paket?"
                    description="Kirim kebutuhan Anda. Jika tidak ada paket yang cocok, kami akan menyusun ruang lingkup khusus."
                    whatsappUrl={whatsapp.configured ? whatsapp.url : null}
                />
            </Section>
        </SiteLayout>
    );
}
