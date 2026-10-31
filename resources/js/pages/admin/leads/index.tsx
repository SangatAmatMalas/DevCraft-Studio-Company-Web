import { Link, router } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import Pagination from '@/components/admin/pagination';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatDateTime } from '@/lib/format';

interface LeadRow {
    id: number;
    name: string;
    email: string;
    organization: string | null;
    status: string;
    status_label: string;
    tone: string;
    context: string | null;
    next_follow_up_at: string | null;
    follow_up_due: boolean;
    created_at: string | null;
}

export default function LeadsIndex({
    leads,
    filters,
    statuses,
}: {
    leads: { data: LeadRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string; status: string; follow_up: string; from: string; to: string };
    statuses: Record<string, string>;
}) {
    const [term, setTerm] = useState(filters.q);

    const query = (patch: Partial<typeof filters>) => {
        const next = { ...filters, q: term, ...patch };
        router.get('/admin/leads', next, { preserveState: true, preserveScroll: true });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        query({ q: term });
    };

    const reset = () => {
        setTerm('');
        router.get('/admin/leads', {}, { preserveState: true });
    };

    const exportUrl = filters.status ? `/admin/leads/export?status=${encodeURIComponent(filters.status)}` : '/admin/leads/export';

    return (
        <AdminLayout
            title="Leads"
            description="Brief yang masuk melalui formulir kontak. Data ini tidak boleh dibagikan ke pihak ketiga."
            actions={
                <Button asChild variant="outline" className="rounded-xl">
                    <a href={exportUrl}>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Ekspor CSV
                    </a>
                </Button>
            }
            breadcrumbs={[{ label: 'Leads' }]}
        >
            <Panel bodyClassName="p-4 sm:p-5">
                <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            placeholder="Cari nama, email, organisasi, atau telepon…"
                            aria-label="Cari lead"
                            className="pl-9"
                        />
                    </div>

                    <NativeSelect
                        value={filters.status}
                        onChange={(event) => query({ status: event.target.value })}
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
                        value={filters.follow_up}
                        onChange={(event) => query({ follow_up: event.target.value })}
                        aria-label="Filter follow-up"
                        className="w-full sm:w-auto"
                    >
                        <option value="">Semua lead</option>
                        <option value="due">Perlu follow-up</option>
                    </NativeSelect>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={filters.from}
                            onChange={(event) => query({ from: event.target.value })}
                            aria-label="Dari tanggal"
                            className="h-10"
                        />
                        <span className="text-xs text-muted-foreground">s/d</span>
                        <Input
                            type="date"
                            value={filters.to}
                            onChange={(event) => query({ to: event.target.value })}
                            aria-label="Sampai tanggal"
                            className="h-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" className="rounded-lg">
                            Cari
                        </Button>
                        <Button type="button" variant="ghost" className="rounded-lg" onClick={reset}>
                            Reset
                        </Button>
                    </div>
                </form>
            </Panel>

            <Panel className="mt-5" bodyClassName="p-0">
                {leads.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Organisasi</th>
                                        <th>Konteks</th>
                                        <th>Status</th>
                                        <th>Follow-up</th>
                                        <th>Masuk</th>
                                        <th className="text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.data.map((lead) => (
                                        <tr key={lead.id}>
                                            <td>
                                                <Link href={`/admin/leads/${lead.id}`} className="font-medium text-navy hover:text-brand-700">
                                                    {lead.name}
                                                </Link>
                                                <span className="block text-xs text-muted-foreground">{lead.email}</span>
                                            </td>
                                            <td className="text-xs text-muted-foreground">{lead.organization ?? '—'}</td>
                                            <td className="text-xs text-muted-foreground">{lead.context ?? '—'}</td>
                                            <td>
                                                <StatusBadge value={lead.status} label={lead.status_label} tone={lead.tone} />
                                            </td>
                                            <td className="whitespace-nowrap text-xs">
                                                {lead.next_follow_up_at ? (
                                                    <span className={lead.follow_up_due ? 'font-semibold text-danger' : 'text-muted-foreground'}>
                                                        {formatDateTime(lead.next_follow_up_at)}
                                                    </span>
                                                ) : lead.follow_up_due ? (
                                                    <span className="font-semibold text-danger">Belum dijadwalkan</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(lead.created_at)}</td>
                                            <td className="text-right">
                                                <Link
                                                    href={`/admin/leads/${lead.id}`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 pb-4 sm:px-5">
                            <Pagination meta={leads.meta} basePath="/admin/leads" filters={filters} />
                        </div>
                    </>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada lead</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Brief dari formulir kontak akan muncul di sini beserta status tindak lanjutnya.
                        </p>
                    </div>
                )}
            </Panel>
        </AdminLayout>
    );
}
