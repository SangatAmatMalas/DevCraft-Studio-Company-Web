import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calculator,
    Check,
    CheckCircle2,
    Clock,
    Info,
    MessageCircle,
    RotateCcw,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import type { Seo } from '@/types';

interface ProjectType {
    id: string;
    title: string;
    category: string;
    summary: string;
    base_price: number;
    base_days: number;
    page_included: string;
}

interface ScaleOption {
    id: string;
    label: string;
    description: string;
    price: number;
    extra_days: number;
}

interface Addon {
    id: string;
    title: string;
    description: string;
    price: number;
    extra_days: number;
}

interface CalculatorProps {
    projectTypes: ProjectType[];
    scaleOptions: ScaleOption[];
    addons: Addon[];
    whatsappUrl: string | null;
    seo: Seo;
}

const FAQS = [
    {
        q: 'Apakah angka estimasi ini sudah final dan mengikat?',
        a: 'Estimasi ini adalah proyeksi acuan transparan berbasis benchmark Fastwork 2026. Angka final yang mengikat dikunci di dalam proposal penawaran resmi setelah tim kami menelaah rincian spesifikasi teknis dan aset materi Anda.',
    },
    {
        q: 'Bagaimana skema pembayaran di DevCraft Studio?',
        a: 'Standar pembayaran proyek kami adalah bertahap: uang muka (DP) 50% saat kontrak disepakati untuk memulai sprint pengerjaan, dan pelunasan 50% setelah website lolos pengujian (UAT/QA) di staging server sebelum serah terima kode dan peluncuran.',
    },
    {
        q: 'Apakah harga sudah mencakup domain dan hosting/cloud server?',
        a: 'Untuk paket Landing Page dan Company Profile, deployment dapat menggunakan cloud hosting terkelola yang kami sediakan. Untuk aplikasi web atau infrastruktur kustom, biaya langganan server (misal VPS / Cloud provider) dibayar langsung oleh klien agar akun infrastruktur menjadi milik penuh klien.',
    },
    {
        q: 'Bagaimana jika saya memerlukan fitur yang tidak ada di daftar pilihan?',
        a: 'Kirimkan project brief Anda melalui formulir kontak atau konsultasikan langsung via WhatsApp. Kami berpengalaman membangun arsitektur kustom yang dapat disesuaikan persis dengan alur kerja bisnis Anda.',
    },
];

