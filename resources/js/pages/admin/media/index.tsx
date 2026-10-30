import { router, useForm } from '@inertiajs/react';
import { FileText, Pencil, Search, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Pagination from '@/components/admin/pagination';
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
import { formatBytes } from '@/lib/format';

interface MediaRow {
    id: number;
    url: string;
    original_name: string;
    mime_type: string | null;
    size: number;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    is_image: boolean;
    created_at: string | null;
}

export default function MediaIndex({
    media,
    filters,
    limits,
}: {
    media: { data: MediaRow[]; meta: { current_page: number; last_page: number; total: number } };
    filters: { q: string };
    limits: { max_bytes: number; mimes: string[] };
}) {
    const [term, setTerm] = useState(filters.q);
    const [editing, setEditing] = useState<MediaRow | null>(null);

    const uploadForm = useForm({ file: null as File | null, alt_text: '' });
    const altForm = useForm({ alt_text: '' });

    const search = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/media', { q: term }, { preserveState: true, preserveScroll: true });
    };

    const upload = (event: FormEvent) => {
        event.preventDefault();
        uploadForm.post('/admin/media', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => uploadForm.reset(),
        });
    };

    const startEdit = (item: MediaRow) => {
        altForm.clearErrors();
        altForm.setData('alt_text', item.alt_text ?? '');
        setEditing(item);
    };

    const saveAlt = (event: FormEvent) => {
        event.preventDefault();

        if (!editing) {
            return;
        }

        altForm.transform((data) => ({ ...data, _method: 'put' }));
            altForm.post(`/admin/media/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    return (
        <AdminLayout
            title="Media"
            description="Pustaka gambar dan dokumen. Alt text wajib deskriptif untuk gambar yang tampil di situs."
            breadcrumbs={[{ label: 'Media' }]}
        >
            <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
                <Panel title="Unggah media" bodyClassName="p-5">
                    <form onSubmit={upload} className="space-y-4">
                        <div>
                            <Label htmlFor="file">Berkas</Label>
                            <Input
                                id="file"
                                type="file"
                                accept={limits.mimes.map((mime) => `.${mime.split('/')[1]}`).join(',')}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => uploadForm.setData('file', event.target.files?.[0] ?? null)}
                                className="mt-1.5"
                            />
                            <p className="field-hint">
                                Maksimal {formatBytes(limits.max_bytes)}. Format: JPG, PNG, WebP, AVIF, SVG, PDF.
                            </p>
                            <InputError message={uploadForm.errors.file} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="alt_text">Alt text</Label>
                            <Input
                                id="alt_text"
                                value={uploadForm.data.alt_text}
                                onChange={(event) => uploadForm.setData('alt_text', event.target.value)}
                                placeholder="Deskripsi singkat isi gambar"
                                className="mt-1.5"
                            />
                            <p className="field-hint">Kosongkan untuk gambar dekoratif, bukan gambar informatif.</p>
                            <InputError message={uploadForm.errors.alt_text} className="mt-1" />
                        </div>

                        <Button type="submit" disabled={uploadForm.processing} className="w-full rounded-lg">
                            <Upload className="h-4 w-4" aria-hidden="true" />
                            {uploadForm.processing ? 'Mengunggah…' : 'Unggah'}
                        </Button>
                    </form>
                </Panel>

                <div className="space-y-5">
                    <Panel bodyClassName="p-4">
                        <form onSubmit={search} className="flex gap-2" role="search">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    value={term}
                                    onChange={(event) => setTerm(event.target.value)}
                                    placeholder="Cari nama berkas…"
                                    aria-label="Cari media"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" className="rounded-lg">
                                Cari
                            </Button>
                        </form>
                    </Panel>

                    <Panel bodyClassName="p-0">
                        {media.data.length > 0 ? (
                            <>
                                <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
                                    {media.data.map((item) => (
                                        <li key={item.id} className="overflow-hidden rounded-xl border border-border">
                                            <div className="grid h-28 place-items-center bg-ice">
                                                {item.is_image ? (
                                                    <img src={item.url} alt={item.alt_text ?? ''} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="flex flex-col items-center gap-1 text-muted-foreground">
                                                        <FileText className="h-7 w-7" aria-hidden="true" />
                                                        <span className="text-[0.65rem] uppercase">{item.mime_type?.split('/')[1] ?? 'file'}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <p className="truncate text-xs font-medium text-ink" title={item.original_name}>
                                                    {item.original_name}
                                                </p>
                                                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                                                    {formatBytes(item.size)}
                                                    {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
                                                </p>
                                                <p className="mt-1 line-clamp-1 text-[0.65rem] text-muted-foreground">
                                                    Alt: {item.alt_text || <span className="italic">belum diisi</span>}
                                                </p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(item)}
                                                        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[0.7rem] font-semibold text-brand-700 hover:bg-brand-50"
                                                    >
                                                        <Pencil className="h-3 w-3" aria-hidden="true" />
                                                        Alt
                                                    </button>
                                                    <ConfirmDelete
                                                        url={`/admin/media/${item.id}`}
                                                        title="Hapus media ini?"
                                                        description="Media akan dihapus permanen. Media yang masih digunakan konten tidak dapat dihapus."
                                                        triggerClassName="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[0.7rem] font-semibold text-danger hover:bg-red-50"
                                                        triggerLabel="Hapus"
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-4 pb-4">
                                    <Pagination meta={media.meta} basePath="/admin/media" filters={filters} />
                                </div>
                            </>
                        ) : (
                            <p className="px-6 py-12 text-center text-sm text-muted-foreground">Belum ada media diunggah.</p>
                        )}
                    </Panel>
                </div>
            </div>

            <Dialog open={editing !== null} onOpenChange={(value) => (!value ? setEditing(null) : undefined)}>
                <DialogContent>
                    <DialogTitle className="font-display text-lg font-bold text-navy">Alt text</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Deskripsikan isi gambar secara singkat untuk pembaca layar.
                    </DialogDescription>

                    <form onSubmit={saveAlt} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="edit-alt">Alt text</Label>
                            <Input
                                id="edit-alt"
                                value={altForm.data.alt_text}
                                onChange={(event) => altForm.setData('alt_text', event.target.value)}
                                className="mt-1.5"
                            />
                            <InputError message={altForm.errors.alt_text} className="mt-1" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={altForm.processing}>
                                {altForm.processing ? 'Menyimpan…' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
