import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import Pagination from '@/components/admin/pagination';
import Panel from '@/components/admin/panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/format';

interface LogRow {
    id: number;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    user: string;
    ip_address: string | null;
    created_at: string | null;
}

const ACTION_LABELS: Record<string, string> = {
    'service.created': 'Layanan dibuat',
    'service.updated': 'Layanan diperbarui',
    'service.deleted': 'Layanan dihapus',
    'service.published': 'Layanan dipublikasikan',
    'service.unpublished': 'Layanan dijadikan draft',
    'package.created': 'Paket dibuat',
    'package.updated': 'Paket diperbarui',
    'package.deleted': 'Paket dihapus',
    'package.published': 'Paket dipublikasikan',
    'package.unpublished': 'Paket dijadikan draft',
    'portfolio.created': 'Proyek dibuat',
    'portfolio.updated': 'Proyek diperbarui',
    'portfolio.deleted': 'Proyek dihapus',
    'portfolio.published': 'Proyek dipublikasikan',
    'portfolio.unpublished': 'Proyek dijadikan draft',
    'lead.status_changed': 'Status lead diubah',
    'lead.note_added': 'Catatan lead ditambah',
    'lead.attachment_downloaded': 'Lampiran lead diunduh',
    'lead.exported': 'Lead diekspor',
    'faq.created': 'FAQ dibuat',
    'faq.updated': 'FAQ diperbarui',
    'faq.deleted': 'FAQ dihapus',
    'testimonial.created': 'Testimoni dibuat',
    'testimonial.updated': 'Testimoni diperbarui',
    'testimonial.deleted': 'Testimoni dihapus',
    'team.created': 'Anggota tim dibuat',
    'team.updated': 'Anggota tim diperbarui',
    'team.deleted': 'Anggota tim dihapus',
    'page.created': 'Halaman dibuat',
    'page.updated': 'Halaman diperbarui',
    'page.deleted': 'Halaman dihapus',
    'category.created': 'Kategori dibuat',
    'category.updated': 'Kategori diperbarui',
    'category.deleted': 'Kategori dihapus',
    'technology.created': 'Teknologi dibuat',
    'technology.updated': 'Teknologi diperbarui',
    'technology.deleted': 'Teknologi dihapus',
    'settings.updated': 'Pengaturan diperbarui',
    'account.updated': 'Akun sendiri diperbarui',
    'user.created': 'Pengguna dibuat',
    'user.updated': 'Pengguna diperbarui',
    'user.deleted': 'Pengguna dihapus',
    'user.password_reset': 'Kata sandi pengguna direset',
    'media.uploaded': 'Media diunggah',
    'media.updated': 'Media diperbarui',
    'media.deleted': 'Media dihapus',
};

export default function ActivityLogsIndex({
    logs,
    filters,
}: {
    logs: { data: LogRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string };
}) {
    const [term, setTerm] = useState(filters.q);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/activity-logs', { q: term }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Activity log"
            description="Jejak perubahan penting pada konten, pengguna, dan pengaturan untuk keperluan audit."
            breadcrumbs={[{ label: 'Activity log' }]}
        >
            <Panel bodyClassName="p-4 sm:p-5">
                <form onSubmit={submit} className="flex gap-2" role="search">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                            placeholder="Cari jenis aksi, misalnya package.published…"
                            aria-label="Cari activity log"
                            className="pl-9"
                        />
                    </div>
                    <Button type="submit" className="rounded-lg">
                        Cari
                    </Button>
                </form>
            </Panel>

            <Panel className="mt-5" bodyClassName="p-0">
                {logs.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Aksi</th>
                                        <th>Objek</th>
                                        <th>Oleh</th>
                                        <th>IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(log.created_at)}</td>
                                            <td>
                                                <span className="font-medium text-navy">{ACTION_LABELS[log.action] ?? log.action}</span>
                                                <span className="block font-mono text-[0.65rem] text-muted-foreground">{log.action}</span>
                                            </td>
                                            <td className="text-xs text-muted-foreground">
                                                {log.subject_type ? `${log.subject_type}${log.subject_id ? ` #${log.subject_id}` : ''}` : '—'}
                                            </td>
                                            <td className="text-xs text-ink">{log.user}</td>
                                            <td className="font-mono text-[0.7rem] text-muted-foreground">{log.ip_address ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 pb-4 sm:px-5">
                            <Pagination meta={logs.meta} basePath="/admin/activity-logs" filters={filters} />
                        </div>
                    </>
                ) : (
                    <p className="px-6 py-12 text-center text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
                )}
            </Panel>
        </AdminLayout>
    );
}
