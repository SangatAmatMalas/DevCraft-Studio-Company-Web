import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ExternalLink, Github, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import ProjectCard from '@/components/site/project-card';
import ProjectVisual from '@/components/site/project-visual';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatDate } from '@/lib/format';
import type { ProjectCard as ProjectCardType, ProjectDetail, Seo, SharedProps } from '@/types';

interface ProjectShowProps {
    project: ProjectDetail;
    relatedProjects: ProjectCardType[];
    latestProjects: ProjectCardType[];
    whatsappUrl: string | null;
    preview?: boolean;
    seo: Seo;
}

export default function ProjectShow({ project, relatedProjects, latestProjects, whatsappUrl, preview = false, seo }: ProjectShowProps) {
    const { site, whatsapp } = usePage<SharedProps>().props;
    const { track } = useAnalytics();

    useEffect(() => {
        if (!preview) {
            track('portfolio_view', { entity_type: 'portfolio', entity_id: project.id, metadata: { project_slug: project.slug } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const timeline =
        project.started_at || project.completed_at
            ? [project.started_at ? formatDate(project.started_at) : null, project.completed_at ? formatDate(project.completed_at) : 'sekarang']
                  .filter(Boolean)
                  .join(' — ')
            : null;

    const gallery = project.gallery.filter((media) => media.alt);

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            {preview ? (
                <div className="border-b border-amber-200 bg-amber-50">
                    <div className="container-page flex flex-col items-start justify-between gap-2 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
                        <p>
                            <span className="font-semibold">Mode preview.</span> Halaman ini belum dipublikasikan dan tidak terlihat oleh pengunjung.
                        </p>
                        <Link href="/admin/portfolio" className="font-semibold underline underline-offset-4">
                            Kembali ke admin
                        </Link>
                    </div>
                </div>
            ) : null}

            <section className="border-b border-border bg-white pb-10 pt-8">
                <div className="container-page">
                    <Breadcrumbs
                        items={[
                            { label: 'Beranda', href: '/' },
                            { label: 'Portfolio', href: '/portfolio' },
                            { label: project.title },
                        ]}
                    />

                    <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                                    {project.type_label}
                                </span>
                                <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {project.status_label}
                                </span>
                                {project.is_featured ? (
                                    <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-medium text-white">Featured</span>
                                ) : null}
                            </div>

                            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{project.title}</h1>
                            <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">{project.excerpt}</p>

                            <p className="mt-4 rounded-lg border border-border bg-ice px-3 py-2 text-xs leading-relaxed text-slate-600">
                                <span className="font-semibold text-navy">Klasifikasi:</span> {project.type_description}
                            </p>

                            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                                {project.client_name ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Klien</dt>
                                        <dd className="mt-1 font-medium text-navy">{project.client_name}</dd>
                                    </div>
                                ) : null}
                                {timeline ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Periode</dt>
                                        <dd className="mt-1 flex items-center gap-1.5 font-medium text-navy">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            {timeline}
                                        </dd>
                                    </div>
                                ) : null}
                                {project.categories.length > 0 ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</dt>
                                        <dd className="mt-1 font-medium text-navy">{project.categories.map((category) => category.name).join(', ')}</dd>
                                    </div>
                                ) : null}
                                {project.technologies.length > 0 ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teknologi</dt>
                                        <dd className="mt-1 flex flex-wrap gap-1.5">
                                            {project.technologies.map((technology) => (
                                                <span key={technology.slug} className="rounded-md border border-border bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                                                    {technology.name}
                                                </span>
                                            ))}
                                        </dd>
                                    </div>
                                ) : null}
                            </dl>

                            {project.repository_url || project.demo_url ? (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {project.demo_url ? (
                                        <a
                                            href={project.demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                                        >
                                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                            Buka demo
                                        </a>
                                    ) : null}
                                    {project.repository_url ? (
                                        <a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-ice"
                                        >
                                            <Github className="h-4 w-4" aria-hidden="true" />
                                            Repository
                                        </a>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
                            <div className="aspect-[16/11]">
                                <ProjectVisual project={project} size="hero" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
                    <div className="space-y-8">
                        {project.problem ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Masalah dan konteks</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{project.problem}</p>
                            </div>
                        ) : null}

                        {project.goals.length > 0 ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Tujuan</h2>
                                <ul className="mt-3 space-y-2">
                                    {project.goals.map((goal) => (
                                        <li key={goal} className="flex items-start gap-2 rounded-xl border border-border bg-ice p-3 text-sm text-ink/80">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                                            {goal}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {project.solution ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Solusi dan fitur utama</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{project.solution}</p>
                            </div>
                        ) : null}

                        {project.sections.map((section) => (
                            <div key={section.id}>
                                <h2 className="font-display text-xl font-bold text-navy">{section.heading}</h2>
                                {section.body ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{section.body}</p> : null}
                            </div>
                        ))}

                        {project.role_summary ? (
                            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
                                <h2 className="font-display text-lg font-bold text-navy">Peran dan kontribusi</h2>
                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">{project.role_summary}</p>
                            </div>
                        ) : null}

                        {project.outcome ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Hasil</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{project.outcome}</p>
                            </div>
                        ) : null}

                        {project.description ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Catatan proyek</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{project.description}</p>
                            </div>
                        ) : null}

                        {gallery.length > 0 ? (
                            <div>
                                <h2 className="font-display text-xl font-bold text-navy">Galeri</h2>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {gallery.map((media) => (
                                        <figure key={media.id} className="overflow-hidden rounded-xl border border-border">
                                            <img src={media.url} alt={media.alt} loading="lazy" className="h-full w-full object-cover" />
                                            {media.caption ? <figcaption className="p-3 text-xs text-muted-foreground">{media.caption}</figcaption> : null}
                                        </figure>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                            <h2 className="font-display text-lg font-bold text-navy">Punya kebutuhan serupa?</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Ceritakan konteks Anda. Brief akan membawa referensi proyek ini agar diskusi lebih cepat.
                            </p>
                            <div className="mt-4 space-y-2">
                                <Button asChild className="w-full rounded-xl">
                                    <Link
                                        href={`/kontak?proyek=${project.slug}`}
                                        onClick={() =>
                                            track('portfolio_cta_click', {
                                                entity_type: 'portfolio',
                                                entity_id: project.id,
                                                metadata: { project_slug: project.slug, source: 'project_page' },
                                            })
                                        }
                                    >
                                        Diskusikan proyek serupa
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                                {whatsapp.configured && whatsappUrl ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => track('whatsapp_click', { metadata: { source: 'project_page', project_slug: project.slug } })}
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
                                        onClick={() => track('booking_click', { entity_type: 'portfolio', entity_id: project.id, metadata: { source: 'project_page', project_slug: project.slug } })}
                                        className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                                    >
                                        {site.conversion.booking_label || 'Jadwalkan konsultasi'}
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-ice p-6 text-sm">
                            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Catatan kejujuran</h2>
                            <p className="mt-2 leading-relaxed text-ink/75">
                                Kami tidak menampilkan metrik, testimoni, atau tautan yang belum dapat diverifikasi. Jika sebuah informasi belum
                                tersedia, bagian tersebut tidak ditampilkan.
                            </p>
                            <Link href="/portfolio" className="link-arrow mt-4">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Semua portfolio
                            </Link>
                        </div>
                    </aside>
                </div>
            </Section>

            {relatedProjects.length > 0 ? (
                <Section tone="ice">
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="font-display text-xl font-bold text-navy">Proyek terkait</h2>
                        <Link href="/portfolio" className="link-arrow">
                            Lihat semua
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {relatedProjects.map((item) => (
                            <ProjectCard key={item.id} project={item} />
                        ))}
                    </div>
                </Section>
            ) : latestProjects.length > 0 ? (
                <Section tone="ice">
                    <h2 className="font-display text-xl font-bold text-navy">Proyek lain</h2>
                    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {latestProjects.map((item) => (
                            <ProjectCard key={item.id} project={item} />
                        ))}
                    </div>
                </Section>
            ) : null}

            <Section tone="white" className="pt-10 pb-20">
                <CtaBand
                    whatsappUrl={whatsapp.configured ? whatsappUrl : null}
                    whatsappMetadata={{ source: 'project_cta_band', project_slug: project.slug }}
                />
            </Section>
        </SiteLayout>
    );
}
