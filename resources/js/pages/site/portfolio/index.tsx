import { Link, router, usePage } from '@inertiajs/react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import EmptyState from '@/components/site/empty-state';
import ProjectCard from '@/components/site/project-card';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import type { Paginated, ProjectCard as ProjectCardType, Seo, SharedProps } from '@/types';

interface Filters {
    q: string;
    category: string;
    technology: string;
    sort: string;
}

interface PortfolioIndexProps {
    projects: Paginated<ProjectCardType>;
    filters: Filters;
    categories: { name: string; slug: string }[];
    technologies: { name: string; slug: string }[];
    seo: Seo;
}

export default function PortfolioIndex({ projects, filters, categories, technologies, seo }: PortfolioIndexProps) {
    const { whatsapp } = usePage<SharedProps>().props;
    const { track } = useAnalytics();
    const [term, setTerm] = useState(filters.q);
    const initialRender = useRef(true);

    const apply = (patch: Partial<Filters>) => {
        const next: Record<string, string> = { ...filters, ...patch };
        const params = Object.fromEntries(Object.entries(next).filter(([, value]) => value !== '' && value !== undefined));

        track('portfolio_filter', {
            metadata: {
                category: next.category || 'all',
                technology: next.technology || 'all',
                sort: next.sort || 'latest',
            },
        });

        router.get('/portfolio', params, { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        const timeout = window.setTimeout(() => {
            if (term !== filters.q) {
                apply({ q: term });
            }
        }, 400);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term]);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        apply({ q: term });
    };

    const activeFilters = [
        filters.category ? { key: 'category' as const, label: categories.find((c) => c.slug === filters.category)?.name ?? filters.category } : null,
        filters.technology ? { key: 'technology' as const, label: technologies.find((t) => t.slug === filters.technology)?.name ?? filters.technology } : null,
        filters.q ? { key: 'q' as const, label: `“${filters.q}”` } : null,
    ].filter(Boolean) as { key: keyof Filters; label: string }[];

    const resetAll = () => {
        setTerm('');
        router.get('/portfolio', {}, { preserveState: true, replace: true });
    };

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-14">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Portfolio' }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        Portfolio dan studi kasus
                    </h1>
                    <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Setiap proyek diberi label sesuai status sebenarnya — proyek klien, internal, prototipe, open source, atau
                        eksperimen belajar. Metrik hanya ditampilkan jika benar-benar terukur.
                    </p>
                </div>
            </section>

            <Section tone="white">
                <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-5">
                    <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row" role="search">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <label htmlFor="portfolio-search" className="sr-only">
                                Cari proyek berdasarkan nama, ringkasan, atau teknologi
                            </label>
                            <Input
                                id="portfolio-search"
                                type="search"
                                value={term}
                                onChange={(event) => setTerm(event.target.value)}
                                placeholder="Cari nama proyek atau teknologi…"
                                className="pl-9"
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="relative">
                                <label htmlFor="portfolio-technology" className="sr-only">
                                    Filter teknologi
                                </label>
                                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <NativeSelect
                                    id="portfolio-technology"
                                    value={filters.technology}
                                    onChange={(event) => apply({ technology: event.target.value })}
                                    className="appearance-none pl-9 pr-8 sm:w-44"
                                >
                                    <option value="">Semua teknologi</option>
                                    {technologies.map((technology) => (
                                        <option key={technology.slug} value={technology.slug}>
                                            {technology.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <div className="relative">
                                <label htmlFor="portfolio-sort" className="sr-only">
                                    Urutkan
                                </label>
                                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <NativeSelect
                                    id="portfolio-sort"
                                    value={filters.sort}
                                    onChange={(event) => apply({ sort: event.target.value })}
                                    className="appearance-none pl-9 pr-8 sm:w-40"
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="featured">Featured</option>
                                </NativeSelect>
                            </div>

                            <Button type="submit" className="shrink-0 rounded-lg">
                                Cari
                            </Button>
                        </div>
                    </form>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => apply({ category: '' })}
                            aria-pressed={filters.category === ''}
                            className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                filters.category === '' ? 'border-brand-600 bg-brand-600 text-white' : 'border-border bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700',
                            )}
                        >
                            Semua kategori
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.slug}
                                type="button"
                                onClick={() => apply({ category: category.slug })}
                                aria-pressed={filters.category === category.slug}
                                className={cn(
                                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                                    filters.category === category.slug
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-border bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700',
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {activeFilters.length > 0 ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                            <span className="text-xs text-muted-foreground">Filter aktif:</span>
                            {activeFilters.map((filter) => (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => {
                                        if (filter.key === 'q') {
                                            setTerm('');
                                        }
                                        apply({ [filter.key]: '' } as Partial<Filters>);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                                >
                                    {filter.label}
                                    <X className="h-3 w-3" aria-hidden="true" />
                                    <span className="sr-only">Hapus filter</span>
                                </button>
                            ))}
                            <button type="button" onClick={resetAll} className="text-xs font-semibold text-brand-700 underline underline-offset-4">
                                Hapus semua
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                        {projects.meta.total > 0
                            ? `Menampilkan ${projects.meta.from ?? 0}–${projects.meta.to ?? 0} dari ${projects.meta.total} proyek`
                            : 'Tidak ada proyek yang cocok'}
                    </p>
                </div>

                {projects.data.length > 0 ? (
                    <>
                        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>

                        {projects.meta.last_page > 1 ? (
                            <nav aria-label="Navigasi halaman portfolio" className="mt-10 flex items-center justify-between gap-3">
                                {projects.links?.prev ? (
                                    <Button asChild variant="outline" className="rounded-lg">
                                        <Link href={projects.links.prev} preserveScroll>
                                            Sebelumnya
                                        </Link>
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Halaman {projects.meta.current_page} dari {projects.meta.last_page}
                                </p>
                                {projects.links?.next ? (
                                    <Button asChild variant="outline" className="rounded-lg">
                                        <Link href={projects.links.next} preserveScroll>
                                            Berikutnya
                                        </Link>
                                    </Button>
                                ) : (
                                    <span />
                                )}
                            </nav>
                        ) : null}
                    </>
                ) : (
                    <div className="mt-6">
                        <EmptyState
                            title="Tidak ada proyek untuk filter ini"
                            description="Coba hapus salah satu filter, gunakan kata kunci lain, atau lihat seluruh portfolio."
                            action={
                                <Button type="button" onClick={resetAll} className="rounded-xl">
                                    Hapus semua filter
                                </Button>
                            }
                        />
                    </div>
                )}
            </Section>

            <Section tone="ice" className="pt-0 pb-20">
                <CtaBand whatsappUrl={whatsapp.configured ? whatsapp.url : null} />
            </Section>
        </SiteLayout>
    );
}
