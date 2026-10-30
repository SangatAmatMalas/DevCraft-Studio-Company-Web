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

interface TechnologyRow {
    id: number;
    name: string;
    slug: string;
    icon_name: string | null;
    projects_count: number;
}

export default function TechnologiesIndex({ technologies }: { technologies: TechnologyRow[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<TechnologyRow | null>(null);

    const form = useForm({ name: '', slug: '', icon_name: '' });

    const startCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ name: '', slug: '', icon_name: '' });
        setOpen(true);
    };

    const startEdit = (technology: TechnologyRow) => {
        setEditing(technology);
        form.clearErrors();
        form.setData({ name: technology.name, slug: technology.slug, icon_name: technology.icon_name ?? '' });
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
            form.post(`/admin/teknologi/${editing.id}`, options);
        } else {
            form.post('/admin/teknologi', options);
        }
    };

    return (
        <AdminLayout
            title="Teknologi"
            description="Daftar teknologi yang dapat ditandai pada proyek portfolio."
            actions={
                <Button type="button" className="rounded-xl" onClick={startCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Teknologi baru
                </Button>
            }
            breadcrumbs={[{ label: 'Teknologi' }]}
        >
            <Panel bodyClassName="p-0">
                {technologies.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {technologies.map((technology) => (
                            <li key={technology.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-navy">{technology.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        /{technology.slug} · {technology.projects_count} proyek
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(technology)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                        Edit
                                    </button>
                                    <ConfirmDelete
                                        url={`/admin/teknologi/${technology.id}`}
                                        title="Hapus teknologi ini?"
                                        description={`“${technology.name}” akan dihapus dari daftar dan dari proyek yang memakainya.`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada teknologi</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Tambahkan teknologi yang benar-benar digunakan pada proyek.
                        </p>
                        <Button type="button" className="mt-5 rounded-xl" onClick={startCreate}>
                            Tambah teknologi
                        </Button>
                    </div>
                )}
            </Panel>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle className="font-display text-lg font-bold text-navy">{editing ? 'Edit teknologi' : 'Teknologi baru'}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Gunakan nama resmi teknologi agar mudah dikenali.
                    </DialogDescription>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="technology-name">Nama</Label>
                            <Input
                                id="technology-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={form.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="technology-slug">Slug</Label>
                            <Input
                                id="technology-slug"
                                value={form.data.slug}
                                onChange={(event) => form.setData('slug', event.target.value)}
                                placeholder="Kosongkan untuk otomatis"
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.slug} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="technology-icon">Ikon (opsional)</Label>
                            <Input
                                id="technology-icon"
                                value={form.data.icon_name}
                                onChange={(event) => form.setData('icon_name', event.target.value)}
                                placeholder="Nama ikon lucide"
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.icon_name} className="mt-1" />
                        </div>

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
