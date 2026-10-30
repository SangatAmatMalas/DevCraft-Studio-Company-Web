import { Link } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus } from 'lucide-react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/format';

interface PageRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    status_label: string;
    updated_at: string | null;
    public_url: string;
}

export default function PagesIndex({ pages }: { pages: PageRow[] }) {
    return (
        <AdminLayout
            title="Halaman"
            description="Halaman statis seperti kebijakan privasi dan syarat layanan."
            actions={
                <Button asChild className="rounded-xl">
                    <Link href="/admin/pages/create">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Halaman baru
                    </Link>
                </Button>
            }
            breadcrumbs={[{ label: 'Halaman' }]}
        >
            <Panel bodyClassName="p-0">
                {pages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Halaman</th>
                                    <th>Status</th>
                                    <th>Diperbarui</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.id}>
                                        <td>
                                            <Link href={`/admin/pages/${page.slug}/edit`} className="font-medium text-navy hover:text-brand-700">
                                                {page.title}
                                            </Link>
                                            <span className="block text-xs text-muted-foreground">/{page.slug}</span>
                                        </td>
                                        <td>
                                            <StatusBadge value={page.status} label={page.status_label} />
                                        </td>
                                        <td className="whitespace-nowrap text-xs text-muted-foreground">{formatShortDate(page.updated_at)}</td>
                                        <td>
                                            <div className="flex flex-wrap items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/pages/${page.slug}/edit`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Edit
                                                </Link>
                                                {page.status === 'published' ? (
                                                    <a
                                                        href={page.public_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-ice"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Buka
                                                    </a>
                                                ) : null}
                                                <ConfirmDelete
                                                    url={`/admin/pages/${page.slug}`}
                                                    title="Hapus halaman ini?"
                                                    description={`“${page.title}” akan dihapus permanen dari situs.`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada halaman</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Buat halaman kebijakan privasi dan syarat layanan sebelum situs dipublikasikan.
                        </p>
                        <Button asChild className="mt-5 rounded-xl">
                            <Link href="/admin/pages/create">Tambah halaman</Link>
                        </Button>
                    </div>
                )}
            </Panel>
        </AdminLayout>
    );
}
