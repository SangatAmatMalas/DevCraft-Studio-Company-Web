import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import FaqAccordion from '@/components/site/faq-accordion';
import PackageCard from '@/components/site/package-card';
import { Section, SectionHeading } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import ServiceIcon from '@/components/site/service-icon';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import type { FaqItem, PackageCard as PackageCardType, Seo, ServiceCard as ServiceCardType, ServiceDetail, SharedProps } from '@/types';

interface ServiceShowProps {
    service: ServiceDetail;
    relatedServices: ServiceCardType[];
    packages: PackageCardType[];
    whatsappUrl: string | null;
    seo: Seo;
}

export default function ServiceShow({ service, relatedServices, packages, whatsappUrl, seo }: ServiceShowProps) {
    const { site, whatsapp } = usePage<SharedProps>().props;
    const { track } = useAnalytics();

    useEffect(() => {
        track('service_view', { entity_type: 'service', entity_id: service.id, metadata: { service_slug: service.slug } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service.id]);

    const faqs: FaqItem[] = service.faqs.map((faq, index) => ({
        id: index,
        question: faq.question,
        answer: faq.answer,
        category: null,
    }));

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-14">
                    <Breadcrumbs
                        items={[
                            { label: 'Beranda', href: '/' },
                            { label: 'Layanan', href: '/layanan' },
                            { label: service.title },
                        ]}
                    />
                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
                        <ServiceIcon name={service.icon_name} className="h-12 w-12 shrink-0" />
                        <div>
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{service.title}</h1>
                            <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">{service.summary}</p>
                        </div>
                    </div>
                </div>
            </section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
                    <div>
                        {service.description ? (
                            <div className="prose-site whitespace-pre-line">{service.description}</div>
                        ) : null}

                        {service.deliverables.length > 0 ? (
                            <div className="mt-10">
                                <h2 className="font-display text-xl font-bold text-navy">Yang Anda dapatkan</h2>
                                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                                    {service.deliverables.map((item) => (
                                        <li key={item} className="flex items-start gap-2 rounded-xl border border-border bg-white p-3 text-sm text-ink/80">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {service.process.length > 0 ? (
                            <div className="mt-10">
                                <h2 className="font-display text-xl font-bold text-navy">Alur pengerjaan</h2>
                                <ol className="mt-4 space-y-3">
                                    {service.process.map((step, index) => (
                                        <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-white p-4">
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-navy">{step.title}</p>
                                                {step.description ? <p className="mt-1 text-sm text-muted-foreground">{step.description}</p> : null}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ) : null}

                        {service.technologies.length > 0 ? (
                            <div className="mt-10">
                                <h2 className="font-display text-xl font-bold text-navy">Teknologi dan pendekatan</h2>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {service.technologies.map((technology) => (
                                        <li key={technology} className="rounded-lg border border-border bg-ice px-3 py-1.5 text-sm font-medium text-slate-600">
                                            {technology}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {service.cost_factors ? (
                            <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
                                <h2 className="font-display text-lg font-bold text-navy">Faktor yang memengaruhi biaya dan timeline</h2>
                                <p className="mt-2 text-sm leading-relaxed text-ink/75">{service.cost_factors}</p>
                            </div>
                        ) : null}

                        {faqs.length > 0 ? (
                            <div className="mt-10">
                                <h2 className="font-display text-xl font-bold text-navy">Pertanyaan tentang layanan ini</h2>
                                <div className="mt-4">
                                    <FaqAccordion faqs={faqs} />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                            <h2 className="font-display text-lg font-bold text-navy">Mulai dari sini</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Ceritakan kebutuhan Anda. Kami akan menjelaskan langkah berikutnya tanpa komitmen awal.
                            </p>
                            <div className="mt-5 space-y-2">
                                <Button asChild className="w-full rounded-xl">
                                    <Link href={`/kontak?layanan=${service.slug}`}>
                                        Konsultasi layanan ini
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                                {whatsapp.configured && whatsappUrl ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => track('whatsapp_click', { metadata: { source: 'service_page', service_slug: service.slug } })}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                                    >
                                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                        Chat WhatsApp
                                    </a>
                                ) : null}
                                {site.conversion.booking_url ? (
                                    <a
                                        href={site.conversion.booking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => track('booking_click', { metadata: { source: 'service_page', service_slug: service.slug } })}
                                        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                                    >
                                        {site.conversion.booking_label || 'Jadwalkan konsultasi'}
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        {relatedServices.length > 0 ? (
                            <div className="rounded-2xl border border-border bg-white p-6">
                                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Layanan lain</h2>
                                <ul className="mt-3 space-y-2.5 text-sm">
                                    {relatedServices.map((item) => (
                                        <li key={item.id}>
                                            <Link href={item.url} className="font-medium text-navy transition-colors hover:text-brand-700">
                                                {item.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </aside>
                </div>
            </Section>

            {packages.length > 0 ? (
                <Section tone="ice">
                    <SectionHeading
                        eyebrow="Paket"
                        title="Paket yang sering dipakai bersama layanan ini"
                        action={
                            <Link href="/paket/bandingkan" className="link-arrow">
                                Bandingkan semua paket
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        }
                    />
                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {packages.slice(0, 3).map((pkg) => (
                            <PackageCard key={pkg.id} package={pkg} />
                        ))}
                    </div>
                </Section>
            ) : null}

            <Section tone="white" className="pt-0 pb-20">
                <CtaBand
                    whatsappUrl={whatsapp.configured ? whatsappUrl : null}
                    whatsappMetadata={{ source: 'service_cta_band', service_slug: service.slug }}
                />
            </Section>
        </SiteLayout>
    );
}
