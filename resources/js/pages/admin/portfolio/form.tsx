import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, ImagePlus, Plus, Save, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { ArrayField, Field, FormSection, ToggleRow } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import type { FormObject } from '@/types';

interface MediaItem {
    id: number;
    url: string;
    alt_text: string;
    caption: string | null;
    is_cover: boolean;
}

interface SectionItem extends FormObject {
    id?: number;
    heading: string;
    body: string;
    section_type: string;
    display_order: number;
}

interface ProjectFormData {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    description: string;
    project_type: string;
    project_status: string;
    client_name: string;
    role_summary: string;
    problem: string;
    goals: string[];
    solution: string;
    outcome: string;
    started_at: string;
    completed_at: string;
    repository_url: string;
    demo_url: string;
    is_featured: boolean;
    display_order: number;
    status: string;
    categories: number[];
    technologies: number[];
    sections: SectionItem[];
    media: MediaItem[];
    meta_title: string;
    meta_description: string;
    public_url: string;
}

interface Options {
    categories: { id: number; name: string }[];
    technologies: { id: number; name: string }[];
    types: Record<string, string>;
    projectStatuses: Record<string, string>;
}

export default function PortfolioForm({ project, options }: { project: ProjectFormData | null; options: Options }) {
    const [sections, setSections] = useState<SectionItem[]>(
        project?.sections?.length
            ? project.sections
            : [{ heading: '', body: '', section_type: 'text', display_order: 0 }],
    );

    const form = useForm({
        title: project?.title ?? '',
        slug: project?.slug ?? '',
        excerpt: project?.excerpt ?? '',
        description: project?.description ?? '',
        project_type: project?.project_type ?? 'client_project',
        project_status: project?.project_status ?? 'completed',
        client_name: project?.client_name ?? '',
        role_summary: project?.role_summary ?? '',
        problem: project?.problem ?? '',
        goals: project?.goals?.length ? project.goals : [''],
        solution: project?.solution ?? '',
        outcome: project?.outcome ?? '',
        started_at: project?.started_at ?? '',
        completed_at: project?.completed_at ?? '',
        repository_url: project?.repository_url ?? '',
        demo_url: project?.demo_url ?? '',
        is_featured: project?.is_featured ?? false,
        display_order: project?.display_order ?? 0,
        categories: project?.categories ?? ([] as number[]),
        technologies: project?.technologies ?? ([] as number[]),
        sections: sections as SectionItem[],
        remove_media: [] as number[],
        cover: null as File | null,
        gallery: [] as File[],
        meta_title: project?.meta_title ?? '',
        meta_description: project?.meta_description ?? '',
        publish: project?.status === 'published' || false,
    });

    const media: MediaItem[] = project?.media ?? [];

    const updateSections = (next: SectionItem[]) => {
        setSections(next);
        form.setData('sections', next);
    };

    const addSection = () => {
        updateSections([...sections, { heading: '', body: '', section_type: 'text', display_order: sections.length }]);
    };

    const removeSection = (index: number) => {
        updateSections(sections.filter((_, position) => position !== index));
    };

    const updateSection = (index: number, patch: Partial<SectionItem>) => {
        updateSections(sections.map((section, position) => (position === index ? { ...section, ...patch } : section)));
    };

    const toggleRelation = (key: 'categories' | 'technologies', id: number) => {
        const current = form.data[key];
        form.setData(key, current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    };

    const toggleMediaRemoval = (id: number) => {
        const current = form.data.remove_media;
        form.setData('remove_media', current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    };

    const onCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
        form.setData('cover', event.target.files?.[0] ?? null);
    };

    const onGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
        form.setData('gallery', Array.from(event.target.files ?? []));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const requestOptions = { preserveScroll: true, forceFormData: true };

        if (project) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/portfolio/${project.slug}`, requestOptions);
        } else {
            form.post('/admin/portfolio', requestOptions);
        }
    };

    const togglePublish = () => {
        if (!project) {
            return;
        }

        const url = project.status === 'published' ? `/admin/portfolio/${project.slug}/unpublish` : `/admin/portfolio/${project.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    const markedMedia = form.data.remove_media;

    return (
        <AdminLayout
            title={project ? 'Edit proyek' : 'Proyek baru'}
            description="Jelaskan konteks, kontribusi, dan batasan proyek. Jangan menulis metrik yang belum terukur."
            breadcrumbs={[{ label: 'Portfolio', href: '/admin/portfolio' }, { label: project ? project.title : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/portfolio">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    {project ? (
                        <>
                            <Button asChild variant="outline" className="rounded-xl">
                                <a href={`/admin/portfolio/${project.slug}/preview`} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    Preview
                                </a>
                            </Button>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={togglePublish}>
                                {project.status === 'published' ? (
                                    <>
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        Jadikan draft
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" aria-hidden="true" />
                                        Publikasikan
                                    </>
                                )}
                            </Button>
                        </>
                    ) : null}
                    <Button type="submit" form="project-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="project-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <FormSection title="Informasi dasar">
                        <Field label="Judul proyek" htmlFor="title" required error={form.errors.title}>
                            <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Slug"
                                htmlFor="slug"
                                hint="Kosongkan untuk dibuat otomatis dari judul."
                                error={form.errors.slug}
                            >
                                <Input id="slug" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} placeholder="contoh-nama-proyek" />
                            </Field>
                            <Field label="Urutan tampil" htmlFor="display_order" error={form.errors.display_order}>
                                <Input
                                    id="display_order"
                                    type="number"
                                    min={0}
                                    value={form.data.display_order}
                                    onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                />
                            </Field>
                        </div>

                        <Field
                            label="Ringkasan singkat"
                            htmlFor="excerpt"
                            required
                            hint="Maksimal 400 karakter. Tampil pada kartu portfolio."
                            error={form.errors.excerpt}
                        >
                            <Textarea
                                id="excerpt"
                                rows={3}
                                maxLength={400}
                                value={form.data.excerpt}
                                onChange={(event) => form.setData('excerpt', event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Deskripsi tambahan" htmlFor="description" hint="Opsional. Catatan latar atau detail teknis." error={form.errors.description}>
                            <Textarea id="description" rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                        </Field>
                    </FormSection>

                    <FormSection
                        title="Klasifikasi"
                        description="Wajib diisi agar pengunjung tidak salah memahami status proyek."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Tipe proyek" htmlFor="project_type" required error={form.errors.project_type}>
                                <NativeSelect
                                    id="project_type"
                                    value={form.data.project_type}
                                    onChange={(event) => form.setData('project_type', event.target.value)}
                                >
                                    {Object.entries(options.types).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>
                            <Field label="Status proyek" htmlFor="project_status" required error={form.errors.project_status}>
                                <NativeSelect
                                    id="project_status"
                                    value={form.data.project_status}
                                    onChange={(event) => form.setData('project_status', event.target.value)}
                                >
                                    {Object.entries(options.projectStatuses).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>
                            <Field label="Nama klien" htmlFor="client_name" hint="Isi hanya jika klien setuju disebut." error={form.errors.client_name}>
                                <Input id="client_name" value={form.data.client_name} onChange={(event) => form.setData('client_name', event.target.value)} />
                            </Field>
                            <Field label="Periode mulai" htmlFor="started_at" error={form.errors.started_at}>
                                <Input id="started_at" type="date" value={form.data.started_at} onChange={(event) => form.setData('started_at', event.target.value)} />
                            </Field>
                            <Field label="Periode selesai" htmlFor="completed_at" error={form.errors.completed_at}>
                                <Input id="completed_at" type="date" value={form.data.completed_at} onChange={(event) => form.setData('completed_at', event.target.value)} />
                            </Field>
                        </div>
                    </FormSection>

                    <FormSection title="Studi kasus" description="Struktur ini yang dibaca calon klien. Tulis apa adanya.">
                        <Field label="Masalah dan konteks" htmlFor="problem" error={form.errors.problem}>
                            <Textarea id="problem" rows={4} value={form.data.problem} onChange={(event) => form.setData('problem', event.target.value)} />
                        </Field>

                        <ArrayField
                            label="Tujuan"
                            values={form.data.goals}
                            onChange={(values) => form.setData('goals', values)}
                            placeholder="Contoh: memangkas waktu input data manual"
                            addLabel="Tambah tujuan"
                            max={20}
                            error={form.errors.goals}
                        />

                        <Field label="Solusi dan fitur utama" htmlFor="solution" error={form.errors.solution}>
                            <Textarea id="solution" rows={5} value={form.data.solution} onChange={(event) => form.setData('solution', event.target.value)} />
                        </Field>

                        <Field
                            label="Peran dan kontribusi"
                            htmlFor="role_summary"
                            hint="Jelaskan bagian yang benar-benar Anda kerjakan, terutama untuk proyek tim."
                            error={form.errors.role_summary}
                        >
                            <Textarea id="role_summary" rows={3} value={form.data.role_summary} onChange={(event) => form.setData('role_summary', event.target.value)} />
                        </Field>

                        <Field
                            label="Hasil"
                            htmlFor="outcome"
                            hint="Hanya tulis hasil yang terukur atau dapat diverifikasi. Kosongkan jika belum ada."
                            error={form.errors.outcome}
                        >
                            <Textarea id="outcome" rows={3} value={form.data.outcome} onChange={(event) => form.setData('outcome', event.target.value)} />
                        </Field>
                    </FormSection>

                    <FormSection title="Bagian tambahan" description="Opsional. Gunakan untuk arsitektur, tantangan, atau pelajaran.">
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <div key={index} className="rounded-xl border border-border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bagian {index + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeSection(index)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 accent-brand-600" aria-hidden="true" />
                                            Hapus
                                        </button>
                                    </div>
                                    <div className="mt-3 grid gap-3">
                                        <div>
                                            <Label htmlFor={`section-heading-${index}`}>Judul bagian</Label>
                                            <Input
                                                id={`section-heading-${index}`}
                                                value={section.heading}
                                                onChange={(event) => updateSection(index, { heading: event.target.value })}
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`section-body-${index}`}>Isi</Label>
                                            <Textarea
                                                id={`section-body-${index}`}
                                                rows={4}
                                                value={section.body}
                                                onChange={(event) => updateSection(index, { body: event.target.value })}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={addSection} disabled={sections.length >= 20}>
                            <Plus className="h-3.5 w-3.5 accent-brand-600" aria-hidden="true" />
                            Tambah bagian
                        </Button>
                        <InputError message={form.errors.sections} />
                    </FormSection>

                    <FormSection title="Media" description="Cover tampil pada kartu. Format JPG, PNG, atau WebP maksimal 4 MB.">
                        <div>
                            <Label htmlFor="cover">Cover baru</Label>
                            <Input id="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={onCoverChange} className="mt-1.5" />
                            <InputError message={form.errors.cover} className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="gallery">Galeri (bisa lebih dari satu)</Label>
                            <Input
                                id="gallery"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={onGalleryChange}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.gallery} className="mt-1" />
                        </div>

                        {media.length > 0 ? (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Media tersimpan</p>
                                <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {media.map((item) => {
                                        const marked = markedMedia.includes(item.id);

                                        return (
                                            <li key={item.id} className={`overflow-hidden rounded-xl border ${marked ? 'border-danger opacity-60' : 'border-border'}`}>
                                                <img src={item.url} alt={item.alt_text} className="h-24 w-full object-cover" />
                                                <label className="flex cursor-pointer items-center gap-2 p-2 text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={marked}
                                                        onChange={() => toggleMediaRemoval(item.id)}
                                                        className="h-3.5 w-3.5 accent-brand-600"
                                                    />
                                                    Hapus
                                                    {item.is_cover ? <span className="ml-auto text-[0.6rem] font-semibold text-brand-700">COVER</span> : null}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <p className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-ice p-3 text-xs text-muted-foreground">
                                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                Belum ada media. Kartu akan memakai visual gradien sampai cover diunggah.
                            </p>
                        )}
                    </FormSection>
                </div>

                <div className="space-y-5">
                    <FormSection title="Publikasi">
                        <ToggleRow
                            label="Featured"
                            description="Tampil lebih awal pada halaman portfolio."
                            checked={form.data.is_featured}
                            onChange={(value) => form.setData('is_featured', value)}
                            error={form.errors.is_featured}
                        />

                        {project?.status === 'published' ? (
                            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-success">
                                Proyek sudah dipublikasikan. Gunakan tombol “Jadikan draft” di atas untuk menariknya dari situs.
                            </div>
                        ) : (
                            <ToggleRow
                                label="Publikasikan setelah disimpan"
                                description="Pastikan kontribusi dan tautan sudah diverifikasi."
                                checked={form.data.publish}
                                onChange={(value) => form.setData('publish', value)}
                                error={form.errors.publish}
                            />
                        )}

                        {project ? (
                            <div className="rounded-xl border border-border bg-ice p-3 text-xs text-muted-foreground">
                                Status saat ini: <span className="font-semibold text-ink">{project.status}</span>
                            </div>
                        ) : null}
                    </FormSection>

                    <FormSection title="Tautan">
                        <Field label="Repository" htmlFor="repository_url" error={form.errors.repository_url}>
                            <Input
                                id="repository_url"
                                type="url"
                                placeholder="https://github.com/…"
                                value={form.data.repository_url}
                                onChange={(event) => form.setData('repository_url', event.target.value)}
                            />
                        </Field>
                        <Field label="Demo / live" htmlFor="demo_url" error={form.errors.demo_url}>
                            <Input
                                id="demo_url"
                                type="url"
                                placeholder="https://…"
                                value={form.data.demo_url}
                                onChange={(event) => form.setData('demo_url', event.target.value)}
                            />
                        </Field>
                    </FormSection>

                    <FormSection title="Kategori & teknologi">
                        <div>
                            <Label>Kategori</Label>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {options.categories.map((category) => {
                                    const active = form.data.categories.includes(category.id);

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleRelation('categories', category.id)}
                                            aria-pressed={active}
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                active ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-slate-600 hover:border-brand-300'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={form.errors.categories} className="mt-1" />
                        </div>

                        <div>
                            <Label>Teknologi</Label>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {options.technologies.map((technology) => {
                                    const active = form.data.technologies.includes(technology.id);

                                    return (
                                        <button
                                            key={technology.id}
                                            type="button"
                                            onClick={() => toggleRelation('technologies', technology.id)}
                                            aria-pressed={active}
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                active ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-slate-600 hover:border-brand-300'
                                            }`}
                                        >
                                            {technology.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={form.errors.technologies} className="mt-1" />
                        </div>
                    </FormSection>

                    <FormSection title="SEO">
                        <Field label="Meta title" htmlFor="meta_title" hint="Kosongkan untuk memakai judul proyek." error={form.errors.meta_title}>
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
