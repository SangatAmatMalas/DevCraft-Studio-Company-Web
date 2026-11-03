import { Link, router } from '@inertiajs/react';
import { Archive, Download, PhoneCall, Search, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import Pagination from '@/components/admin/pagination';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
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
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<'archive' | 'contacted' | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const toggle = (id: number) => {
        setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    const toggleAll = () => {
        setSelected((current) => (current.length === leads.data.length ? [] : leads.data.map((lead) => lead.id)));
    };

    const runBulk = () => {
        if (!bulkAction || selected.length === 0) {
            return;
        }

        router.patch(
            '/admin/leads/bulk',
            { action: bulkAction, ids: selected },
            {
                preserveScroll: true,
                onStart: () => setBulkProcessing(true),
                onSuccess: () => setSelected([]),
                onFinish: () => {
                    setBulkProcessing(false);
                    setBulkAction(null);
                },
            },
        );
    };

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

            {selected.length > 0 ? (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-brand-900">{selected.length} lead dipilih</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg bg-white"
                            onClick={() => setBulkAction('contacted')}
                        >
                            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                            Tandai dihubungi
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg bg-white"
                            onClick={() => setBulkAction('archive')}
                        >
                            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                            Arsipkan
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setSelected([])}>
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                            Batal
                        </Button>
                    </div>
                </div>
            ) : null}

            <Panel className="mt-5" bodyClassName="p-0">
                {leads.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={selected.length === leads.data.length}
                                                onChange={toggleAll}
                                                aria-label="Pilih semua lead di halaman ini"
                                                className="h-4 w-4 accent-brand-600"
                                            />
                                        </th>
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
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(lead.id)}
                                                    onChange={() => toggle(lead.id)}
                                                    aria-label={`Pilih ${lead.name}`}
                                                    className="h-4 w-4 accent-brand-600"
                                                />
                                            </td>
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

            <Dialog open={bulkAction !== null} onOpenChange={(open) => (!open ? setBulkAction(null) : null)}>
                <DialogContent>
                    <DialogTitle className="font-display text-base font-bold text-navy">
                        {bulkAction === 'archive' ? `Arsipkan ${selected.length} lead?` : `Tandai ${selected.length} lead sudah dihubungi?`}
                    </DialogTitle>
                    <DialogDescription className="mt-1.5 leading-relaxed">
                        {bulkAction === 'archive'
                            ? 'Lead akan dipindah ke status Archived. Data, catatan, dan lampiran tetap tersimpan.'
                            : 'Hanya waktu kontak terakhir yang dicatat. Status lead tidak berubah.'}
                    </DialogDescription>
                    <DialogFooter className="mt-5">
                        <Button type="button" variant="outline" onClick={() => setBulkAction(null)} disabled={bulkProcessing}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant={bulkAction === 'archive' ? 'destructive' : 'default'}
                            onClick={runBulk}
                            disabled={bulkProcessing}
                        >
                            {bulkProcessing ? 'Memproses…' : bulkAction === 'archive' ? 'Ya, arsipkan' : 'Ya, tandai'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
