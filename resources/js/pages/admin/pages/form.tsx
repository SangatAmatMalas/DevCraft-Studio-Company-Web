import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { Field, FormSection, ToggleRow } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormObject } from '@/types';

interface PageBlock extends FormObject {
    heading: string;
    body: string;
}

interface PageFormData {
    id: number;
    title: string;
    slug: string;
    intro: string;
    blocks: PageBlock[];
    status: string;
    meta_title: string;
    meta_description: string;
}

export default function PageForm({ page }: { page: PageFormData | null }) {
    const [blocks, setBlocks] = useState<PageBlock[]>(page?.blocks?.length ? page.blocks : [{ heading: '', body: '' }]);

    const form = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        intro: page?.intro ?? '',
        blocks: blocks as PageBlock[],
        meta_title: page?.meta_title ?? '',
        meta_description: page?.meta_description ?? '',
        publish: page?.status === 'published' || false,
    });

    const updateBlocks = (next: PageBlock[]) => {
        setBlocks(next);
        form.setData('blocks', next);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = { preserveScroll: true };

        if (page) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/pages/${page.slug}`, options);
        } else {
            form.post('/admin/pages', options);
        }
    };

    return (
        <AdminLayout
            title={page ? 'Edit halaman' : 'Halaman baru'}
            description="Konten harus akurat dan sesuai kondisi layanan saat ini."
            breadcrumbs={[{ label: 'Halaman', href: '/admin/pages' }, { label: page ? page.title : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/pages">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    <Button type="submit" form="page-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="page-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <FormSection title="Informasi halaman">
                        <Field label="Judul" htmlFor="title" required error={form.errors.title}>
                            <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required />
                        </Field>

                        <Field label="Slug" htmlFor="slug" hint="Contoh: kebijakan-privasi. Kosongkan untuk dibuat otomatis." error={form.errors.slug}>
                            <Input id="slug" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} />
                        </Field>

                        <Field label="Paragraf pembuka" htmlFor="intro" error={form.errors.intro}>
                            <Textarea id="intro" rows={4} value={form.data.intro} onChange={(event) => form.setData('intro', event.target.value)} />
                        </Field>
                    </FormSection>

                    <FormSection title="Bagian konten" description="Susun halaman dalam beberapa bagian berjudul.">
                        <div className="space-y-3">
                            {blocks.map((block, index) => (
                                <div key={index} className="rounded-xl border border-border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bagian {index + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() => updateBlocks(blocks.filter((_, position) => position !== index))}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                            aria-label={`Hapus bagian ${index + 1}`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            Hapus
                                        </button>
                                    </div>
                                    <div className="mt-3 grid gap-3">
                                        <div>
                                            <Label htmlFor={`block-heading-${index}`}>Judul bagian</Label>
                                            <Input
                                                id={`block-heading-${index}`}
                                                value={block.heading}
                                                onChange={(event) =>
                                                    updateBlocks(
                                                        blocks.map((item, position) =>
                                                            position === index ? { ...item, heading: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`block-body-${index}`}>Isi</Label>
                                            <Textarea
                                                id={`block-body-${index}`}
                                                rows={5}
                                                value={block.body}
                                                onChange={(event) =>
                                                    updateBlocks(
                                                        blocks.map((item, position) =>
                                                            position === index ? { ...item, body: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {blocks.length < 30 ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => updateBlocks([...blocks, { heading: '', body: '' }])}
                            >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Tambah bagian
                            </Button>
                        ) : null}
                        <InputError message={form.errors.blocks} />
                    </FormSection>
                </div>

                <div className="space-y-5">
                    <FormSection title="Publikasi">
                        <ToggleRow
                            label="Publikasikan halaman"
                            description="Halaman draft tidak dapat diakses publik."
                            checked={form.data.publish}
                            onChange={(value) => form.setData('publish', value)}
                            error={form.errors.publish}
                        />
                        {page ? (
                            <p className="text-xs text-muted-foreground">
                                URL publik: <span className="font-medium text-ink">/{page.slug}</span>
                            </p>
                        ) : null}
                    </FormSection>

                    <FormSection title="SEO">
                        <Field label="Meta title" htmlFor="meta_title" hint="Kosongkan untuk memakai judul halaman." error={form.errors.meta_title}>
                            <Input id="meta_title" value={form.data.meta_title} onChange={(event) => form.setData('meta_title', event.target.value)} />
                        </Field>
                        <Field label="Meta description" htmlFor="meta_description" error={form.errors.meta_description}>
                            <Textarea
                                id="meta_description"
                                rows={3}
                                maxLength={300}
                                value={form.data.meta_description}
                                onChange={(event) => form.setData('meta_description', event.target.value)}
                            />
                        </Field>
                    </FormSection>
                </div>
            </form>
        </AdminLayout>
    );
}
