import { Link, router } from '@inertiajs/react';
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Star, Upload } from 'lucide-react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/format';

interface PackageRow {
    id: number;
    name: string;
    slug: string;
    status: string;
    status_label: string;
    price_display: string;
    billing_label: string;
    is_featured: boolean;
    addons_count: number;
    updated_at: string | null;
    public_url: string;
}

export default function PackagesIndex({ packages }: { packages: PackageRow[]; statuses: Record<string, string> }) {
    const togglePublish = (item: PackageRow) => {
        const url = item.status === 'published' ? `/admin/packages/${item.slug}/unpublish` : `/admin/packages/${item.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Paket"
            description="Paket hanya dapat dipublikasikan jika harga sudah diisi atau billing type diset ke custom quotation."
            actions={
                <Button asChild className="rounded-xl">
                    <Link href="/admin/packages/create">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Paket baru
                    </Link>
                </Button>
            }
            breadcrumbs={[{ label: 'Paket' }]}
        >
            <Panel bodyClassName="p-0">
                {packages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Paket</th>
                                    <th>Harga</th>
                                    <th>Billing</th>
                                    <th>Add-on</th>
                                    <th>Status</th>
                                    <th>Diperbarui</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="flex items-start gap-2">
                                                <div>
                                                    <Link href={`/admin/packages/${item.slug}/edit`} className="font-medium text-navy hover:text-brand-700">
                                                        {item.name}
                                                    </Link>
                                                    <span className="block text-xs text-muted-foreground">/{item.slug}</span>
                                                </div>
                                                {item.is_featured ? <Star className="mt-0.5 h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Featured" /> : null}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap text-sm font-medium text-ink">{item.price_display}</td>
                                        <td className="whitespace-nowrap text-xs text-muted-foreground">{item.billing_label}</td>
                                        <td className="text-xs text-muted-foreground">{item.addons_count}</td>
                                        <td>
                                            <StatusBadge value={item.status} label={item.status_label} />
                                        </td>
                                        <td className="whitespace-nowrap text-xs text-muted-foreground">{formatShortDate(item.updated_at)}</td>
                                        <td>
                                            <div className="flex flex-wrap items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/packages/${item.slug}/edit`}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePublish(item)}
                                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                                                        item.status === 'published' ? 'text-amber-700 hover:bg-amber-50' : 'text-success hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    {item.status === 'published' ? (
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
                                                {item.status === 'published' ? (
                                                    <a
                                                        href={item.public_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-ice"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Buka
                                                    </a>
                                                ) : null}
                                                <ConfirmDelete
                                                    url={`/admin/packages/${item.slug}`}
                                                    title="Hapus paket ini?"
                                                    description={`“${item.name}” beserta add-on-nya akan dihapus. Tindakan ini dicatat pada activity log.`}
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
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada paket</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Buat paket pertama. Gunakan custom quotation jika harga belum bisa ditetapkan.
                        </p>
                        <Button asChild className="mt-5 rounded-xl">
                            <Link href="/admin/packages/create">Tambah paket</Link>
                        </Button>
                    </div>
                )}
            </Panel>

            <Panel className="mt-5" title="Aturan harga" bodyClassName="p-5">
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li>• Placeholder seperti “Rp X” atau “mulai dari” tanpa angka akan ditolak saat disimpan.</li>
                    <li>• Paket tanpa harga hanya bisa dipublikasikan jika billing type diset ke “Custom quotation”.</li>
                    <li>• Paket yang belum dipublikasikan tidak tampil pada halaman paket maupun formulir kontak.</li>
                </ul>
                <div className="mt-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    <Link href="/paket" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-700 hover:underline">
                        Lihat halaman paket publik
                    </Link>
                </div>
            </Panel>
        </AdminLayout>
    );
}