export default function CalculatorPage({ projectTypes, scaleOptions, addons, whatsappUrl, seo }: CalculatorProps) {
    const [selectedTypeId, setSelectedTypeId] = useState<string>(projectTypes[0]?.id ?? 'landing_page');
    const [selectedScaleId, setSelectedScaleId] = useState<string>(scaleOptions[0]?.id ?? 'standard');
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
    const [isRush, setIsRush] = useState<boolean>(false);

    const selectedType = useMemo(
        () => projectTypes.find((item) => item.id === selectedTypeId) ?? projectTypes[0],
        [projectTypes, selectedTypeId],
    );

    const selectedScale = useMemo(
        () => scaleOptions.find((item) => item.id === selectedScaleId) ?? scaleOptions[0],
        [scaleOptions, selectedScaleId],
    );

    const selectedAddonsList = useMemo(
        () => addons.filter((item) => selectedAddonIds.includes(item.id)),
        [addons, selectedAddonIds],
    );

    function toggleAddon(addonId: string) {
        setSelectedAddonIds((current) =>
            current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId],
        );
    }

    function resetEstimator() {
        setSelectedTypeId(projectTypes[0]?.id ?? 'landing_page');
        setSelectedScaleId(scaleOptions[0]?.id ?? 'standard');
        setSelectedAddonIds([]);
        setIsRush(false);
    }

    // Calculations
    const baseSubtotal = (selectedType?.base_price ?? 0) + (selectedScale?.price ?? 0);
    const addonsSubtotal = selectedAddonsList.reduce((sum, item) => sum + item.price, 0);
    const rawTotal = baseSubtotal + addonsSubtotal;
    const finalMinTotal = Math.round(isRush ? rawTotal * 1.25 : rawTotal);
    const finalMaxTotal = Math.round(finalMinTotal * 1.18);

    const baseDays = (selectedType?.base_days ?? 5) + (selectedScale?.extra_days ?? 0);
    const addonsDays = selectedAddonsList.reduce((sum, item) => sum + item.extra_days, 0);
    const totalDaysRaw = baseDays + addonsDays;
    const minDays = isRush ? Math.max(3, Math.round(totalDaysRaw * 0.6)) : totalDaysRaw;
    const maxDays = isRush ? Math.max(minDays + 2, Math.round(totalDaysRaw * 0.75) + 2) : totalDaysRaw + 5;

    // Contact link with prefilled parameters
    const contactUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (selectedType) {
            params.set('service_type', selectedType.title);
        }
        params.set('budget_range', `${formatCurrency(finalMinTotal)} – ${formatCurrency(finalMaxTotal)}`);

        const featuresList = selectedAddonsList.length > 0
            ? selectedAddonsList.map((item) => item.title).join(', ')
            : 'Tanpa add-on tambahan';

        const message = [
            `Halo DevCraft Studio, saya telah melakukan kalkulasi estimasi di website untuk kebutuhan berikut:`,
            `• Solusi: ${selectedType?.title ?? '-'}`,
            `• Skala halaman: ${selectedScale?.label ?? '-'}`,
            `• Add-on fitur: ${featuresList}`,
            `• Timeline: ${isRush ? 'Prioritas / Kilat' : 'Standar normal'} (${minDays}–${maxDays} hari kerja)`,
            `• Estimasi biaya: ${formatCurrency(finalMinTotal)} – ${formatCurrency(finalMaxTotal)}`,
            ``,
            `Mohon dapat ditinjau ketersediaan slot pengerjaan dan detail implementasinya.`,
        ].join('\n');

        params.set('message', message);
        params.set('source_type', 'cost_estimator');

        return `/kontak?${params.toString()}`;
    }, [selectedType, selectedScale, selectedAddonsList, isRush, finalMinTotal, finalMaxTotal, minDays, maxDays]);

    // WhatsApp link with prefilled message
    const directWaUrl = useMemo(() => {
        if (!whatsappUrl) {
            return null;
        }

        const featuresList = selectedAddonsList.length > 0
            ? selectedAddonsList.map((item) => item.title).join(', ')
            : 'Standar';

        const text = [
            `Halo DevCraft Studio, saya ingin konsultasi proyek berdasarkan hasil kalkulator estimasi:`,
            `• Proyek: ${selectedType?.title ?? '-'}`,
            `• Skala: ${selectedScale?.label ?? '-'}`,
            `• Fitur: ${featuresList}`,
            `• Estimasi: ${formatCurrency(finalMinTotal)} – ${formatCurrency(finalMaxTotal)} (${minDays}–${maxDays} hari)`,
            ``,
            `Apakah bisa dijadwalkan sesi diskusi singkat? Terima kasih.`,
        ].join('\n');

        // Extract base WhatsApp URL before existing query text if any
        const baseUrl = whatsappUrl.split('?')[0];
        return `${baseUrl}?text=${encodeURIComponent(text)}`;
    }, [whatsappUrl, selectedType, selectedScale, selectedAddonsList, finalMinTotal, finalMaxTotal, minDays, maxDays]);

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <div className="border-b border-border bg-gradient-to-b from-brand-50/50 via-ice/40 to-white py-12 md:py-16">
                <div className="container-page">
                    <Breadcrumbs
                        items={[
                            { label: 'Beranda', href: '/' },
                            { label: 'Kalkulator Biaya', href: '/kalkulator' },
                        ]}
                    />

                    <div className="mt-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1 text-xs font-semibold text-brand-800">
                            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                            Transparansi Biaya & Timeline
                        </div>
                        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl md:text-5xl">
                            Kalkulator Estimasi Biaya Pembuatan Website
                        </h1>
                        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                            Rancang perkiraan investasi dan durasi pengerjaan website atau aplikasi web Anda secara mandiri.
                            Dihitung transparan berdasarkan benchmark pasar Fastwork 2026 tanpa biaya tersembunyi.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container-page py-10 md:py-14">
                <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
                    {/* Left Column: Interactive Steps */}
                    <div className="space-y-10">
                        {/* Step 1: Project Type */}
                        <section aria-labelledby="step-1-title" className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Langkah 1</span>
                                    <h2 id="step-1-title" className="mt-1 font-display text-xl font-bold text-navy sm:text-2xl">
                                        Pilih Jenis Solusi Web
                                    </h2>
                                </div>
                                <span className="rounded-full bg-ice px-3 py-1 text-xs font-semibold text-slate-600">Wajib</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                Pilih kategori solusi digital yang paling mendekati model bisnis atau kebutuhan Anda saat ini.
                            </p>

                            <div className="mt-6 space-y-3">
                                {projectTypes.map((type) => {
                                    const isSelected = selectedTypeId === type.id;

                                    return (
                                        <label
                                            key={type.id}
                                            onClick={() => setSelectedTypeId(type.id)}
                                            className={`relative flex cursor-pointer flex-col rounded-xl border p-4.5 transition-all sm:flex-row sm:items-center sm:justify-between ${
                                                isSelected
                                                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-600/20'
                                                    : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-3.5">
                                                <div
                                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                        isSelected
                                                            ? 'border-brand-600 bg-brand-600 text-white'
                                                            : 'border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-base font-bold text-navy">{type.title}</span>
                                                        <span className="rounded-md bg-ice px-2 py-0.5 text-[0.7rem] font-medium text-slate-600">
                                                            {type.category}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{type.summary}</p>
                                                    <p className="mt-1.5 text-[0.75rem] font-medium text-brand-800">
                                                        Cakupan: {type.page_included}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-left sm:mt-0 sm:text-right">
                                                <div className="font-display text-sm font-bold text-navy sm:text-base">
                                                    Mulai {formatCurrency(type.base_price)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">~{type.base_days} hari kerja</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Step 2: Page Scale */}
                        <section aria-labelledby="step-2-title" className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-7">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Langkah 2</span>
                            <h2 id="step-2-title" className="mt-1 font-display text-xl font-bold text-navy sm:text-2xl">
                                Skala Struktur & Volume Halaman
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Sesuaikan kebutuhan penambahan halaman materi di luar jumlah bawaan paket.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {scaleOptions.map((scale) => {
                                    const isSelected = selectedScaleId === scale.id;

                                    return (
                                        <label
                                            key={scale.id}
                                            onClick={() => setSelectedScaleId(scale.id)}
                                            className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                                                isSelected
                                                    ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-600/20'
                                                    : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-navy">{scale.label}</span>
                                                    <div
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                            isSelected
                                                                ? 'border-brand-600 bg-brand-600 text-white'
                                                                : 'border-slate-300 bg-white'
                                                        }`}
                                                    >
                                                        {isSelected ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-600">{scale.description}</p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                                                <span className="font-semibold text-navy">
                                                    {scale.price === 0 ? 'Sudah termasuk' : `+${formatCurrency(scale.price)}`}
                                                </span>
                                                {scale.extra_days > 0 ? (
                                                    <span className="text-muted-foreground">+{scale.extra_days} hari</span>
                                                ) : null}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Step 3: Add-ons */}
                        <section aria-labelledby="step-3-title" className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-7">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Langkah 3</span>
                            <h2 id="step-3-title" className="mt-1 font-display text-xl font-bold text-navy sm:text-2xl">
                                Fitur Tambahan & Integrasi
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Pilih kapabilitas spesifik yang ingin Anda integrasikan ke dalam website.
                            </p>

                            <div className="mt-6 space-y-3">
                                {addons.map((addon) => {
                                    const isChecked = selectedAddonIds.includes(addon.id);

                                    return (
                                        <label
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                                                isChecked
                                                    ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-600/30'
                                                    : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-3.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}} // handled by parent onClick
                                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-navy">{addon.title}</span>
                                                    <p className="mt-0.5 text-xs text-slate-600">{addon.description}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-left sm:mt-0 sm:text-right shrink-0">
                                                <div className="font-semibold text-sm text-navy">+{formatCurrency(addon.price)}</div>
                                                {addon.extra_days > 0 ? (
                                                    <div className="text-[0.7rem] text-muted-foreground">+{addon.extra_days} hari</div>
                                                ) : null}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Step 4: Speed / Priority */}
                        <section aria-labelledby="step-4-title" className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-7">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Langkah 4</span>
                            <h2 id="step-4-title" className="mt-1 font-display text-xl font-bold text-navy sm:text-2xl">
                                Kecepatan Pengerjaan (Timeline)
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Butuh website selesai lebih cepat untuk jadwal peluncuran atau kampanye tertentu?
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <label
                                    onClick={() => setIsRush(false)}
                                    className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                                        !isRush
                                            ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-600/20'
                                            : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-navy">Jadwal Standar Terencana</span>
                                            <div
                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                    !isRush
                                                        ? 'border-brand-600 bg-brand-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {!isRush ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Alur sprint teratur dengan ritme review standar per milestone.
                                        </p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-border/60 text-xs font-semibold text-navy">
                                        Tanpa biaya tambahan
                                    </div>
                                </label>

                                <label
                                    onClick={() => setIsRush(true)}
                                    className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                                        isRush
                                            ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-600/20'
                                            : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                <span className="text-sm font-bold text-navy">Prioritas / Kilat (+25%)</span>
                                            </div>
                                            <div
                                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                    isRush
                                                        ? 'border-brand-600 bg-brand-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}
                                            >
                                                {isRush ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Dedikasi sprint penuh dengan kompresi timeline hingga ~40% lebih cepat.
                                        </p>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-border/60 text-xs font-semibold text-amber-700">
                                        +25% dari total biaya
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Live Summary Sticky Card */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-md shadow-brand-500/5">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h3 className="font-display text-lg font-bold text-navy">Ringkasan Estimasi</h3>
                                <button
                                    type="button"
                                    onClick={resetEstimator}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700"
                                    title="Reset ke pilihan awal"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </button>
                            </div>

                            {/* Estimated Price Range */}
                            <div className="mt-5 rounded-xl bg-gradient-to-br from-brand-50 to-ice/60 p-4 border border-brand-100">
                                <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                                    Rentang Estimasi Investasi
                                </span>
                                <div className="mt-1 font-display text-2xl font-black text-navy sm:text-3xl">
                                    {formatCurrency(finalMinTotal)}
                                </div>
                                <div className="text-xs font-medium text-slate-600">
                                    sampai dengan {formatCurrency(finalMaxTotal)}
                                </div>
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                                    <Clock className="h-3.5 w-3.5 text-brand-700" />
                                    <span>Estimasi waktu: <strong className="text-navy">{minDays} – {maxDays} hari kerja</strong></span>
                                </div>
                            </div>

                            {/* Selected Configuration Breakdown */}
                            <div className="mt-5 space-y-3 text-xs">
                                <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
                                    <span className="text-muted-foreground">Tipe solusi:</span>
                                    <span className="font-semibold text-navy text-right">{selectedType?.title}</span>
                                </div>
                                <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
                                    <span className="text-muted-foreground">Skala halaman:</span>
                                    <span className="font-semibold text-navy text-right">{selectedScale?.label}</span>
                                </div>
                                <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
                                    <span className="text-muted-foreground">Kecepatan:</span>
                                    <span className="font-semibold text-navy text-right">
                                        {isRush ? 'Prioritas / Kilat' : 'Standar normal'}
                                    </span>
                                </div>

                                {selectedAddonsList.length > 0 ? (
                                    <div className="pt-1">
                                        <span className="text-muted-foreground">Fitur & add-on terpilih ({selectedAddonsList.length}):</span>
                                        <ul className="mt-2 space-y-1.5 pl-2">
                                            {selectedAddonsList.map((addon) => (
                                                <li key={addon.id} className="flex items-center justify-between text-[0.75rem]">
                                                    <span className="text-slate-700 truncate pr-2">• {addon.title}</span>
                                                    <span className="font-medium text-navy shrink-0">+{formatCurrency(addon.price)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-[0.75rem] text-slate-500 italic">Belum ada add-on tambahan yang dipilih.</p>
                                )}
                            </div>

                            {/* CTAs */}
                            <div className="mt-6 space-y-2.5">
                                <Button asChild className="w-full justify-center shadow-sm">
                                    <Link href={contactUrl}>
                                        Konsultasikan Estimasi Ini
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>

                                {directWaUrl ? (
                                    <Button asChild variant="outline" className="w-full justify-center border-success/40 text-success hover:bg-success/10 hover:text-success">
                                        <a href={directWaUrl} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                            Tanya Cepat via WhatsApp
                                        </a>
                                    </Button>
                                ) : null}
                            </div>

                            <p className="mt-4 flex items-start gap-1.5 text-[0.7rem] leading-relaxed text-slate-500">
                                <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                                Estimasi bersifat indikatif. Spesifikasi akhir, alur persetujuan, dan penawaran resmi akan dikonfirmasi lewat proposal tertulis.
                            </p>
                        </div>

                        {/* Transparency guarantee callout */}
                        <div className="rounded-2xl border border-border bg-ice/60 p-5 text-xs space-y-2.5">
                            <div className="flex items-center gap-2 font-semibold text-navy">
                                <ShieldCheck className="h-4 w-4 text-brand-700" />
                                Standar Transparansi DevCraft Studio
                            </div>
                            <ul className="space-y-1.5 text-slate-600">
                                <li className="flex items-start gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                    <span>Kepemilikan kode sumber penuh (full source code) tanpa sistem sewa.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                    <span>Skema pembayaran bertahap (termin) berdasarkan milestone teruji.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                    <span>Garansi perbaikan bug dan pendampingan teknis setelah serah terima.</span>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 border-t border-border pt-12">
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Pertanyaan Umum</span>
                        <h2 className="mt-1 font-display text-2xl font-bold text-navy sm:text-3xl">
                            Seputar Estimasi Biaya & Pengerjaan
                        </h2>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="rounded-xl border border-border bg-white p-5">
                                <h3 className="font-semibold text-sm text-navy">{faq.q}</h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
