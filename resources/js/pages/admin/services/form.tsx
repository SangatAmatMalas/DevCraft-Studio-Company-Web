import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Plus, Save, Trash2, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { ArrayField, Field, FormSection, ToggleRow } from '@/components/admin/form';
import ServiceIcon from '@/components/site/service-icon';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import type { FormObject } from '@/types';

interface ProcessStep extends FormObject {
    title: string;
    description: string;
}

interface ServiceFaq extends FormObject {
    question: string;
    answer: string;
}

interface ServiceFormData {
    id?: number;
    title: string;
    slug: string;
    summary: string;
    description: string;
    icon_name: string;
    deliverables: string[];
    process: ProcessStep[];
    faqs: ServiceFaq[];
    technologies: string[];
    cost_factors: string;
    is_featured: boolean;
    display_order: number;
    status: string;
    meta_title: string;
    meta_description: string;
}

const ICON_OPTIONS = [
    { value: 'layout-template', label: 'Layout / website' },
    { value: 'building-2', label: 'Sistem bisnis' },
    { value: 'app-window', label: 'Aplikasi' },
    { value: 'plug', label: 'Integrasi' },
    { value: 'workflow', label: 'Otomasi' },
    { value: 'shield-check', label: 'Keamanan' },
    { value: 'life-buoy', label: 'Dukungan' },
    { value: 'globe', label: 'Web umum' },
    { value: 'layers', label: 'Umum' },
];

