import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Info, Sparkles } from 'lucide-react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import EmptyState from '@/components/site/empty-state';
import PackageCard from '@/components/site/package-card';
import { Section, SectionHeading } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { DesignBriefSummary, PackageCard as PackageCardType, Seo, SharedProps } from '@/types';

export default function PackagesIndex({
    packages,
    designBrief,
    seo,
}: {
    packages: PackageCardType[];
    designBrief: DesignBriefSummary | null;
    seo: Seo;
}) {
    const { whatsapp } = usePage<SharedProps>().props;

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-16">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Paket' }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        Paket dengan ruang lingkup yang bisa dibandingkan
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Setiap paket mencantumkan apa yang termasuk, apa yang tidak termasuk, dan batasannya. Harga berlabel
                        &ldquo;mulai dari&rdquo; adalah estimasi awal, bukan harga final.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="rounded-xl">
                            <Link href="/paket/bandingkan">
                                Bandingkan paket
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/kontak">Butuh ruang lingkup khusus</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Section tone="white">
                {designBrief ? (
                    <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-semibold text-navy">
                                    Paket untuk preview {designBrief.brand_name}
                                    {designBrief.template_label ? ` · ${designBrief.template_label}` : ''}
                                </p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                    Saat memilih paket, konteks desain Anda ikut dibawa ke formulir konsultasi.
                                </p>
                            </div>
                        </div>
                        <Link href={designBrief.preview_url} className="shrink-0 text-xs font-semibold text-brand-700 hover:underline">
                            Kembali ke preview
                        </Link>
                    </div>
                ) : null}
                {packages.length > 0 ? (
                    <>
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {packages.map((pkg) => (
                                <PackageCard key={pkg.id} package={pkg} designToken={designBrief?.token} />
                            ))}
                        </div>
                        <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-ice p-4 text-sm text-ink/75">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                            <p>
                                Tidak menemukan paket yang sesuai? Kebutuhan dengan integrasi khusus, multi-bahasa, atau aturan bisnis
                                kompleks biasanya masuk kategori custom quotation.
                            </p>
                        </div>
                    </>
                ) : (
                    <EmptyState
                        title="Paket belum dipublikasikan"
                        description="Paket akan tampil setelah harga dan ruang lingkupnya ditetapkan. Sementara itu, Anda tetap dapat mendiskusikan kebutuhan secara langsung."
                        action={
                            <Button asChild className="rounded-xl">
                                <Link href="/kontak">Diskusikan kebutuhan</Link>
                            </Button>
                        }
                    />
                )}
            </Section>

            <Section tone="ice">
                <SectionHeading
                    eyebrow="Cara membaca paket"
                    title="Yang perlu Anda periksa sebelum memilih"
                    description="Harga bukan satu-satunya pembeda. Batas ruang lingkup dan jumlah revisi menentukan total biaya sebenarnya."
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Deliverables', body: 'Pastikan daftar hasil kerja sesuai kebutuhan Anda, bukan hanya jumlah halaman.' },
                        { title: 'Batas ruang lingkup', body: 'Perhatikan jumlah halaman, modul, atau integrasi yang termasuk.' },
                        { title: 'Revisi', body: 'Definisi revisi menentukan apakah permintaan perubahan dihitung tambahan.' },
                        { title: 'Biaya pihak ketiga', body: 'Domain, hosting, dan layanan berbayar lain biasanya di luar paket.' },
                    ].map((item) => (
                        <div key={item.title} className="rounded-2xl border border-border bg-white p-5">
                            <h3 className="font-display text-base font-bold text-navy">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section tone="white" className="pt-0 pb-20">
                <CtaBand whatsappUrl={whatsapp.configured ? whatsapp.url : null} />
            </Section>
        </SiteLayout>
    );
}
