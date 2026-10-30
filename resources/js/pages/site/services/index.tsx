import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Code2, Gauge, Search, Sparkles, TestTube2 } from 'lucide-react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import EmptyState from '@/components/site/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import ServiceCard from '@/components/site/service-card';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { Seo, ServiceCard as ServiceCardType, SharedProps } from '@/types';

const STEPS = [
    { Icon: Search, title: 'Discover', body: 'Memetakan masalah dan batasan sebelum menyusun solusi.' },
    { Icon: ClipboardList, title: 'Plan', body: 'Ruang lingkup, prioritas, dan estimasi ditulis bersama.' },
    { Icon: Code2, title: 'Build', body: 'Implementasi bertahap dengan pembaruan progres.' },
    { Icon: TestTube2, title: 'Test', body: 'Validasi alur utama sebelum diserahkan.' },
    { Icon: Sparkles, title: 'Launch', body: 'Deploy, serah terima akses, dan dokumentasi.' },
    { Icon: Gauge, title: 'Improve', body: 'Perbaikan lanjutan berdasarkan penggunaan nyata.' },
];

export default function ServicesIndex({ services, seo }: { services: ServiceCardType[]; seo: Seo }) {
    const { whatsapp } = usePage<SharedProps>().props;

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-16">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Layanan' }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        Layanan yang disusun mengikuti masalah, bukan template
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Setiap layanan memiliki deliverables dan batasan yang jelas. Jika kebutuhan Anda tidak cocok dengan salah satunya,
                        kami akan menyusun ruang lingkup khusus.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="rounded-xl">
                            <Link href="/kontak">
                                Diskusikan kebutuhan
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/paket">Lihat paket layanan</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Section tone="white">
                {services.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} className="relative" />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Layanan sedang disiapkan"
                        description="Daftar layanan akan tampil setelah dipublikasikan melalui admin."
                    />
                )}
            </Section>

            <Section tone="ice">
                <SectionHeading
                    eyebrow="Cara kerja"
                    title="Tahapan yang sama, kedalaman menyesuaikan"
                    description="Anda akan tahu posisi pekerjaan di setiap tahap, termasuk hal yang masih menunggu keputusan."
                />
                <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {STEPS.map(({ Icon, title, body }, index) => (
                        <li key={title} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                            <div className="flex items-center justify-between">
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="mt-4 font-display text-base font-bold text-navy">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section tone="white" className="pb-20">
                <CtaBand whatsappUrl={whatsapp.configured ? whatsapp.url : null} />
            </Section>
        </SiteLayout>
    );
}