export default function ServiceForm({ service }: { service: ServiceFormData | null }) {
    const [process, setProcess] = useState<ProcessStep[]>(
        service?.process?.length ? service.process : [{ title: '', description: '' }],
    );
    const [faqs, setFaqs] = useState<ServiceFaq[]>(service?.faqs?.length ? service.faqs : [{ question: '', answer: '' }]);

    const form = useForm({
        title: service?.title ?? '',
        slug: service?.slug ?? '',
        summary: service?.summary ?? '',
        description: service?.description ?? '',
        icon_name: service?.icon_name ?? 'layers',
        deliverables: service?.deliverables?.length ? service.deliverables : [''],
        process: process as ProcessStep[],
        faqs: faqs as ServiceFaq[],
        technologies: service?.technologies?.length ? service.technologies : [''],
        cost_factors: service?.cost_factors ?? '',
        is_featured: service?.is_featured ?? false,
        display_order: service?.display_order ?? 0,
        meta_title: service?.meta_title ?? '',
        meta_description: service?.meta_description ?? '',
        publish: service?.status === 'published' || false,
    });

    const updateProcess = (next: ProcessStep[]) => {
        setProcess(next);
        form.setData('process', next);
    };

    const updateFaqs = (next: ServiceFaq[]) => {
        setFaqs(next);
        form.setData('faqs', next);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const requestOptions = { preserveScroll: true };

        if (service) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/services/${service.slug}`, requestOptions);
        } else {
            form.post('/admin/services', requestOptions);
        }
    };

    const togglePublish = () => {
        if (!service) {
            return;
        }

        const url = service.status === 'published' ? `/admin/services/${service.slug}/unpublish` : `/admin/services/${service.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title={service ? 'Edit layanan' : 'Layanan baru'}
            description="Tulis cakupan layanan apa adanya. Hindari janji hasil yang belum bisa dibuktikan."
            breadcrumbs={[{ label: 'Layanan', href: '/admin/services' }, { label: service ? service.title : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/services">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    {service ? (
                        <>
                            <Button asChild variant="outline" className="rounded-xl">
                                <a href={service.status === 'published' ? `/layanan/${service.slug}` : `/admin/services/${service.slug}/edit`} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    Lihat
                                </a>
                            </Button>
                            <Button type="button" variant="outline" className="rounded-xl" onClick={togglePublish}>
                                {service.status === 'published' ? (
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
                    <Button type="submit" form="service-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="service-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <FormSection title="Informasi dasar">
                        <Field label="Nama layanan" htmlFor="title" required error={form.errors.title}>
                            <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Slug" htmlFor="slug" hint="Kosongkan untuk dibuat otomatis." error={form.errors.slug}>
                                <Input
                                    id="slug"
                                    value={form.data.slug}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                    placeholder="contoh-nama-layanan"
                                />
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
                            label="Ringkasan"
                            htmlFor="summary"
                            required
                            hint="Maksimal 400 karakter. Tampil pada kartu layanan."
                            error={form.errors.summary}
                        >
                            <Textarea
                                id="summary"
                                rows={3}
                                maxLength={400}
                                value={form.data.summary}
                                onChange={(event) => form.setData('summary', event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Deskripsi lengkap" htmlFor="description" error={form.errors.description}>
                            <Textarea
                                id="description"
                                rows={7}
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                            />
                        </Field>
                    </FormSection>

                    <FormSection title="Cakupan pekerjaan" description="Satu item per baris. Tuliskan yang benar-benar termasuk dalam layanan.">
                        <ArrayField
                            label="Deliverables"
                            values={form.data.deliverables}
                            onChange={(values) => form.setData('deliverables', values)}
                            placeholder="Contoh: dokumentasi ringkas penggunaan"
                            addLabel="Tambah deliverables"
                            max={30}
                            error={form.errors.deliverables}
                        />

                        <div>
                            <Label>Proses kerja</Label>
                            <p className="field-hint mb-2">Jelaskan tahapan agar calon klien tahu apa yang diharapkan.</p>

                            <div className="mt-2 space-y-3">
                                {process.map((step, index) => (
                                    <div key={index} className="rounded-xl border border-border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tahap {index + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => updateProcess(process.filter((_, position) => position !== index))}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                                aria-label={`Hapus tahap ${index + 1}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Hapus
                                            </button>
                                        </div>
                                        <div className="mt-3 grid gap-3">
                                            <div>
                                                <Label htmlFor={`process-title-${index}`}>Judul tahap</Label>
                                                <Input
                                                    id={`process-title-${index}`}
                                                    value={step.title}
                                                    onChange={(event) =>
                                                        updateProcess(
                                                            process.map((item, position) =>
                                                                position === index ? { ...item, title: event.target.value } : item,
                                                            ),
                                                        )
                                                    }
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`process-description-${index}`}>Penjelasan</Label>
                                                <Textarea
                                                    id={`process-description-${index}`}
                                                    rows={2}
                                                    value={step.description}
                                                    onChange={(event) =>
                                                        updateProcess(
                                                            process.map((item, position) =>
                                                                position === index ? { ...item, description: event.target.value } : item,
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

                            {process.length < 20 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 rounded-lg"
                                    onClick={() => updateProcess([...process, { title: '', description: '' }])}
                                >
                                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    Tambah tahap
                                </Button>
                            ) : null}
                            <InputError message={form.errors.process} className="mt-1" />
                        </div>

                        <div>
                            <Label>FAQ layanan</Label>
                            <p className="field-hint mb-2">Pertanyaan yang sering muncul khusus untuk layanan ini.</p>

                            <div className="mt-2 space-y-3">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="rounded-xl border border-border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FAQ {index + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => updateFaqs(faqs.filter((_, position) => position !== index))}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                                aria-label={`Hapus FAQ ${index + 1}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Hapus
                                            </button>
                                        </div>
                                        <div className="mt-3 grid gap-3">
                                            <div>
                                                <Label htmlFor={`faq-question-${index}`}>Pertanyaan</Label>
                                                <Input
                                                    id={`faq-question-${index}`}
                                                    value={faq.question}
                                                    onChange={(event) =>
                                                        updateFaqs(
                                                            faqs.map((item, position) =>
                                                                position === index ? { ...item, question: event.target.value } : item,
                                                            ),
                                                        )
                                                    }
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`faq-answer-${index}`}>Jawaban</Label>
                                                <Textarea
                                                    id={`faq-answer-${index}`}
                                                    rows={3}
                                                    value={faq.answer}
                                                    onChange={(event) =>
                                                        updateFaqs(
                                                            faqs.map((item, position) =>
                                                                position === index ? { ...item, answer: event.target.value } : item,
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

                            {faqs.length < 20 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 rounded-lg"
                                    onClick={() => updateFaqs([...faqs, { question: '', answer: '' }])}
                                >
                                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    Tambah FAQ
                                </Button>
                            ) : null}
                            <InputError message={form.errors.faqs} className="mt-1" />
                        </div>

                        <ArrayField
                            label="Teknologi"
                            values={form.data.technologies}
                            onChange={(values) => form.setData('technologies', values)}
                            placeholder="Contoh: Laravel"
                            addLabel="Tambah teknologi"
                            max={30}
                            error={form.errors.technologies}
                        />

                        <Field
                            label="Faktor yang memengaruhi biaya"
                            htmlFor="cost_factors"
                            hint="Jelaskan variabel harga secara umum. Jangan cantumkan angka jika belum final."
                            error={form.errors.cost_factors}
                        >
                            <Textarea
                                id="cost_factors"
                                rows={4}
                                value={form.data.cost_factors}
                                onChange={(event) => form.setData('cost_factors', event.target.value)}
                            />
                        </Field>
                    </FormSection>
                </div>

                <div className="space-y-5">
                    <FormSection title="Ikon & publikasi">
                        <div>
                            <Label htmlFor="icon_name">Ikon layanan</Label>
                            <div className="mt-2 flex items-center gap-3">
                                <ServiceIcon name={form.data.icon_name} />
                                <NativeSelect
                                    id="icon_name"
                                    value={form.data.icon_name}
                                    onChange={(event) => form.setData('icon_name', event.target.value)}
                                    className="w-auto flex-1"
                                >
                                    {ICON_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <InputError message={form.errors.icon_name} className="mt-1" />
                        </div>

                        <ToggleRow
                            label="Layanan unggulan"
                            description="Tampil lebih awal pada halaman layanan."
                            checked={form.data.is_featured}
                            onChange={(value) => form.setData('is_featured', value)}
                            error={form.errors.is_featured}
                        />

                        {service?.status === 'published' ? (
                            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-success">
                                Layanan sudah dipublikasikan. Gunakan “Jadikan draft” di atas untuk menariknya dari situs.
                            </div>
                        ) : (
                            <ToggleRow
                                label="Publikasikan setelah disimpan"
                                description="Pastikan cakupan dan deliverables sudah benar."
                                checked={form.data.publish}
                                onChange={(value) => form.setData('publish', value)}
                                error={form.errors.publish}
                            />
                        )}

                        {service ? (
                            <p className="text-xs text-muted-foreground">
                                URL publik: <span className="font-medium text-ink">/layanan/{service.slug}</span>
                            </p>
                        ) : null}
                    </FormSection>

                    <FormSection title="SEO">
                        <Field label="Meta title" htmlFor="meta_title" hint="Kosongkan untuk memakai nama layanan." error={form.errors.meta_title}>
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
