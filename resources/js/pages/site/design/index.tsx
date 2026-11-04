import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Palette, Plus, Sparkles, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DesignBriefEditPayload, Seo } from '@/types';

interface Category {
    key: string;
    label: string;
    description: string;
}

interface Style {
    key: string;
    label: string;
    description: string;
}

interface SectionOption {
    key: string;
    label: string;
}

interface PaletteOption {
    label: string;
    value: string;
}

interface DesignFormData {
    [key: string]: import('@inertiajs/core').FormDataConvertible;
    category: string;
    style: string;
    brand_name: string;
    tagline: string;
    description: string;
    services: { title: string; description: string }[];
    contact: { whatsapp: string; email: string; city: string };
    primary_color: string;
    sections: string[];
    privacy_consent: boolean;
    website: string;
}

const STEPS = [
    { title: 'Kategori', description: 'Jenis website dan karakter visual' },
    { title: 'Brief', description: 'Nama, layanan, dan kontak' },
    { title: 'Tinjau', description: 'Periksa sebelum membuat preview' },
];

export default function DesignIndex({
    categories,
    styles,
    palettes,
    sections,
    maxServices,
    brief,
    seo,
}: {
    categories: Category[];
    styles: Style[];
    palettes: PaletteOption[];
    sections: SectionOption[];
    maxServices: number;
    brief: DesignBriefEditPayload | null;
    seo: Seo;
}) {
    const editing = brief !== null;

    const [step, setStep] = useState(brief ? 1 : 0);
    const [stepError, setStepError] = useState<string | null>(null);

    const initialSections = useMemo(() => {
        const chosen = brief?.sections?.length ? brief.sections : sections.map((section) => section.key);

        return chosen.includes('hero') ? chosen : ['hero', ...chosen];
    }, [brief, sections]);

    const form = useForm<DesignFormData>({
        category: brief?.category ?? categories[0]?.key ?? '',
        style: brief?.style ?? styles[0]?.key ?? 'minimal',
        brand_name: brief?.brand_name ?? '',
        tagline: brief?.tagline ?? '',
        description: brief?.description ?? '',
        services: brief?.services?.length
            ? brief.services.map((service) => ({ title: service.title, description: service.description ?? '' }))
            : [
                  { title: '', description: '' },
                  { title: '', description: '' },
              ],
        contact: {
            whatsapp: brief?.contact.whatsapp ?? '',
            email: brief?.contact.email ?? '',
            city: brief?.contact.city ?? '',
        },
        primary_color: brief?.primary_color ?? palettes[0]?.value ?? '#2563eb',
        sections: initialSections,
        privacy_consent: editing,
        website: '',
    });

    const errors = form.errors as Record<string, string | undefined>;
    const errorList = useMemo(() => Array.from(new Set(Object.values(errors).filter((message): message is string => Boolean(message)))), [errors]);
    const selectedCategory = useMemo(() => categories.find((item) => item.key === form.data.category), [categories, form.data.category]);
    const selectedStyle = useMemo(() => styles.find((item) => item.key === form.data.style), [styles, form.data.style]);

    const setService = (index: number, patch: Partial<{ title: string; description: string }>) => {
        const next = form.data.services.map((service, position) => (position === index ? { ...service, ...patch } : service));
        form.setData('services', next);
    };

    const addService = () => {
        if (form.data.services.length >= maxServices) {
            return;
        }

        form.setData('services', [...form.data.services, { title: '', description: '' }]);
    };

    const removeService = (index: number) => {
        if (form.data.services.length <= 1) {
            return;
        }

        form.setData(
            'services',
            form.data.services.filter((_, position) => position !== index),
        );
    };

    const toggleSection = (key: string) => {
        if (key === 'hero') {
            return;
        }

        form.setData(
            'sections',
            form.data.sections.includes(key) ? form.data.sections.filter((item) => item !== key) : [...form.data.sections, key],
        );
    };

    const sectionLabels = useMemo(() => new Map(sections.map((section) => [section.key, section.label])), [sections]);

    const orderedSections = useMemo(() => {
        const selected = form.data.sections.map((key) => ({ key, label: sectionLabels.get(key) ?? key, selected: true }));
        const remaining = sections
            .filter((section) => !form.data.sections.includes(section.key))
            .map((section) => ({ key: section.key, label: section.label, selected: false }));

        return [...selected, ...remaining];
    }, [form.data.sections, sectionLabels, sections]);

    const moveSection = (key: string, direction: -1 | 1) => {
        const index = form.data.sections.indexOf(key);
        const target = index + direction;

        // The hero stays pinned as the first section.
        if (index < 1 || target < 1 || target >= form.data.sections.length) {
            return;
        }

        const next = [...form.data.sections];
        [next[index], next[target]] = [next[target], next[index]];
        form.setData('sections', next);
    };

    const validateStep = (current: number): boolean => {
        if (current === 0) {
            if (!form.data.category || !form.data.style) {
                setStepError('Pilih kategori dan gaya visual terlebih dahulu.');
                return false;
            }
        }

        if (current === 1) {
            if (form.data.brand_name.trim().length < 2) {
                setStepError('Nama brand minimal 2 karakter.');
                return false;
            }

            if (!form.data.services.some((service) => service.title.trim() !== '')) {
                setStepError('Isi minimal satu layanan atau produk.');
                return false;
            }

            if (form.data.sections.length === 0) {
                setStepError('Pilih minimal satu bagian untuk ditampilkan.');
                return false;
            }
        }

        setStepError(null);

        return true;
    };

    const next = () => {
        if (validateStep(step)) {
            setStep((current) => Math.min(current + 1, STEPS.length - 1));
            window.scrollTo({ top: 220, behavior: 'smooth' });
        }
    };

    const back = () => {
        setStepError(null);
        setStep((current) => Math.max(current - 1, 0));
    };

    const stepForError = (key: string): number => {
        if (key === 'category' || key === 'style') {
            return 0;
        }

        if (key === 'privacy_consent' || key === 'website') {
            return 2;
        }

        return 1;
    };

    const handleServerErrors = (serverErrors: Record<string, string>) => {
        const keys = Object.keys(serverErrors);

        if (keys.length === 0) {
            return;
        }

        // Validation errors used to land on a step the visitor could not see,
        // which looked like the generator silently doing nothing.
        setStep(Math.min(...keys.map(stepForError)));
        setStepError('Brief belum bisa dibuat. Periksa isian yang ditandai.');
        window.scrollTo({ top: 220, behavior: 'smooth' });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (step < STEPS.length - 1) {
            next();
            return;
        }

        if (!form.data.privacy_consent) {
            setStepError('Centang persetujuan agar brief dapat diproses.');
            return;
        }

        setStepError(null);

        const options = { preserveScroll: true, onError: handleServerErrors };

        if (brief) {
            form.patch(`/desain/${brief.token}`, options);
        } else {
            form.post('/desain', options);
        }
    };

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-10 sm:py-14">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Coba desain' }]} />
                    <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div>
                            <p className="eyebrow">{editing ? 'Ubah brief' : 'Design preview'}</p>
                            <h1 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                                {editing ? 'Perbarui brief, lalu buat ulang preview' : 'Lihat tiga arah desain sebelum membahas anggaran'}
                            </h1>
                            <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                                {editing
                                    ? 'Ubah teks, layanan, warna, atau bagian yang tampil. Setelah disimpan, ketiga preview langsung memakai data terbaru dan tautan lama tetap berlaku.'
                                    : 'Isi brief singkat. Kami susun tiga opsi layout memakai nama, layanan, dan warna Anda — lengkap dengan preview yang bisa dibuka di desktop maupun ponsel.'}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-brand-100 bg-white p-4 text-sm text-ink/75 shadow-soft">
                            <p className="flex items-center gap-2 font-semibold text-navy">
                                <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                {editing ? 'Perubahan bersifat langsung' : 'Tanpa biaya, tanpa akun'}
                            </p>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                {editing
                                    ? 'Preview memakai template, bukan AI. Teks yang Anda tulis yang tampil; bagian yang belum diisi ditandai sebagai placeholder.'
                                    : 'Preview memakai template, bukan AI. Teks yang Anda tulis yang tampil; bagian yang belum diisi ditandai sebagai placeholder.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-y bg-white">
                <div className="container-page grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
                    <div>
                        <ol className="grid gap-2 sm:grid-cols-3" aria-label="Langkah pembuatan preview">
                            {STEPS.map((item, index) => (
                                <li
                                    key={item.title}
                                    className={cn(
                                        'rounded-xl border p-3 text-sm',
                                        index === step
                                            ? 'border-brand-300 bg-brand-50/70'
                                            : index < step
                                              ? 'border-border bg-white'
                                              : 'border-dashed border-border bg-white/60',
                                    )}
                                    aria-current={index === step ? 'step' : undefined}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'grid h-6 w-6 place-items-center rounded-full text-xs font-bold',
                                                index <= step ? 'bg-brand-600 text-white' : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {index < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                                        </span>
                                        <span className="font-semibold text-navy">{item.title}</span>
                                    </div>
                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{item.description}</p>
                                </li>
                            ))}
                        </ol>

                        <form
                            onSubmit={submit}
                            className="mt-5 rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-7"
                            noValidate
                        >
                            {errorList.length > 0 ? (
                                <div
                                    role="alert"
                                    aria-live="polite"
                                    className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3"
                                >
                                    <p className="text-sm font-semibold text-danger">Brief belum bisa dibuat. Periksa isian ini:</p>
                                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs leading-relaxed text-danger">
                                        {errorList.map((message) => (
                                            <li key={message}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                            {step === 0 ? (
                                <div className="space-y-7">
                                    <fieldset>
                                        <legend className="font-display text-lg font-bold text-navy">Kategori website</legend>
                                        <p className="mt-1 text-sm text-muted-foreground">Kategori menentukan komposisi section dan tiga layout yang disarankan.</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {categories.map((category) => {
                                                const active = form.data.category === category.key;

                                                return (
                                                    <button
                                                        key={category.key}
                                                        type="button"
                                                        onClick={() => form.setData('category', category.key)}
                                                        className={cn(
                                                            'rounded-xl border p-4 text-left transition-colors',
                                                            active ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-200' : 'border-border hover:bg-ice',
                                                        )}
                                                        aria-pressed={active}
                                                    >
                                                        <span className="block text-sm font-semibold text-navy">{category.label}</span>
                                                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{category.description}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.category} className="mt-2" />
                                    </fieldset>

                                    <fieldset>
                                        <legend className="font-display text-lg font-bold text-navy">Karakter visual</legend>
                                        <p className="mt-1 text-sm text-muted-foreground">Gaya ini memengaruhi kontras, radius, dan kepadatan layout.</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            {styles.map((style) => {
                                                const active = form.data.style === style.key;

                                                return (
                                                    <button
                                                        key={style.key}
                                                        type="button"
                                                        onClick={() => form.setData('style', style.key)}
                                                        className={cn(
                                                            'rounded-xl border p-4 text-left transition-colors',
                                                            active ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-200' : 'border-border hover:bg-ice',
                                                        )}
                                                        aria-pressed={active}
                                                    >
                                                        <span className="block text-sm font-semibold text-navy">{style.label}</span>
                                                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{style.description}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.style} className="mt-2" />
                                    </fieldset>
                                </div>
                            ) : null}

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div>
                                        <Label htmlFor="brand_name">
                                            Nama brand / usaha <span className="text-danger">*</span>
                                        </Label>
                                        <Input
                                            id="brand_name"
                                            value={form.data.brand_name}
                                            onChange={(event) => form.setData('brand_name', event.target.value)}
                                            placeholder="Contoh: Kopi Senja"
                                            maxLength={80}
                                            className="mt-1.5"
                                            aria-invalid={Boolean(errors.brand_name)}
                                        />
                                        <InputError message={errors.brand_name} className="mt-1" />
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="tagline">Tagline singkat</Label>
                                            <Input
                                                id="tagline"
                                                value={form.data.tagline}
                                                onChange={(event) => form.setData('tagline', event.target.value)}
                                                placeholder="Contoh: Kopi rumahan, diseduh pelan"
                                                maxLength={120}
                                                className="mt-1.5"
                                            />
                                            <InputError message={errors.tagline} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="primary_color">Warna utama</Label>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                {palettes.map((palette) => (
                                                    <button
                                                        key={palette.value}
                                                        type="button"
                                                        onClick={() => form.setData('primary_color', palette.value)}
                                                        title={palette.label}
                                                        aria-label={`Warna ${palette.label}`}
                                                        aria-pressed={form.data.primary_color.toLowerCase() === palette.value.toLowerCase()}
                                                        className={cn(
                                                            'h-8 w-8 rounded-full border-2 transition-transform',
                                                            form.data.primary_color.toLowerCase() === palette.value.toLowerCase()
                                                                ? 'scale-110 border-navy'
                                                                : 'border-white ring-1 ring-border',
                                                        )}
                                                        style={{ backgroundColor: palette.value }}
                                                    />
                                                ))}
                                                <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                                                    <Palette className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Kustom
                                                    <input
                                                        type="color"
                                                        value={form.data.primary_color}
                                                        onChange={(event) => form.setData('primary_color', event.target.value)}
                                                        className="sr-only"
                                                        aria-label="Warna kustom"
                                                    />
                                                </label>
                                            </div>
                                            <InputError message={errors.primary_color} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Deskripsi singkat</Label>
                                        <Textarea
                                            id="description"
                                            value={form.data.description}
                                            onChange={(event) => form.setData('description', event.target.value)}
                                            rows={3}
                                            maxLength={700}
                                            placeholder="Apa yang Anda kerjakan, untuk siapa, dan apa yang membedakan Anda."
                                            className="mt-1.5"
                                        />
                                        <p className="field-hint">{form.data.description.length}/700 karakter</p>
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>

                                    <fieldset>
                                        <div className="flex items-center justify-between gap-3">
                                            <legend className="text-sm font-medium text-navy">
                                                Layanan / produk <span className="text-danger">*</span>
                                            </legend>
                                            <button
                                                type="button"
                                                onClick={addService}
                                                disabled={form.data.services.length >= maxServices}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 disabled:opacity-40"
                                            >
                                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                                Tambah ({form.data.services.length}/{maxServices})
                                            </button>
                                        </div>
                                        <div className="mt-3 space-y-3">
                                            {form.data.services.map((service, index) => (
                                                <div key={index} className="rounded-xl border border-border bg-ice/60 p-3">
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-2 text-xs font-bold text-muted-foreground">{index + 1}.</span>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                value={service.title}
                                                                onChange={(event) => setService(index, { title: event.target.value })}
                                                                placeholder="Nama layanan, mis. Desain kemasan"
                                                                maxLength={80}
                                                                aria-label={`Nama layanan ${index + 1}`}
                                                            />
                                                            <Input
                                                                value={service.description}
                                                                onChange={(event) => setService(index, { description: event.target.value })}
                                                                placeholder="Penjelasan singkat (opsional)"
                                                                maxLength={220}
                                                                aria-label={`Deskripsi layanan ${index + 1}`}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(index)}
                                                            disabled={form.data.services.length <= 1}
                                                            className="mt-2 text-muted-foreground transition-colors hover:text-danger disabled:opacity-30"
                                                            aria-label={`Hapus layanan ${index + 1}`}
                                                        >
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                    <InputError message={errors[`services.${index}.title`]} className="mt-1" />
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={errors.services} className="mt-2" />
                                    </fieldset>

                                    <fieldset>
                                        <legend className="text-sm font-medium text-navy">Kontak yang ditampilkan (opsional)</legend>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <Label htmlFor="contact_whatsapp" className="text-xs text-muted-foreground">
                                                    WhatsApp
                                                </Label>
                                                <Input
                                                    id="contact_whatsapp"
                                                    value={form.data.contact.whatsapp}
                                                    onChange={(event) => form.setData('contact', { ...form.data.contact, whatsapp: event.target.value })}
                                                    placeholder="0812 3456 7890"
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-[0.7rem] text-muted-foreground">Angka, spasi, tanda hubung, atau awalan +.</p>
                                                <InputError message={errors['contact.whatsapp']} className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="contact_email" className="text-xs text-muted-foreground">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={form.data.contact.email}
                                                    onChange={(event) => form.setData('contact', { ...form.data.contact, email: event.target.value })}
                                                    placeholder="halo@brand.com"
                                                    className="mt-1"
                                                />
                                                <InputError message={errors['contact.email']} className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="contact_city" className="text-xs text-muted-foreground">
                                                    Kota
                                                </Label>
                                                <Input
                                                    id="contact_city"
                                                    value={form.data.contact.city}
                                                    onChange={(event) => form.setData('contact', { ...form.data.contact, city: event.target.value })}
                                                    placeholder="Bandung"
                                                    className="mt-1"
                                                />
                                                <InputError message={errors['contact.city']} className="mt-1" />
                                            </div>
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <legend className="text-sm font-medium text-navy">Bagian yang ingin ditampilkan</legend>
                                        <p className="field-hint">Urutan di bawah adalah urutan tampil di preview. Gunakan panah untuk menggeser.</p>
                                        <div className="mt-3 flex flex-col gap-2">
                                            {orderedSections.map((section, index) => {
                                                const locked = section.key === 'hero';
                                                const selected = section.selected;

                                                return (
                                                    <div
                                                        key={section.key}
                                                        className={cn(
                                                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                                                            selected ? 'border-brand-200 bg-brand-50/60 text-navy' : 'border-border text-muted-foreground',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`section_${section.key}`}
                                                            checked={selected}
                                                            disabled={locked}
                                                            onCheckedChange={() => toggleSection(section.key)}
                                                        />
                                                        <Label
                                                            htmlFor={`section_${section.key}`}
                                                            className={cn(
                                                                'flex-1 text-sm font-normal',
                                                                locked ? 'cursor-default' : 'cursor-pointer',
                                                            )}
                                                        >
                                                            {section.label}
                                                            {locked ? (
                                                                <span className="ml-1 text-[0.65rem] text-muted-foreground">(selalu tampil)</span>
                                                            ) : null}
                                                        </Label>
                                                        {locked ? (
                                                            <span className="text-[0.65rem] text-muted-foreground">Paling atas</span>
                                                        ) : selected ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveSection(section.key, -1)}
                                                                    disabled={index <= 1}
                                                                    aria-label={`Naikkan ${section.label}`}
                                                                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-navy disabled:opacity-25"
                                                                >
                                                                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveSection(section.key, 1)}
                                                                    disabled={index >= form.data.sections.length - 1}
                                                                    aria-label={`Turunkan ${section.label}`}
                                                                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-white hover:text-navy disabled:opacity-25"
                                                                >
                                                                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.sections} className="mt-2" />
                                    </fieldset>
                                </div>
                            ) : null}

                            {step === 2 ? (
                                <div className="space-y-5">
                                    <div className="rounded-xl border border-border bg-ice/70 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ringkasan brief</p>
                                        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Brand</dt>
                                                <dd className="font-semibold text-navy">{form.data.brand_name || '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Kategori</dt>
                                                <dd className="font-semibold text-navy">{selectedCategory?.label}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Gaya</dt>
                                                <dd className="font-semibold text-navy">{selectedStyle?.label}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">Warna</dt>
                                                <dd className="flex items-center gap-2 font-semibold text-navy">
                                                    <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: form.data.primary_color }} />
                                                    {form.data.primary_color}
                                                </dd>
                                            </div>
                                        </dl>
                                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                            {form.data.services.filter((service) => service.title.trim() !== '').length} layanan ·{' '}
                                            {form.data.sections.length} bagian · preview berlaku 30 hari.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border p-4 text-sm">
                                        <p className="font-medium text-navy">Yang akan Anda lihat</p>
                                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                                            <li>· Tiga layout berbeda, bukan sekadar ganti warna.</li>
                                            <li>· Konten memakai teks Anda; bagian kosong ditandai placeholder.</li>
                                            <li>· Tombol untuk lanjut konsultasi atau melihat paket setelah memilih.</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-xl border border-border bg-white p-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="privacy_consent"
                                                checked={form.data.privacy_consent}
                                                onCheckedChange={(checked) => form.setData('privacy_consent', checked === true)}
                                            />
                                            <Label htmlFor="privacy_consent" className="text-sm font-normal leading-relaxed text-ink/80">
                                                Saya setuju brief ini diproses untuk membuat preview dan disimpan maksimal 30 hari. Lihat{' '}
                                                <Link href="/kebijakan-privasi" className="font-medium text-brand-700 underline underline-offset-4">
                                                    kebijakan privasi
                                                </Link>
                                                . <span className="text-danger">*</span>
                                            </Label>
                                        </div>
                                        <InputError message={errors.privacy_consent} className="mt-2" />
                                    </div>

                                    <div className="sr-only" aria-hidden="true">
                                        <label htmlFor="website">Website</label>
                                        <input
                                            id="website"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={form.data.website}
                                            onChange={(event) => form.setData('website', event.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {stepError ? (
                                <p className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
                                    {stepError}
                                </p>
                            ) : null}

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {step > 0 ? (
                                    <Button type="button" variant="ghost" onClick={back} className="rounded-xl">
                                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        Kembali
                                    </Button>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {editing ? 'Tautan preview tetap sama setelah disimpan.' : 'Butuh waktu ±2 menit.'}
                                    </p>
                                )}

                                {step < STEPS.length - 1 ? (
                                    <Button key="step-next" type="button" onClick={next} className="rounded-xl">
                                        Lanjut
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                ) : (
                                    <Button key="step-submit" type="submit" disabled={form.processing} className="rounded-xl">
                                        {editing
                                            ? form.processing
                                                ? 'Menyimpan…'
                                                : 'Simpan perubahan'
                                            : form.processing
                                              ? 'Menyusun preview…'
                                              : 'Buat 3 opsi desain'}
                                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                            <h2 className="font-display text-base font-bold text-navy">Kenapa tiga opsi?</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Satu brief bisa terasa berbeda tergantung susunan. Tiga layout membantu Anda memilih arah sebelum
                                masuk ke pembahasan detail dan biaya.
                            </p>
                            <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                                <li>· Bold Hero — tegas, CTA menonjol.</li>
                                <li>· Editorial Split — tenang, dua kolom.</li>
                                <li>· Grid Catalog — padat, fokus item.</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-border bg-ice p-5 text-sm">
                            <h2 className="font-display text-base font-bold text-navy">Yang perlu diketahui</h2>
                            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">
                                <li>Preview adalah simulasi layout, bukan website final.</li>
                                <li>Tidak ada testimoni, angka, atau klien fiktif di dalam preview.</li>
                                <li>Gambar masih placeholder sampai foto asli disiapkan.</li>
                                <li>Data brief tidak diindeks mesin pencari dan kedaluwarsa dalam 30 hari.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </SiteLayout>
    );
}
