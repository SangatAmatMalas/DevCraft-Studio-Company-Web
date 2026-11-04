import { Link, router, usePage } from '@inertiajs/react';
import { ExternalLink, Search, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import EmptyState from '@/components/site/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatDateTime } from '@/lib/format';
import { canManageLeads } from '@/lib/permissions';
import type { SharedProps } from '@/types';

interface BriefRow {
    id: number;
    token: string;
    brand_name: string;
    category: string;
    category_label: string;
    style_label: string;
    chosen_label: string | null;
    status: string;
    services_count: number;
    lead_id: number | null;
    created_at: string | null;
    expires_at: string | null;
    expired: boolean;
    result_url: string;
}

interface Props {
    briefs: { data: BriefRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string; category: string };
    categories: { key: string; label: string }[];
}

const statusLabel: Record<string, string> = {
    generated: 'Dibuat',
    selected: 'Dipilih',
    claimed: 'Jadi lead',
};

export default function DesignBriefsIndex({ briefs, filters, categories }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canOpenLeads = canManageLeads(auth.user?.role);
    const [query, setQuery] = useState(filters.q);
    const [category, setCategory] = useState(filters.category);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/design-briefs', { q: query || undefined, category: category || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout
            title="Preview desain"
            description="Brief publik yang dibuat dari generator desain. Tautan bersifat pribadi, tidak diindeks, dan kedaluwarsa setelah 30 hari."
            breadcrumbs={[{ label: 'Preview desain' }]}
        >
            <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari nama brand"
                            className="pl-9"
                        />
                    </div>
                    <NativeSelect value={category} onChange={(event) => setCategory(event.target.value)} className="sm:w-52">
                        <option value="">Semua kategori</option>
                        {categories.map((item) => (
                            <option key={item.key} value={item.key}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                    <Button type="submit" className="rounded-xl">
                        Terapkan
                    </Button>
                </form>
            </div>

            {briefs.data.length === 0 ? (
                <div className="mt-5">
                    <EmptyState
                        title="Belum ada preview desain"
                        description="Brief publik yang dibuat pengunjung akan muncul di sini."
                    />
                </div>
            ) : (
                <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="min-w-[860px] w-full text-left text-sm">
                            <thead className="border-b border-border bg-ice text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Brand & brief</th>
                                    <th className="px-5 py-3 font-semibold">Pilihan</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Dibuat</th>
                                    <th className="px-5 py-3 font-semibold">Berlaku sampai</th>
                                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {briefs.data.map((brief) => (
                                    <tr key={brief.id} className="align-top">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-navy">{brief.brand_name}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {brief.category_label} · {brief.style_label} · {brief.services_count} layanan
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-muted-foreground">{brief.chosen_label ?? 'Belum memilih layout'}</td>
                                        <td className="px-5 py-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    brief.status === 'claimed'
                                                        ? 'border-success/30 bg-success/10 text-success'
                                                        : brief.status === 'selected'
                                                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                                                          : 'border-border bg-ice text-muted-foreground'
                                                }
                                            >
                                                {statusLabel[brief.status] ?? brief.status}
                                            </Badge>
                                            {brief.lead_id && canOpenLeads ? (
                                                <Link href={`/admin/leads/${brief.lead_id}`} className="mt-1.5 block text-xs font-medium text-brand-700 hover:underline">
                                                    Lihat lead #{brief.lead_id}
                                                </Link>
                                            ) : null}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDateTime(brief.created_at)}</td>
                                        <td className="px-5 py-4 text-xs text-muted-foreground">
                                            {brief.expired ? <span className="font-medium text-danger">Kedaluwarsa</span> : formatDateTime(brief.expires_at)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {!brief.expired ? (
                                                <a
                                                    href={brief.result_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Buka
                                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
                        <p>{briefs.meta.total} brief ditemukan</p>
                        {briefs.meta.last_page > 1 ? (
                            <div className="flex items-center gap-2">
                                {briefs.meta.current_page > 1 ? (
                                    <Link
                                        href={`/admin/design-briefs?q=${encodeURIComponent(filters.q)}&category=${encodeURIComponent(filters.category)}&page=${briefs.meta.current_page - 1}`}
                                        className="rounded-md border border-border px-2.5 py-1.5 hover:bg-ice"
                                    >
                                        Sebelumnya
                                    </Link>
                                ) : null}
                                <span>
                                    Halaman {briefs.meta.current_page} / {briefs.meta.last_page}
                                </span>
                                {briefs.meta.current_page < briefs.meta.last_page ? (
                                    <Link
                                        href={`/admin/design-briefs?q=${encodeURIComponent(filters.q)}&category=${encodeURIComponent(filters.category)}&page=${briefs.meta.current_page + 1}`}
                                        className="rounded-md border border-border px-2.5 py-1.5 hover:bg-ice"
                                    >
                                        Berikutnya
                                    </Link>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
