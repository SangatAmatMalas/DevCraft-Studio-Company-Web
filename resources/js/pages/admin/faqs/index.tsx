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

interface FaqRow {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    display_order: number;
    is_active: boolean;
}

export default function FaqsIndex({ faqs }: { faqs: FaqRow[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<FaqRow | null>(null);

    const form = useForm({
        question: '',
        answer: '',
        category: '',
        display_order: 0,
        is_active: true as boolean,
    });

    const startCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        form.setData({ question: '', answer: '', category: '', display_order: 0, is_active: true });
        setOpen(true);
    };

    const startEdit = (faq: FaqRow) => {
        setEditing(faq);
        form.clearErrors();
        form.setData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category ?? '',
            display_order: faq.display_order,
            is_active: faq.is_active,
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
                form.reset();
            },
        };

        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/faqs/${editing.id}`, options);
        } else {
            form.post('/admin/faqs', options);
        }
    };

    return (
        <AdminLayout
            title="FAQ"
            description="Pertanyaan umum yang tampil di halaman FAQ dan halaman layanan terkait."
            actions={
                <Button type="button" className="rounded-xl" onClick={startCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    FAQ baru
                </Button>
            }
            breadcrumbs={[{ label: 'FAQ' }]}
        >
            <Panel bodyClassName="p-0">
                {faqs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Pertanyaan</th>
                                    <th>Kategori</th>
                                    <th>Urutan</th>
                                    <th>Status</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.map((faq) => (
                                    <tr key={faq.id}>
                                        <td className="max-w-md">
                                            <span className="font-medium text-navy">{faq.question}</span>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{faq.answer}</p>
                                        </td>
                                        <td className="text-xs text-muted-foreground">{faq.category ?? '—'}</td>
                                        <td className="text-xs text-muted-foreground">{faq.display_order}</td>
                                        <td>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${
                                                    faq.is_active ? 'bg-success/10 text-success ring-success/20' : 'bg-slate-100 text-slate-500 ring-slate-200'
                                                }`}
                                            >
                                                {faq.is_active ? 'Tampil' : 'Disembunyikan'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(faq)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Edit
                                                </button>
                                                <ConfirmDelete
                                                    url={`/admin/faqs/${faq.id}`}
                                                    title="Hapus FAQ ini?"
                                                    description="FAQ akan dihapus permanen dari halaman publik."
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
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada FAQ</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Tambahkan pertanyaan yang benar-benar sering ditanyakan calon klien.
                        </p>
                        <Button type="button" className="mt-5 rounded-xl" onClick={startCreate}>
                            Tambah FAQ
                        </Button>
                    </div>
                )}
            </Panel>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogTitle className="font-display text-lg font-bold text-navy">{editing ? 'Edit FAQ' : 'FAQ baru'}</DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Tulis jawaban yang jelas dan tidak menjanjikan hal yang belum bisa dibuktikan.
                    </DialogDescription>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="faq-question">Pertanyaan</Label>
                            <Input
                                id="faq-question"
                                value={form.data.question}
                                onChange={(event) => form.setData('question', event.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={form.errors.question} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="faq-answer">Jawaban</Label>
                            <Textarea
                                id="faq-answer"
                                rows={5}
                                value={form.data.answer}
                                onChange={(event) => form.setData('answer', event.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={form.errors.answer} className="mt-1" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="faq-category">Kategori (opsional)</Label>
                                <Input
                                    id="faq-category"
                                    value={form.data.category}
                                    onChange={(event) => form.setData('category', event.target.value)}
                                    className="mt-1.5"
                                    placeholder="Contoh: Proses kerja"
                                />
                                <InputError message={form.errors.category} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="faq-order">Urutan</Label>
                                <Input
                                    id="faq-order"
                                    type="number"
                                    min={0}
                                    value={form.data.display_order}
                                    onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.display_order} className="mt-1" />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-ink/85">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                                className="h-4 w-4 accent-brand-600"
                            />
                            Tampilkan di situs publik
                        </label>

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
