import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import EmptyState from '@/components/site/empty-state';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import type { PackageDetail, Seo, SharedProps } from '@/types';

function ListCell({ items, empty }: { items: string[]; empty: string }) {
    if (items.length === 0) {
        return <span className="text-xs text-muted-foreground">{empty}</span>;
    }

    return (
        <ul className="space-y-1.5 text-sm text-ink/80">
            {items.map((item) => (
                <li key={item} className="flex gap-1.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default function PackagesCompare({ packages, seo }: { packages: PackageDetail[]; seo: Seo }) {
    const { whatsapp } = usePage<SharedProps>().props;
    const { track } = useAnalytics();

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-14">
                    <Breadcrumbs
                        items={[{ label: 'Beranda', href: '/' }, { label: 'Paket', href: '/paket' }, { label: 'Perbandingan' }]}
                    />
                    <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Perbandingan paket</h1>
                    <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Fokus pada perbedaan ruang lingkup, bukan hanya harga. Semua nilai bersifat indikatif sampai penawaran resmi
                        diterbitkan.
                    </p>
                </div>
            </section>

            <Section tone="white">
                {packages.length === 0 ? (
                    <EmptyState
                        title="Belum ada paket untuk dibandingkan"
                        description="Paket akan tampil setelah dipublikasikan melalui admin."
                        action={
                            <Button asChild className="rounded-xl">
                                <Link href="/kontak">Diskusikan kebutuhan</Link>
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto rounded-2xl border border-border lg:block">
                            <table className="w-full min-w-[52rem] border-collapse text-left align-top text-sm">
                                <caption className="sr-only">Perbandingan paket layanan DevCraft Studio</caption>
                                <thead>
                                    <tr className="bg-ice">
                                        <th scope="col" className="sticky left-0 z-10 w-40 border-b border-border bg-ice px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Aspek
                                        </th>
                                        {packages.map((pkg) => (
                                            <th key={pkg.id} scope="col" className="min-w-[15rem] border-b border-l border-border px-4 py-4">
                                                <p className="font-display text-base font-bold text-navy">{pkg.name}</p>
                                                <p className="mt-1 text-xs font-normal text-muted-foreground">{pkg.target_audience}</p>
                                                <p className="mt-2 font-display text-lg font-bold text-brand-700">{pkg.price_display}</p>
                                                <p className="text-[0.7rem] font-normal text-muted-foreground">{pkg.billing_label}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Termasuk
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4">
                                                <ListCell items={pkg.included_items} empty="Dijelaskan pada penawaran" />
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Tidak termasuk
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4">
                                                <ListCell items={pkg.excluded_items} empty="Tidak ada catatan" />
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Batasan
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4">
                                                <ListCell items={pkg.limitations} empty="Dijelaskan pada penawaran" />
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Timeline
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4 text-sm text-ink/80">
                                                {pkg.timeline_label ?? 'Ditentukan setelah discovery'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Revisi
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4 text-sm text-ink/80">
                                                {pkg.revision_policy ?? 'Diatur pada penawaran'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Aksi
                                        </th>
                                        {packages.map((pkg) => (
                                            <td key={pkg.id} className="border-l border-t border-border px-4 py-4">
                                                <Button asChild size="sm" className="rounded-lg">
                                                    <Link
                                                        href={`/kontak?paket=${pkg.slug}`}
                                                        onClick={() =>
                                                            track('package_cta_click', {
                                                                entity_type: 'package',
                                                                entity_id: pkg.id,
                                                                metadata: { package_slug: pkg.slug, source: 'compare' },
                                                            })
                                                        }
                                                    >
                                                        Konsultasi
                                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-5 lg:hidden">
                            {packages.map((pkg) => (
                                <article key={pkg.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-display text-lg font-bold text-navy">{pkg.name}</h2>
                                            <p className="text-xs text-muted-foreground">{pkg.target_audience}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display text-base font-bold text-brand-700">{pkg.price_display}</p>
                                            <p className="text-[0.7rem] text-muted-foreground">{pkg.billing_label}</p>
                                        </div>
                                    </div>

                                    <dl className="mt-4 space-y-4 text-sm">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Termasuk</dt>
                                            <dd className="mt-1.5">
                                                <ListCell items={pkg.included_items} empty="Dijelaskan pada penawaran" />
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tidak termasuk</dt>
                                            <dd className="mt-1.5">
                                                <ListCell items={pkg.excluded_items} empty="Tidak ada catatan" />
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Batasan</dt>
                                            <dd className="mt-1.5">
                                                <ListCell items={pkg.limitations} empty="Dijelaskan pada penawaran" />
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</dt>
                                            <dd className="mt-1 text-ink/80">{pkg.timeline_label ?? 'Ditentukan setelah discovery'}</dd>
                                        </div>
                                    </dl>

                                    <Button asChild className="mt-5 w-full rounded-xl">
                                        <Link
                                            href={`/kontak?paket=${pkg.slug}`}
                                            onClick={() =>
                                                track('package_cta_click', {
                                                    entity_type: 'package',
                                                    entity_id: pkg.id,
                                                    metadata: { package_slug: pkg.slug, source: 'compare_mobile' },
                                                })
                                            }
                                        >
                                            Konsultasi paket ini
                                        </Link>
                                    </Button>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </Section>

            <Section tone="ice" className="pt-0 pb-20">
                <CtaBand whatsappUrl={whatsapp.configured ? whatsapp.url : null} />
            </Section>
        </SiteLayout>
    );
}
