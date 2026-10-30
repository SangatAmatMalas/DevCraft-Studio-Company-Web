import { useForm } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CategoryRow {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    projects_count: number;
}

export default function CategoriesIndex({ categories }: { categories: CategoryRow[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CategoryRow | null>(null);

    const form = useForm({ name: '', slug: '', type: 'portfolio', description: '', display_order: 0, is_active: true as boolean });

    const startCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ name: '', slug: '', type: 'portfolio', description: '', display_order: 0, is_active: true });
        setOpen(true);
    };

    const startEdit = (category: CategoryRow) => {
        setEditing(category);
        form.clearErrors();
        form.setData({
            name: category.name,
            slug: category.slug,
            type: 'portfolio',
            description: category.description ?? '',
            display_order: category.display_order,
            is_active: category.is_active,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setEditing(null);
            },
        };

        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/kategori/${editing.id}`, options);
        } else {
            form.post('/admin/kategori', options);
        }
    };

    return (
        <AdminLayout
            title="Kategori portfolio"
            description="Kategori membantu pengunjung memfilter proyek. Gunakan nama yang jelas dan tidak berlebihan."
            actions={
                <Button type="button" className="rounded-xl" onClick={startCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Kategori baru
                </Button>
            }
            breadcrumbs={[{ label: 'Kategori' }]}
        >
            <Panel bodyClassName="p-0">
                {categories.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Slug</th>
                                    <th>Proyek</th>
                                    <th>Urutan</th>
                                    <th>Status</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            <span className="font-medium text-navy">{category.name}</span>
                                            {category.description ? (
                                                <span className="block text-xs text-muted-foreground">{category.description}</span>
                                            ) : null}
                                        </td>
                                        <td className="text-xs text-muted-foreground">/{category.slug}</td>
                                        <td className="text-xs text-muted-foreground">{category.projects_count}</td>
                                        <td className="text-xs text-muted-foreground">{category.display_order}</td>
                                        <td>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${
                                                    category.is_active ? 'bg-success/10 text-success ring-success/20' : 'bg-slate-100 text-slate-500 ring-slate-200'
                                                }`}
                                            >
                                                {category.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(category)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Edit
                                                </button>
                                                <ConfirmDelete
                                                    url={`/admin/kategori/${category.id}`}
                                                    title="Hapus kategori ini?"
                                                    description={`“${category.name}” akan dihapus. Proyek terkait tidak ikut terhapus, tetapi kehilangan kategori ini.`}
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
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada kategori</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Tambahkan kategori agar portfolio mudah difilter.
                        </p>
                        <Button type="button" className="mt-5 rounded-xl" onClick={startCreate}>
                            Tambah kategori
                        </Button>
                    </div>
                )}
            </Panel>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle className="font-display text-lg font-bold text-navy">{editing ? 'Edit kategori' : 'Kategori baru'}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Nama kategori tampil pada filter halaman portfolio.
                    </DialogDescription>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="category-name">Nama</Label>
                            <Input
                                id="category-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={form.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="category-slug">Slug</Label>
                            <Input
                                id="category-slug"
                                value={form.data.slug}
                                onChange={(event) => form.setData('slug', event.target.value)}
                                placeholder="Kosongkan untuk otomatis"
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.slug} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="category-description">Deskripsi (opsional)</Label>
                            <Textarea
                                id="category-description"
                                rows={2}
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.description} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="category-order">Urutan</Label>
                            <Input
                                id="category-order"
                                type="number"
                                min={0}
                                value={form.data.display_order}
                                onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.display_order} className="mt-1" />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-ink/85">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                                className="h-4 w-4 accent-brand-600"
                            />
                            Aktif
                        </label>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={form.processing}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan…' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
