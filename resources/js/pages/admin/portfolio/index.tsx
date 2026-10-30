import { Link, router } from '@inertiajs/react';
import { ExternalLink, Eye, Pencil, Plus, Search, Star, Upload, EyeOff } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Pagination from '@/components/admin/pagination';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatShortDate } from '@/lib/format';

interface PortfolioRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    status_label: string;
    type_label: string;
    is_featured: boolean;
    media_count: number;
    published_at: string | null;
    updated_at: string | null;
    public_url: string;
}

export default function PortfolioIndex({
    projects,
    filters,
    statuses,
    types,
}: {
    projects: { data: PortfolioRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string; status: string; type: string };
    statuses: Record<string, string>;
    types: Record<string, string>;
}) {
    const [term, setTerm] = useState(filters.q);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/portfolio', { ...filters, q: term }, { preserveState: true, preserveScroll: true });
    };

    const togglePublish = (project: PortfolioRow) => {
        const url = project.status === 'published' ? `/admin/portfolio/${project.slug}/unpublish` : `/admin/portfolio/${project.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Portfolio"
            description="Setiap proyek wajib memiliki klasifikasi jujur. Draft tidak tampil di situs publik."
            actions={
                <Button asChild className="rounded-xl">
                    <Link href="/admin/portfolio/create">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Proyek baru
                    </Link>
                </Button>
            }
            breadcrumbs={[{ label: 'Portfolio' }]}
        >
            <Panel bodyClassName="p-4 sm:p-5">
                <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row" role="search">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            placeholder="Cari judul proyek…"
                            aria-label="Cari proyek"
                            className="pl-9"
                        />
                    </div>
                    <NativeSelect
                        value={filters.status}
                        onChange={(event) => router.get('/admin/portfolio', { ...filters, status: event.target.value }, { preserveState: true })}
                        aria-label="Filter status"
                        className="w-full sm:w-auto"
                    >
                        <option value="">Semua status</option>
                        {Object.entries(statuses).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect
                        value={filters.type}
                        onChange={(event) => router.get('/admin/portfolio', { ...filters, type: event.target.value }, { preserveState: true })}
                        aria-label="Filter tipe proyek"
                        className="w-full sm:w-auto"
                    >
                        <option value="">Semua tipe</option>
                        {Object.entries(types).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </NativeSelect>
                    <Button type="submit" className="rounded-lg">
                        Cari
                    </Button>
                </form>
            </Panel>

            <Panel className="mt-5" bodyClassName="p-0">
                {projects.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th>Proyek</th>
                                        <th>Tipe</th>
                                        <th>Status</th>
                                        <th>Media</th>
                                        <th>Diperbarui</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.data.map((project) => (
                                        <tr key={project.id}>
                                            <td>
                                                <div className="flex items-start gap-2">
                                                    <div>
                                                        <Link href={`/admin/portfolio/${project.slug}/edit`} className="font-medium text-navy hover:text-brand-700">
                                                            {project.title}
                                                        </Link>
                                                        <span className="block text-xs text-muted-foreground">/{project.slug}</span>
                                                    </div>
                                                    {project.is_featured ? (
                                                        <Star className="mt-0.5 h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{project.type_label}</td>
                                            <td>
                                                <StatusBadge value={project.status} label={project.status_label} />
                                            </td>
                                            <td className="text-xs text-muted-foreground">{project.media_count}</td>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{formatShortDate(project.updated_at)}</td>
                                            <td>
                                                <div className="flex flex-wrap items-center justify-end gap-1">
                                                    <Link
                                                        href={`/admin/portfolio/${project.slug}/edit`}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Edit
                                                    </Link>
                                                    <Link
                                                        href={`/admin/portfolio/${project.slug}/preview`}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-ice"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Preview
                                                    </Link>
                                                    {project.status === 'published' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePublish(project)}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                                                        >
                                                            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Unpublish
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePublish(project)}
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-success hover:bg-emerald-50"
                                                        >
                                                            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Publish
                                                        </button>
                                                    )}
                                                    {project.status === 'published' ? (
                                                        <a
                                                            href={project.public_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-ice"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Buka
                                                        </a>
                                                    ) : null}
                                                    <ConfirmDelete
                                                        url={`/admin/portfolio/${project.slug}`}
                                                        title="Hapus proyek ini?"
                                                        description={`“${project.title}” akan dipindahkan ke trash (soft delete). Tindakan ini dicatat pada activity log.`}
                                                        triggerLabel="Hapus"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 pb-4 sm:px-5">
                            <Pagination meta={{ ...projects.meta, total: projects.meta.total }} basePath="/admin/portfolio" filters={filters} />
                        </div>
                    </>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada proyek</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Tambahkan proyek pertama. Publikasikan hanya setelah kontribusi, tautan, dan klasifikasinya terverifikasi.
                        </p>
                        <Button asChild className="mt-5 rounded-xl">
                            <Link href="/admin/portfolio/create">Tambah proyek</Link>
                        </Button>
                    </div>
                )}
            </Panel>
        </AdminLayout>
    );
}
