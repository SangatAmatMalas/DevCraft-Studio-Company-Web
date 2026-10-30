import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    Code2,
    Gauge,
    MessageSquare,
    Search,
    ShieldCheck,
    Sparkles,
    TestTube2,
    Wrench,
} from 'lucide-react';

import CtaBand from '@/components/site/cta-band';
import EmptyState from '@/components/site/empty-state';
import FaqAccordion from '@/components/site/faq-accordion';
import PackageCard from '@/components/site/package-card';
import ProjectCard from '@/components/site/project-card';
import { Section, SectionHeading } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import ServiceCard from '@/components/site/service-card';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { FaqItem, PackageCard as PackageCardType, ProjectCard as ProjectCardType, Seo, ServiceCard as ServiceCardType, SharedProps, TestimonialItem } from '@/types';
import { usePage } from '@inertiajs/react';

interface HomeProps {
    services: ServiceCardType[];
    projects: ProjectCardType[];
    packages: PackageCardType[];
    faqs: FaqItem[];
    testimonials: TestimonialItem[];
    technologies: { name: string; slug: string }[];
    hero: { badge: string | null; title: string | null; subtitle: string | null };
    seo: Seo;
}

const REASONS = [
    {
        Icon: MessageSquare,
        title: 'Komunikasi yang bisa diikuti',
        body: 'Progres, keputusan, dan hambatan disampaikan berkala. Anda tidak perlu menebak status pekerjaan.',
    },
    {
        Icon: ClipboardList,
        title: 'Ruang lingkup tertulis',
        body: 'Deliverables, batasan, dan jumlah revisi ditulis sejak awal agar tidak menjadi perdebatan di akhir.',
    },
    {
        Icon: ShieldCheck,
        title: 'Kualitas diuji, bukan diasumsikan',
        body: 'Alur penting diuji sebelum rilis, termasuk validasi input dan penanganan error.',
    },
    {
        Icon: Wrench,
        title: 'Siap dirawat setelah rilis',
        body: 'Dokumentasi dan struktur kode disiapkan agar tim Anda bisa melanjutkan atau meminta dukungan kami.',
    },
];

const STEPS = [
    { Icon: Search, title: 'Discover', body: 'Memahami masalah, pengguna, dan batasan nyata.' },
    { Icon: ClipboardList, title: 'Plan', body: 'Menyusun ruang lingkup, prioritas, dan estimasi.' },
    { Icon: Code2, title: 'Build', body: 'Implementasi bertahap dengan progres yang terlihat.' },
    { Icon: TestTube2, title: 'Test', body: 'Pengujian fungsi dan pengecekan lintas perangkat.' },
    { Icon: Sparkles, title: 'Launch', body: 'Deploy, serah terima akses, dan dokumentasi.' },
    { Icon: Gauge, title: 'Improve', body: 'Perbaikan dan pengembangan berdasarkan kebutuhan.' },
];

