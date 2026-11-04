import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ChevronDown, Mail, MessageCircle, Paperclip, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import type { DesignBriefContext, Seo, SharedProps } from '@/types';

interface Prefill {
    package: { id: number; name: string } | null;
    project: { id: number; title: string } | null;
    service: { title: string } | null;
    source_type: string;
}

interface ContactProps {
    services: { title: string; slug: string }[];
    packages: { id: number; name: string; slug: string }[];
    projects: { id: number; title: string; slug: string }[];
    prefill: Prefill;
    designBrief: DesignBriefContext | null;
    whatsappUrl: string | null;
    seo: Seo;
}

const BUDGET_OPTIONS = [
    'Belum ada estimasi',
    'Di bawah Rp 5 juta',
    'Rp 5 juta – Rp 15 juta',
    'Rp 15 juta – Rp 40 juta',
    'Di atas Rp 40 juta',
    'Perlu diskusi',
];

const TIMELINE_OPTIONS = [
    'Secepatnya (di bawah 1 bulan)',
    '1–3 bulan',
    '3–6 bulan',
    'Fleksibel',
    'Belum ditentukan',
];

export default function Contact({ services, packages, projects, prefill, designBrief, whatsappUrl, seo }: ContactProps) {
    const { site, flash } = usePage<SharedProps>().props;
    const { track } = useAnalytics();
    const startedTracked = useRef(false);
    const hasContext = Boolean(prefill.package || prefill.project || prefill.service || designBrief);
    const [optionalOpen, setOptionalOpen] = useState(hasContext);
    const [fileInputKey, setFileInputKey] = useState(0);

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        organization: '',
        service_type: prefill.service?.title ?? '',
        package_id: prefill.package?.id ? String(prefill.package.id) : '',
        portfolio_project_id: prefill.project?.id ? String(prefill.project.id) : '',
        budget_range: '',
        target_timeline: '',
        preferred_contact: 'email',
        message: designBrief?.message_seed ?? '',
        reference_url: '',
        attachments: [] as File[],
        design_brief: designBrief?.token ?? '',
        privacy_consent: false as boolean,
        source_url: '',
        source_type: prefill.source_type,
        website: '',
    });

    function markStarted() {
        if (startedTracked.current) {
            return;
        }

        startedTracked.current = true;
        track('project_brief_start', {
            metadata: {
                source: prefill.source_type,
                package_slug: (prefill.package ? packages.find((item) => item.id === prefill.package?.id)?.slug : '') ?? '',
                project_slug: (prefill.project ? projects.find((item) => item.id === prefill.project?.id)?.slug : '') ?? '',
            },
        });
    }

    function handleFiles(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []).slice(0, 3);
        form.setData('attachments', files);
    }

    function removeFile(index: number) {
        form.setData(
            'attachments',
            form.data.attachments.filter((_, position) => position !== index),
        );
        setFileInputKey((current) => current + 1);
    }

    const attachmentErrors = Object.entries(form.errors as Record<string, string | undefined>)
        .filter(([key]) => key.startsWith('attachments.'))
        .map(([, message]) => message)
        .filter(Boolean) as string[];

    function submit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => {
            const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

            return {
                ...data,
                source_url: typeof window !== 'undefined' ? window.location.href : '',
                package_id: data.package_id === '' ? null : data.package_id,
                portfolio_project_id: data.portfolio_project_id === '' ? null : data.portfolio_project_id,
                utm_source: params?.get('utm_source') ?? null,
                utm_medium: params?.get('utm_medium') ?? null,
                utm_campaign: params?.get('utm_campaign') ?? null,
                utm_term: params?.get('utm_term') ?? null,
                utm_content: params?.get('utm_content') ?? null,
                referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : null,
            };
        });

        form.post('/kontak', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset(
                    'name',
                    'email',
                    'phone',
                    'organization',
                    'message',
                    'budget_range',
                    'target_timeline',
                    'reference_url',
                    'attachments',
                    'preferred_contact',
                );
                setFileInputKey((current) => current + 1);
            },
        });
    }

    useEffect(() => {
        if (flash.lead_submitted) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
         
    }, [flash.lead_submitted]);

    useEffect(() => {
        const optionalKeys = [
            'organization',
            'service_type',
            'package_id',
            'portfolio_project_id',
            'budget_range',
            'target_timeline',
            'reference_url',
        ];

        if (optionalKeys.some((key) => Boolean((form.errors as Record<string, string | undefined>)[key]))) {
            setOptionalOpen(true);
        }
    }, [form.errors]);

    const contextItems = [
        prefill.package ? { label: 'Paket', value: prefill.package.name } : null,
        prefill.project ? { label: 'Referensi proyek', value: prefill.project.title } : null,
        prefill.service ? { label: 'Layanan', value: prefill.service.title } : null,
        designBrief
            ? {
                  label: 'Preview desain',
                  value: `${designBrief.brand_name} · ${designBrief.category_label}${designBrief.template_label ? ` · ${designBrief.template_label}` : ''}`,
              }
            : null,
    ].filter(Boolean) as { label: string; value: string }[];

    if (flash.lead_submitted) {
        return (
            <SiteLayout>
                <SeoHead seo={seo} />
                <section className="container-page flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
                        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h1 className="mt-5 font-display text-2xl font-bold text-navy sm:text-3xl">Brief Anda sudah kami terima</h1>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        Terima kasih sudah menceritakan kebutuhan Anda. Tim DevCraft Studio akan meninjau brief ini dan membalas
                        melalui kontak yang Anda pilih. Kami tidak menggunakan data Anda untuk pengiriman promosi.
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="rounded-xl">
                            <Link href="/portfolio">Lihat portfolio</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href="/">Kembali ke beranda</Link>
                        </Button>
                    </div>
                </section>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-14">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Kontak' }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        Ceritakan kebutuhan Anda
                    </h1>
                    <p className="mt-3 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Semakin jelas konteks yang Anda berikan, semakin cepat kami dapat menyusun estimasi. Tidak ada komitmen
                        awal dan tidak ada biaya untuk diskusi pertama.
                    </p>
                </div>
            </section>

            <section className="section-y bg-white">
                <div className="container-page grid gap-10 lg:grid-cols-[1.5fr_0.85fr]">
                    <form onSubmit={submit} onFocusCapture={markStarted} className="rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8" noValidate>
                        {designBrief ? <input type="hidden" name="design_brief" value={form.data.design_brief} /> : null}
                        {contextItems.length > 0 ? (
                            <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
                                    {designBrief ? <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                                    Konteks permintaan
                                </p>
                                <dl className="mt-2 space-y-1 text-sm text-ink/80">
                                    {contextItems.map((item) => (
                                        <div key={item.label} className="flex gap-1.5">
                                            <dt className="font-medium text-navy">{item.label}:</dt>
                                            <dd>{item.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Konteks ini otomatis disertakan. Anda dapat mengubah pilihan di bawah jika tidak relevan.
                                </p>
                            </div>
                        ) : null}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name">
                                    Nama <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    autoComplete="name"
                                    required
                                    aria-invalid={Boolean(form.errors.name)}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.name} className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    autoComplete="email"
                                    aria-invalid={Boolean(form.errors.email)}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.email} className="mt-1" />
                                <p className="field-hint">Isi email atau nomor WhatsApp — minimal salah satu.</p>
                            </div>

                            <div>
                                <Label htmlFor="phone">Nomor WhatsApp</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    autoComplete="tel"
                                    placeholder="08xx xxxx xxxx"
                                    aria-invalid={Boolean(form.errors.phone)}
                                    className="mt-1.5"
                                />
                                <InputError message={form.errors.phone} className="mt-1" />
                                <p className="field-hint">Bisa diisi jika lebih nyaman dihubungi lewat WhatsApp.</p>
                            </div>

                            <div>
                                <Label htmlFor="preferred_contact">Cara dihubungi</Label>
                                <NativeSelect
                                    id="preferred_contact"
                                    name="preferred_contact"
                                    value={form.data.preferred_contact}
                                    onChange={(event) => form.setData('preferred_contact', event.target.value)}
                                    className="mt-1.5"
                                >
                                    <option value="email">Email</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="phone">Telepon</option>
                                </NativeSelect>
                                <InputError message={form.errors.preferred_contact} className="mt-1" />
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-border">
                            <button
                                type="button"
                                onClick={() => setOptionalOpen((current) => !current)}
                                aria-expanded={optionalOpen}
                                aria-controls="optional-details"
                                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                            >
                                <span>
                                    <span className="block text-sm font-semibold text-navy">Detail opsional</span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                        Organisasi, paket, budget, target waktu, dan tautan referensi. Membantu kami menyiapkan estimasi
                                        yang lebih relevan.
                                    </span>
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                                        optionalOpen && 'rotate-180',
                                    )}
                                    aria-hidden="true"
                                />
                            </button>

                            {optionalOpen ? (
                                <div id="optional-details" className="grid gap-5 border-t border-border px-4 py-5 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="organization">Organisasi / bisnis</Label>
                                        <Input
                                            id="organization"
                                            name="organization"
                                            value={form.data.organization}
                                            onChange={(event) => form.setData('organization', event.target.value)}
                                            autoComplete="organization"
                                            className="mt-1.5"
                                            aria-invalid={Boolean(form.errors.organization)}
                                        />
                                        <InputError message={form.errors.organization} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="service_type">Jenis kebutuhan</Label>
                                        <NativeSelect
                                            id="service_type"
                                            name="service_type"
                                            value={form.data.service_type}
                                            onChange={(event) => form.setData('service_type', event.target.value)}
                                            className="mt-1.5"
                                        >
                                            <option value="">Belum tahu / lainnya</option>
                                            {services.map((service) => (
                                                <option key={service.slug} value={service.title}>
                                                    {service.title}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={form.errors.service_type} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="package_id">Paket yang diminati</Label>
                                        <NativeSelect
                                            id="package_id"
                                            name="package_id"
                                            value={form.data.package_id}
                                            onChange={(event) => form.setData('package_id', event.target.value)}
                                            className="mt-1.5"
                                        >
                                            <option value="">Belum memilih paket</option>
                                            {packages.map((item) => (
                                                <option key={item.id} value={String(item.id)}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={form.errors.package_id} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="portfolio_project_id">Referensi proyek</Label>
                                        <NativeSelect
                                            id="portfolio_project_id"
                                            name="portfolio_project_id"
                                            value={form.data.portfolio_project_id}
                                            onChange={(event) => form.setData('portfolio_project_id', event.target.value)}
                                            className="mt-1.5"
                                        >
                                            <option value="">Tidak ada</option>
                                            {projects.map((item) => (
                                                <option key={item.id} value={String(item.id)}>
                                                    {item.title}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={form.errors.portfolio_project_id} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="budget_range">Estimasi budget</Label>
                                        <NativeSelect
                                            id="budget_range"
                                            name="budget_range"
                                            value={form.data.budget_range}
                                            onChange={(event) => form.setData('budget_range', event.target.value)}
                                            className="mt-1.5"
                                        >
                                            <option value="">Belum ditentukan</option>
                                            {BUDGET_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={form.errors.budget_range} className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="target_timeline">Target waktu</Label>
                                        <NativeSelect
                                            id="target_timeline"
                                            name="target_timeline"
                                            value={form.data.target_timeline}
                                            onChange={(event) => form.setData('target_timeline', event.target.value)}
                                            className="mt-1.5"
                                        >
                                            <option value="">Belum ditentukan</option>
                                            {TIMELINE_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={form.errors.target_timeline} className="mt-1" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="reference_url">Tautan referensi</Label>
                                        <Input
                                            id="reference_url"
                                            name="reference_url"
                                            type="url"
                                            value={form.data.reference_url}
                                            onChange={(event) => form.setData('reference_url', event.target.value)}
                                            placeholder="https://contoh-website.com"
                                            aria-invalid={Boolean(form.errors.reference_url)}
                                            className="mt-1.5"
                                        />
                                        <InputError message={form.errors.reference_url} className="mt-1" />
                                        <p className="field-hint">Website atau contoh tampilan yang Anda suka.</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-5">
                            <Label htmlFor="message">
                                Ceritakan kebutuhan Anda <span className="text-danger">*</span>
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={form.data.message}
                                onChange={(event) => form.setData('message', event.target.value)}
                                rows={7}
                                required
                                placeholder="Masalah yang ingin diselesaikan, pengguna atau tim yang terlibat, fitur yang dibayangkan, dan batasan yang perlu kami ketahui."
                                aria-invalid={Boolean(form.errors.message)}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.message} className="mt-1" />
                            <p className="field-hint">Minimal 20 karakter. Hindari menuliskan data sensitif seperti kata sandi.</p>
                        </div>

                        <div className="mt-5">
                            <Label htmlFor="attachments">Lampiran (opsional)</Label>
                            <label
                                htmlFor="attachments"
                                className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-ice/60 px-4 py-3 text-sm text-ink/75 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                            >
                                <Paperclip className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                                <span className="font-medium text-navy">Pilih file</span>
                                <span className="ml-auto text-xs text-muted-foreground">Maks. 3 file · 5 MB</span>
                                <input
                                    key={fileInputKey}
                                    id="attachments"
                                    name="attachments[]"
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                                    onChange={handleFiles}
                                    className="sr-only"
                                />
                            </label>

                            {form.data.attachments.length > 0 ? (
                                <ul className="mt-2 space-y-1.5">
                                    {form.data.attachments.map((file, index) => (
                                        <li
                                            key={`${file.name}-${index}`}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-xs"
                                        >
                                            <span className="min-w-0 truncate text-ink/80">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-danger"
                                                aria-label={`Hapus ${file.name}`}
                                            >
                                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}

                            <InputError message={form.errors.attachments} className="mt-1" />
                            {attachmentErrors.map((message, index) => (
                                <p key={`${message}-${index}`} className="mt-1 text-sm text-danger">
                                    {message}
                                </p>
                            ))}
                            <p className="field-hint">Brief, mockup, atau dokumen pendukung. PDF, JPG, PNG, atau DOCX.</p>
                        </div>

                        <div className="sr-only" aria-hidden="true">
                            <label htmlFor="website">Website</label>
                            <input
                                id="website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form.data.website}
                                onChange={(event) => form.setData('website', event.target.value)}
                            />
                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-ice p-4">
                            <Checkbox
                                id="privacy_consent"
                                checked={form.data.privacy_consent}
                                onCheckedChange={(checked) => form.setData('privacy_consent', checked === true)}
                            />
                            <div>
                                <Label htmlFor="privacy_consent" className="text-sm font-normal leading-relaxed text-ink/80">
                                    Saya menyetujui{' '}
                                    <Link href="/kebijakan-privasi" className="font-medium text-brand-700 underline underline-offset-4">
                                        kebijakan privasi
                                    </Link>{' '}
                                    dan memahami bahwa data ini digunakan untuk menindaklanjuti permintaan saya.{' '}
                                    <span className="text-danger">*</span>
                                </Label>
                                <InputError message={form.errors.privacy_consent} className="mt-1" />
                            </div>
                        </div>

                        {form.errors.website ? <p className="mt-2 text-sm text-danger">{form.errors.website}</p> : null}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Data tidak dijual dan tidak dipakai untuk promosi.
                            </p>
                            <Button type="submit" size="lg" disabled={form.processing} className="rounded-xl">
                                {form.processing ? 'Mengirim…' : 'Kirim project brief'}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                    </form>

                    <aside className="space-y-5">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                            <h2 className="font-display text-lg font-bold text-navy">Kontak langsung</h2>
                            {site.contact.email ? (
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    onClick={() => track('email_click', { metadata: { source: 'contact_page' } })}
                                    className="mt-4 flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-ice"
                                >
                                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                                    <span className="text-sm">
                                        <span className="block font-medium text-navy">Email</span>
                                        <span className="text-muted-foreground">{site.contact.email}</span>
                                    </span>
                                </a>
                            ) : null}

                            {whatsappUrl ? (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => track('whatsapp_click', { metadata: { source: 'contact_page' } })}
                                    className="mt-3 flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-ice"
                                >
                                    <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                                    <span className="text-sm">
                                        <span className="block font-medium text-navy">WhatsApp</span>
                                        <span className="text-muted-foreground">Chat langsung dengan tim</span>
                                    </span>
                                </a>
                            ) : null}

                            {!site.contact.email && !whatsappUrl ? (
                                <p className="mt-3 rounded-xl border border-dashed border-border bg-ice p-4 text-sm leading-relaxed text-muted-foreground">
                                    Informasi kontak langsung belum dikonfigurasi. Gunakan formulir di samping — brief tetap akan
                                    masuk ke dashboard admin.
                                </p>
                            ) : null}

                            {site.contact.hours ? (
                                <p className="mt-4 text-xs text-muted-foreground">Jam kerja: {site.contact.hours}</p>
                            ) : null}
                        </div>

                        <div className="rounded-2xl border border-border bg-navy p-6 text-white">
                            <h2 className="font-display text-lg font-bold">Apa yang terjadi setelah ini?</h2>
                            <ol className="mt-4 space-y-3 text-sm text-slate-300">
                                <li className="flex gap-3">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">1</span>
                                    Tim meninjau brief dan memeriksa apakah informasinya sudah cukup.
                                </li>
                                <li className="flex gap-3">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">2</span>
                                    Kami menghubungi Anda untuk klarifikasi singkat jika diperlukan.
                                </li>
                                <li className="flex gap-3">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">3</span>
                                    Anda menerima estimasi ruang lingkup dan biaya secara tertulis.
                                </li>
                            </ol>
                        </div>

                        <div className="rounded-2xl border border-border bg-ice p-6 text-sm text-ink/75">
                            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Catatan</h2>
                            <p className="mt-2 leading-relaxed">
                                Kami tidak menerima brief yang meminta pembuatan konten palsu, ulasan palsu, atau klaim hasil yang tidak
                                dapat dibuktikan.
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </SiteLayout>
    );
}
