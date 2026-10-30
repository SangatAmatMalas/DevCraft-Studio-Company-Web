import { Link, router } from '@inertiajs/react';
import { ExternalLink, EyeOff, Pencil, Plus, Search, Star, Upload } from 'lucide-react';
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

interface ServiceRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    status_label: string;
    is_featured: boolean;
    display_order: number;
    updated_at: string | null;
}

export default function ServicesIndex({
    services,
    filters,
    statuses,
}: {
    services: { data: ServiceRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string; status: string };
    statuses: Record<string, string>;
}) {
    const [term, setTerm] = useState(filters.q);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/services', { ...filters, q: term }, { preserveState: true, preserveScroll: true });
    };

    const togglePublish = (service: ServiceRow) => {
        const url = service.status === 'published' ? `/admin/services/${service.slug}/unpublish` : `/admin/services/${service.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Layanan"
            description="Layanan yang dipublikasikan muncul di navigasi dan halaman layanan."
            actions={
                <Button asChild className="rounded-xl">
                    <Link href="/admin/services/create">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Layanan baru
                    </Link>
                </Button>
            }
            breadcrumbs={[{ label: 'Layanan' }]}
        >
            <Panel bodyClassName="p-4 sm:p-5">
                <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row" role="search">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Cari layanan…" aria-label="Cari layanan" className="pl-9" />
                    </div>
                    <NativeSelect
                        value={filters.status}
                        onChange={(event) => router.get('/admin/services', { ...filters, status: event.target.value }, { preserveState: true })}
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
                    <Button type="submit" className="rounded-lg">
                        Cari
                    </Button>
                </form>
            </Panel>

            <Panel className="mt-5" bodyClassName="p-0">
                {services.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th>Layanan</th>
                                        <th>Status</th>
                                        <th>Urutan</th>
                                        <th>Diperbarui</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.data.map((service) => (
                                        <tr key={service.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <Link href={`/admin/services/${service.slug}/edit`} className="font-medium text-navy hover:text-brand-700">
                                                            {service.title}
                                                        </Link>
                                                        <span className="block text-xs text-muted-foreground">/{service.slug}</span>
                                                    </div>
                                                    {service.is_featured ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Featured" /> : null}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge value={service.status} label={service.status_label} />
                                            </td>
                                            <td className="text-xs text-muted-foreground">{service.display_order}</td>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{formatShortDate(service.updated_at)}</td>
                                            <td>
                                                <div className="flex flex-wrap items-center justify-end gap-1">
                                                    <Link href={`/admin/services/${service.slug}/edit`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePublish(service)}
                                                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                                                            service.status === 'published' ? 'text-amber-700 hover:bg-amber-50' : 'text-success hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        {service.status === 'published' ? (
                                                            <>
                                                                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Unpublish
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Publish
                                                            </>
                                                        )}
                                                    </button>
                                                    {service.status === 'published' ? (
                                                        <a
                                                            href={`/layanan/${service.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-ice"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Buka
                                                        </a>
                                                    ) : null}
                                                    <ConfirmDelete
                                                        url={`/admin/services/${service.slug}`}
                                                        title="Hapus layanan ini?"
                                                        description={`“${service.title}” akan dihapus permanen dan tidak lagi tampil di situs.`}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 pb-4 sm:px-5">
                            <Pagination meta={services.meta} basePath="/admin/services" filters={filters} />
                        </div>
                    </>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada layanan</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Buat layanan pertama. Sertakan deliverables dan faktor biaya agar pengunjung memahami cakupannya.
                        </p>
                        <Button asChild className="mt-5 rounded-xl">
                            <Link href="/admin/services/create">Tambah layanan</Link>
                        </Button>
                    </div>
                )}
            </Panel>
        </AdminLayout>
    );
}
