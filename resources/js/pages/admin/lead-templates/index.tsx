import { useForm } from '@inertiajs/react';
import { MessageSquareQuote, Pencil, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TemplateRow {
    id: number;
    title: string;
    body: string;
    is_active: boolean;
    display_order: number;
}

export default function LeadTemplatesIndex({ templates, placeholders }: { templates: TemplateRow[]; placeholders: string[] }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<TemplateRow | null>(null);

    const form = useForm({
        title: '',
        body: '',
        display_order: 0,
        is_active: true as boolean,
    });

    const startCreate = () => {
        setEditing(null);
        form.clearErrors();
        form.setData({ title: '', body: '', display_order: 0, is_active: true });
        setOpen(true);
    };

    const startEdit = (template: TemplateRow) => {
        setEditing(template);
        form.clearErrors();
        form.setData({
            title: template.title,
            body: template.body,
            display_order: template.display_order,
            is_active: template.is_active,
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
            form.post(`/admin/lead-templates/${editing.id}`, options);
        } else {
            form.transform((data) => data);
            form.post('/admin/lead-templates', options);
        }
    };

    return (
        <AdminLayout
            title="Template balasan"
            description="Kalimat siap pakai saat menindaklanjuti lead. Placeholder diisi otomatis dari data lead."
            actions={
                <Button type="button" className="rounded-xl" onClick={startCreate}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Template baru
                </Button>
            }
            breadcrumbs={[{ label: 'Leads', href: '/admin/leads' }, { label: 'Template balasan' }]}
        >
            <Panel bodyClassName="p-4 sm:p-5">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                        Tulis hanya hal yang bisa Anda tepati. Jangan mencantumkan SLA, harga, atau klaim hasil yang belum disepakati. Placeholder
                        yang tersedia:{' '}
                        {placeholders.map((placeholder) => (
                            <code key={placeholder} className="mx-0.5 rounded bg-white/70 px-1 py-0.5 font-mono text-[0.7rem]">
                                {`{${placeholder}}`}
                            </code>
                        ))}
                    </p>
                </div>
            </Panel>

            <Panel className="mt-5" bodyClassName="p-0">
                {templates.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Isi</th>
                                    <th>Urutan</th>
                                    <th>Status</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templates.map((template) => (
                                    <tr key={template.id}>
                                        <td className="max-w-[12rem]">
                                            <span className="text-navy font-medium">{template.title}</span>
                                        </td>
                                        <td className="max-w-md">
                                            <p className="text-muted-foreground line-clamp-3 text-xs whitespace-pre-line">{template.body}</p>
                                        </td>
                                        <td className="text-muted-foreground text-xs">{template.display_order}</td>
                                        <td>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${
                                                    template.is_active
                                                        ? 'bg-success/10 text-success ring-success/20'
                                                        : 'bg-slate-100 text-slate-500 ring-slate-200'
                                                }`}
                                            >
                                                {template.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(template)}
                                                    className="text-brand-700 hover:bg-brand-50 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Edit
                                                </button>
                                                <ConfirmDelete
                                                    url={`/admin/lead-templates/${template.id}`}
                                                    title="Hapus template ini?"
                                                    description="Template akan dihapus permanen. Lead yang sudah ada tidak terpengaruh."
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
                        <h3 className="font-display text-navy text-base font-semibold">Belum ada template</h3>
                        <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-sm">
                            Template membantu tim membalas lebih cepat tanpa menulis ulang dari awal.
                        </p>
                        <Button type="button" className="mt-5 rounded-xl" onClick={startCreate}>
                            Tambah template
                        </Button>
                    </div>
                )}
            </Panel>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogTitle className="font-display text-navy text-lg font-bold">{editing ? 'Edit template' : 'Template baru'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1 text-sm">
                        Gunakan placeholder di dalam kurung kurawal. Placeholder asing akan ditolak.
                    </DialogDescription>

                    <form onSubmit={submit} className="mt-4 space-y-4">
                        <div>
                            <Label htmlFor="template-title">Judul</Label>
                            <Input
                                id="template-title"
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                                className="mt-1.5"
                                maxLength={80}
                                required
                            />
                            <InputError message={form.errors.title} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="template-body">Isi pesan</Label>
                            <Textarea
                                id="template-body"
                                rows={9}
                                value={form.data.body}
                                onChange={(event) => form.setData('body', event.target.value)}
                                className="mt-1.5"
                                maxLength={2000}
                                required
                            />
                            <InputError message={form.errors.body} className="mt-1" />
                            <p className="field-hint">{form.data.body.length}/2000 karakter.</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="template-order">Urutan</Label>
                                <Input
                                    id="template-order"
                                    type="number"
                                    min={0}
                                    value={form.data.display_order}
                                    onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.display_order} className="mt-1" />
                            </div>
                            <div className="flex items-end">
                                <label className="text-ink/85 flex items-center gap-2 pb-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(event) => form.setData('is_active', event.target.checked)}
                                        className="accent-brand-600 h-4 w-4"
                                    />
                                    Tampilkan di detail lead
                                </label>
                            </div>
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