export default function Home({ services, projects, packages, faqs, testimonials, technologies, hero, seo }: HomeProps) {
    const { whatsapp } = usePage<SharedProps>().props;

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="hero-gradient relative overflow-hidden text-white">
                <div className="grid-lines absolute inset-0" aria-hidden="true" />
                <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
                            {hero.badge ?? 'Software engineering studio'}
                        </span>

                        <h1 className="mt-5 font-display text-[2.1rem] font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                            {hero.title ?? 'Ubah ide menjadi produk digital yang benar-benar dipakai.'}
                        </h1>

                        <p className="mt-5 max-w-xl text-[0.975rem] leading-relaxed text-slate-300 sm:text-base">
                            {hero.subtitle}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg" className="rounded-xl bg-brand-600 px-6 hover:bg-brand-500">
                                <Link href="/kontak">
                                    Konsultasi proyek
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-xl border-white/25 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/portfolio">Lihat portfolio</Link>
                            </Button>
                        </div>

                        <dl className="mt-10 grid max-w-lg grid-cols-1 gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:grid-cols-3">
                            <div>
                                <dt className="font-semibold uppercase tracking-wide text-slate-500">Fokus</dt>
                                <dd className="mt-1 text-slate-300">Web app, API, otomasi</dd>
                            </div>
                            <div>
                                <dt className="font-semibold uppercase tracking-wide text-slate-500">Stack</dt>
                                <dd className="mt-1 text-slate-300">Laravel · React · TypeScript</dd>
                            </div>
                            <div>
                                <dt className="font-semibold uppercase tracking-wide text-slate-500">Proses</dt>
                                <dd className="mt-1 text-slate-300">Discover → Improve</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="relative" aria-hidden="true">
                        <div className="absolute -inset-6 rounded-[2rem] bg-brand-500/10 blur-2xl" />
                        <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur">
                            <div className="rounded-xl bg-navy/80 ring-1 ring-white/10">
                                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                                    <span className="h-2 w-2 rounded-full bg-red-400/70" />
                                    <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                                    <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                                    <span className="ml-2 h-4 w-40 rounded bg-white/10" />
                                </div>
                                <div className="space-y-3 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-3 w-24 rounded bg-white/20" />
                                        <div className="h-6 w-20 rounded-md bg-brand-500/80" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[0, 1, 2].map((item) => (
                                            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                                                <div className="h-2 w-10 rounded bg-white/20" />
                                                <div className="mt-2 h-4 w-12 rounded bg-white/30" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                                        <div className="flex items-end gap-1.5">
                                            {[38, 52, 44, 66, 58, 74, 62, 86].map((height, index) => (
                                                <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${height}px` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        <div className="h-2 w-28 rounded bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {technologies.length > 0 ? (
                <div className="border-b border-border bg-white">
                    <div className="container-page flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Teknologi yang kami gunakan
                        </p>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
                            {technologies.map((technology) => (
                                <li key={technology.slug}>{technology.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}

            <Section tone="white">
                <SectionHeading
                    eyebrow="Layanan"
                    title="Bantuan yang paling sering dibutuhkan"
                    description="Mulai dari kehadiran digital sederhana hingga aplikasi yang mengikuti alur kerja organisasi."
                    action={
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/layanan">
                                Semua layanan
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    }
                />
                {services.length > 0 ? (
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} className="relative" />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10">
                        <EmptyState
                            title="Layanan sedang disiapkan"
                            description="Konten layanan akan tampil di sini setelah dipublikasikan melalui admin."
                        />
                    </div>
                )}
            </Section>

            <Section tone="ice">
                <SectionHeading
                    eyebrow="Portfolio"
                    title="Pekerjaan yang bisa ditinjau"
                    description="Setiap studi kasus menjelaskan konteks, solusi, kontribusi, dan batasan proyek secara jujur."
                    action={
                        <Link href="/portfolio" className="link-arrow">
                            Semua portfolio
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    }
                />
                {projects.length > 0 ? (
                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10">
                        <EmptyState
                            title="Studi kasus sedang dikurasi"
                            description="Kami hanya menampilkan proyek yang kontribusi dan klasifikasinya sudah terverifikasi. Portfolio akan muncul di sini setelah tahap verifikasi selesai."
                            action={
                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link href="/kontak">Diskusikan kebutuhan Anda</Link>
                                </Button>
                            }
                        />
                    </div>
                )}
            </Section>

            <Section tone="white">
                <SectionHeading eyebrow="Kenapa DevCraft" title="Cara kerja yang mengurangi kejutan" />
                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {REASONS.map(({ Icon, title, body }) => (
                        <div key={title} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 font-display text-base font-bold text-navy">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section tone="navy">
                <SectionHeading
                    eyebrow="Proses"
                    title="Enam tahap yang sama untuk setiap proyek"
                    description="Tahap dapat diringkas atau diperdalam sesuai skala pekerjaan, tetapi urutannya tidak dilompati."
                    tone="dark"
                />
                <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {STEPS.map(({ Icon, title, body }, index) => (
                        <li key={title} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                            <div className="flex items-center gap-3">
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Tahap {String(index + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section tone="white">
                <SectionHeading
                    eyebrow="Paket"
                    title="Titik awal yang bisa dibandingkan"
                    description="Harga dan ruang lingkup final ditulis di penawaran. Paket di bawah membantu Anda memperkirakan cakupan."
                    action={
                        <Link href="/paket/bandingkan" className="link-arrow">
                            Bandingkan paket
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    }
                />
                {packages.length > 0 ? (
                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <PackageCard key={pkg.id} package={pkg} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-10">
                        <EmptyState
                            title="Paket belum dipublikasikan"
                            description="Paket akan tampil setelah harga dan ruang lingkupnya ditetapkan melalui admin."
                        />
                    </div>
                )}
            </Section>

            {testimonials.length > 0 ? (
                <Section tone="ice">
                    <SectionHeading eyebrow="Testimoni" title="Kata mereka yang sudah bekerja bersama kami" />
                    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <figure key={testimonial.id} className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft">
                                <blockquote className="flex-1 text-sm leading-relaxed text-ink/80">“{testimonial.quote}”</blockquote>
                                <figcaption className="mt-5 border-t border-border pt-4 text-sm">
                                    <span className="font-semibold text-navy">{testimonial.person_name}</span>
                                    {testimonial.role || testimonial.organization ? (
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {[testimonial.role, testimonial.organization].filter(Boolean).join(', ')}
                                        </span>
                                    ) : null}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </Section>
            ) : null}

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                    <SectionHeading
                        eyebrow="FAQ"
                        title="Pertanyaan yang sering muncul"
                        description="Jika pertanyaan Anda belum terjawab, kirimkan lewat halaman kontak."
                    />
                    <FaqAccordion faqs={faqs} />
                </div>
            </Section>

            <Section tone="ice" className="pb-20">
                <CtaBand
                    whatsappUrl={whatsapp.configured ? whatsapp.url : null}
                    contactHref="/kontak"
                    contactLabel="Konsultasi proyek"
                />
            </Section>
        </SiteLayout>
    );
}
