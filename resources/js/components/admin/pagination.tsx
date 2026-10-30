import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PageMeta } from '@/types';

function pageUrl(basePath: string, filters: Record<string, string>, page: number): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();

    return query ? `${basePath}?${query}` : basePath;
}

export default function Pagination({
    meta,
    basePath,
    filters = {},
}: {
    meta: PageMeta;
    basePath: string;
    filters?: Record<string, string>;
}) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const pages: (number | 'gap')[] = [];
    const current = meta.current_page;
    const last = meta.last_page;

    for (let page = 1; page <= last; page += 1) {
        if (page === 1 || page === last || Math.abs(page - current) <= 1) {
            pages.push(page);
        } else if (pages[pages.length - 1] !== 'gap') {
            pages.push('gap');
        }
    }

    return (
        <nav aria-label="Navigasi halaman" className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
                Halaman {meta.current_page} dari {meta.last_page} · {meta.total} data
            </p>

            <div className="flex items-center gap-1">
                {current > 1 ? (
                    <Link
                        href={pageUrl(basePath, filters, current - 1)}
                        preserveScroll
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600 hover:bg-ice"
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-300">
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}

                {pages.map((page, index) =>
                    page === 'gap' ? (
                        <span key={`gap-${index}`} className="px-1 text-xs text-muted-foreground">
                            …
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={pageUrl(basePath, filters, page)}
                            preserveScroll
                            aria-current={page === current ? 'page' : undefined}
                            className={cn(
                                'grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-medium',
                                page === current
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-border text-slate-600 hover:bg-ice',
                            )}
                        >
                            {page}
                        </Link>
                    ),
                )}

                {current < last ? (
                    <Link
                        href={pageUrl(basePath, filters, current + 1)}
                        preserveScroll
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-600 hover:bg-ice"
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-border text-slate-300">
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}
            </div>
        </nav>
    );
}
