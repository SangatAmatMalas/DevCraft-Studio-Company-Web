import { useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Pencil, Plus } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

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

interface TestimonialRow {
    id: number;
    person_name: string;
    role: string | null;
    organization: string | null;
    quote: string;
    photo_url: string | null;
    permission_confirmed: boolean;
    permission_confirmed_at: string | null;
    display_order: number;
    is_active: boolean;
    published: boolean;
}

export default function TestimonialsIndex({ testimonials }: { testimonials: TestimonialRow[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<TestimonialRow | null>(null);

    const form = useForm({
        person_name: '',
        role: '',
        organization: '',
        quote: '',
        photo: null as File | null,
        permission_confirmed: false as boolean,
        display_order: 0,
        is_active: true as boolean,
    });

    const resetForm = () => {
        form.clearErrors();
        form.setData({
            person_name: '',
            role: '',
            organization: '',
            quote: '',
            photo: null,
            permission_confirmed: false,
            display_order: 0,
            is_active: true,
        });
    };

    const startCreate = () => {
        setEditing(null);
        resetForm();
        setOpen(true);
    };

    const startEdit = (item: TestimonialRow) => {
        setEditing(item);
        form.clearErrors();
        form.setData({
            person_name: item.person_name,
            role: item.role ?? '',
            organization: item.organization ?? '',
            quote: item.quote,
            photo: null,
            permission_confirmed: item.permission_confirmed,
            display_order: item.display_order,
            is_active: item.is_active,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                setEditing(null);
                resetForm();
            },
        };

        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/testimonials/${editing.id}`, options);
        } else {
            form.post('/admin/testimonials', options);
        }
    };

    return (
        <AdminLayout
            title="Testimoni"
            description="Hanya testimoni dengan izin publikasi tercatat yang tampil di situs. Jangan membuat testimoni fiktif."
            actions={
                <Button type="button" className="rounded-xl" onClick={startCreate}>
                    <Plus className="h-4 w-4 accent-brand-600" aria-hidden="true" />
                    Testimoni baru
                </Button>
            }
            breadcrumbs={[{ label: 'Testimoni' }]}
        >
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>
                    Jangan menambahkan testimoni tanpa persetujuan tertulis dari pemberi pernyataan. Centang izin publikasi hanya setelah
                    persetujuan benar-benar diterima.
                </p>
            </div>

            <Panel bodyClassName="p-0">
                {testimonials.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {testimonials.map((item) => (
                            <li key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                                {item.photo_url ? (
                                    <img src={item.photo_url} alt={item.person_name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                                        {item.person_name.charAt(0).toUpperCase()}
                                    </span>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-navy">{item.person_name}</p>
                                        {item.published ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[0.65rem] font-semibold text-success ring-1 ring-inset ring-success/20">
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                Tampil
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                                                Tidak tampil
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {[item.role, item.organization].filter(Boolean).join(' · ') || 'Tanpa jabatan/organisasi'}
                                    </p>
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/80">“{item.quote}”</p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(item)}
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                        Edit
                                    </button>
                                    <ConfirmDelete
                                        url={`/admin/testimonials/${item.id}`}
                                        title="Hapus testimoni ini?"
                                        description="Testimoni dan fotonya akan dihapus permanen."
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada testimoni</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Biarkan kosong jika belum ada testimoni terverifikasi. Halaman publik akan tetap rapi tanpa bagian ini.
                        </p>
                        <Button type="button" className="mt-5 rounded-xl" onClick={startCreate}>
                            Tambah testimoni
                        </Button>
                    </div>
                )}
            </Panel>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogTitle className="font-display text-lg font-bold text-navy">{editing ? 'Edit testimoni' : 'Testimoni baru'}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Pastikan kutipan sesuai pernyataan asli. Jangan mengubah makna atau menambahkan klaim.
                    </DialogDescription>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="person_name">Nama</Label>
                                <Input
                                    id="person_name"
                                    value={form.data.person_name}
                                    onChange={(event) => form.setData('person_name', event.target.value)}
                                    className="mt-1.5"
                                    required
                                />
                                <InputError message={form.errors.person_name} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="role">Jabatan</Label>
                                <Input id="role" value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="mt-1.5" />
                                <InputError message={form.errors.role} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="organization">Organisasi</Label>
                            <Input
                                id="organization"
                                value={form.data.organization}
                                onChange={(event) => form.setData('organization', event.target.value)}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.organization} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="quote">Kutipan</Label>
                            <Textarea
                                id="quote"
                                rows={4}
                                value={form.data.quote}
                                onChange={(event) => form.setData('quote', event.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={form.errors.quote} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="photo">Foto (opsional)</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event: ChangeEvent<HTMLInputElement>) => form.setData('photo', event.target.files?.[0] ?? null)}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.photo} className="mt-1" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="display_order">Urutan</Label>
                                <Input
                                    id="display_order"
                                    type="number"
                                    min={0}
                                    value={form.data.display_order}
                                    onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.display_order} className="mt-1" />
                            </div>
                            <label className="flex items-end gap-2 pb-2 text-sm text-ink/85">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) => form.setData('is_active', event.target.checked)}
                                    className="h-4 w-4 accent-brand-600"
                                />
                                Aktif
                            </label>
                        </div>

                        <div className="rounded-xl border border-border bg-ice p-3">
                            <label className="flex items-start gap-2 text-sm text-ink/85">
                                <input
                                    type="checkbox"
                                    checked={form.data.permission_confirmed}
                                    onChange={(event) => form.setData('permission_confirmed', event.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-brand-600"
                                />
                                <span>
                                    Saya sudah menerima izin publikasi dari pemberi testimoni.
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        Tanpa centang ini, testimoni tidak akan tampil meskipun status aktif.
                                    </span>
                                </span>
                            </label>
                            <InputError message={form.errors.permission_confirmed} className="mt-1" />
                        </div>

                        <DialogFooter className="mt-2">
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
