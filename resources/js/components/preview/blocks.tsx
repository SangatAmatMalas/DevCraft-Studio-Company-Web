import { ArrowRight, Check, Mail, MapPin, MessageCircle } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { DesignBriefPreview } from '@/types';

export type PreviewVariant = 'bold' | 'editorial' | 'catalog';

type PreviewStyle = CSSProperties & { '--pv-primary': string };

export function previewStyle(brief: DesignBriefPreview): PreviewStyle {
    return { '--pv-primary': brief.primary_color };
}

export function mix(color: string, percent: number): string {
    return `color-mix(in srgb, ${color} ${percent}%, white)`;
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function PreviewNav({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const links = [
        brief.sections.includes('services') ? { label: 'Layanan', href: '#layanan' } : null,
        brief.sections.includes('about') ? { label: 'Tentang', href: '#tentang' } : null,
        brief.sections.includes('gallery') ? { label: 'Galeri', href: '#galeri' } : null,
        brief.sections.includes('faq') ? { label: 'FAQ', href: '#faq' } : null,
        { label: 'Kontak', href: '#kontak' },
    ].filter(Boolean) as { label: string; href: string }[];

    if (variant === 'bold') {
        return (
            <header className="border-b border-white/10 bg-[#0f172a] px-5 py-4 text-white sm:px-8">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <BrandMark brief={brief} tone="dark" />
                    <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
                        {links.map((link) => (
                            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <a
                        href="#kontak"
                        className="hidden rounded-full bg-[var(--pv-primary)] px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
                    >
                        Hubungi kami
                    </a>
                </div>
            </header>
        );
    }

    if (variant === 'editorial') {
        return (
            <header className="border-b border-[#e7e1d8] bg-[#faf8f4] px-5 py-5 text-[#2b2620] sm:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
                    <BrandMark brief={brief} tone="light" />
                    <nav className="hidden items-center gap-7 text-sm tracking-wide text-[#6c6358] md:flex">
                        {links.map((link) => (
                            <a key={link.href} href={link.href} className="transition-colors hover:text-[#2b2620]">
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <a
                        href="#kontak"
                        className="hidden border border-[#2b2620] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] sm:inline-flex"
                    >
                        Diskusi
                    </a>
                </div>
            </header>
        );
    }

    return (
        <header className="border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
            <div className="mx-auto flex max-w-6xl items-center gap-4">
                <BrandMark brief={brief} tone="light" />
                <div className="ml-auto hidden max-w-md flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-400 md:flex">
                    <span className="h-3 w-3 rounded-full border border-slate-300" aria-hidden="true" />
                    Cari produk atau layanan…
                </div>
                <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
                    {links.slice(0, 3).map((link) => (
                        <a key={link.href} href={link.href} className="hover:text-slate-900">
                            {link.label}
                        </a>
                    ))}
                </nav>
                <a
                    href="#kontak"
                    className="rounded-full bg-[var(--pv-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                    Hubungi
                </a>
            </div>
        </header>
    );
}

export function BrandMark({ brief, tone = 'light' }: { brief: DesignBriefPreview; tone?: 'light' | 'dark' }) {
    return (
        <a href="#atas" className="flex items-center gap-2.5">
            <span
                className="grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold text-white"
                style={{ backgroundColor: 'var(--pv-primary)' }}
            >
                {initials(brief.brand_name)}
            </span>
            <span className={cn('font-display text-base font-bold tracking-tight', tone === 'dark' ? 'text-white' : 'text-slate-900')}>
                {brief.brand_name}
            </span>
        </a>
    );
}

function SectionLabel({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
    return (
        <p
            className={cn(
                'text-[0.68rem] font-semibold uppercase tracking-[0.22em]',
                tone === 'dark' ? 'text-white/60' : 'text-slate-500',
            )}
        >
            {children}
        </p>
    );
}

export function HeroBold({ brief }: { brief: DesignBriefPreview }) {
    return (
        <section id="atas" className="relative overflow-hidden bg-[#0f172a] px-5 py-16 text-white sm:px-8 sm:py-24">
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: 'var(--pv-primary)' }}
                aria-hidden="true"
            />
            <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <SectionLabel tone="dark">{brief.category_label}</SectionLabel>
                    <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                        {brief.tagline || brief.brand_name}
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
                        {brief.description ||
                            `Halaman ini akan menampilkan ${brief.brand_name} secara ringkas: siapa Anda, apa yang dikerjakan, dan bagaimana calon pelanggan bisa menghubungi.`}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#kontak"
                            className="inline-flex items-center gap-2 rounded-full bg-[var(--pv-primary)] px-6 py-3 text-sm font-semibold text-white"
                        >
                            Mulai diskusi
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                        {brief.sections.includes('services') ? (
                            <a
                                href="#layanan"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80"
                            >
                                Lihat layanan
                            </a>
                        ) : null}
                    </div>
                </div>
                <div className="relative hidden lg:block">
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                        <div className="flex items-center justify-between text-xs text-white/50">
                            <span>{brief.brand_name}</span>
                            <span>{brief.category_label}</span>
                        </div>
                        <div className="mt-4 aspect-[4/3] overflow-hidden rounded-xl" style={{ background: mix('var(--pv-primary)', 26) }}>
                            <div className="grid h-full grid-cols-2 gap-2 p-3">
                                {brief.services.slice(0, 3).map((service, index) => (
                                    <div
                                        key={service.title}
                                        className={cn(
                                            'rounded-lg bg-white/10 p-3 text-[0.7rem] text-white/80',
                                            index === 0 && 'col-span-2',
                                        )}
                                    >
                                        {service.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[0.7rem] text-white/50">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            Slot visual akan diganti foto asli saat produksi
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function HeroEditorial({ brief }: { brief: DesignBriefPreview }) {
    return (
        <section id="atas" className="bg-[#faf8f4] px-5 py-14 text-[#2b2620] sm:px-8 sm:py-20">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                    <SectionLabel>{brief.category_label}</SectionLabel>
                    <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                        {brief.brand_name}
                    </h1>
                    <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#6c6358]">
                        {brief.tagline || 'Satu halaman tenang untuk menjelaskan pekerjaan Anda dengan jelas.'}
                    </p>
                    {brief.description ? (
                        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#6c6358]">{brief.description}</p>
                    ) : null}
                    <a
                        href="#kontak"
                        className="mt-8 inline-flex items-center gap-2 border-b-2 border-[var(--pv-primary)] pb-1 text-sm font-semibold text-[#2b2620]"
                    >
                        Mulai percakapan
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
                <div className="relative">
                    <div className="aspect-[4/5] rounded-sm border border-[#e7e1d8] p-4">
                        <div
                            className="flex h-full flex-col justify-between rounded-sm p-6 text-white"
                            style={{ background: 'linear-gradient(150deg, var(--pv-primary), color-mix(in srgb, var(--pv-primary) 55%, #0f172a))' }}
                        >
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/70">
                                {brief.category_label}
                            </span>
                            <div>
                                <p className="font-display text-3xl font-semibold leading-tight">{initials(brief.brand_name)}</p>
                                <p className="mt-3 text-xs leading-relaxed text-white/70">
                                    Visual utama akan diisi foto atau karya pilihan Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-[#9a9084]">Preview · bukan foto final</p>
                </div>
            </div>
        </section>
    );
}

export function HeroCatalog({ brief }: { brief: DesignBriefPreview }) {
    return (
        <section id="atas" className="border-b border-slate-200 bg-white px-5 py-10 sm:px-8 sm:py-14">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{brief.category_label}</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-500">{brief.style === 'bold' ? 'Tegas' : brief.style === 'elegant' ? 'Premium' : 'Minimal'}</span>
                </div>
                <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            {brief.tagline || brief.brand_name}
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
                            {brief.description ||
                                `Katalog ${brief.brand_name} akan menampilkan item unggulan, kategori, dan cara pemesanan dalam satu halaman.`}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {brief.services.slice(0, 4).map((service, index) => (
                                <span
                                    key={service.title}
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-xs font-medium',
                                        index === 0 ? 'bg-[var(--pv-primary)] text-white' : 'border border-slate-200 text-slate-600',
                                    )}
                                >
                                    {service.title}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                className="aspect-square rounded-lg"
                                style={{
                                    background:
                                        index === 0
                                            ? mix('var(--pv-primary)', 55)
                                            : index === 1
                                              ? mix('var(--pv-primary)', 25)
                                              : '#eef2f7',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function ServicesBold({ brief }: { brief: DesignBriefPreview }) {
    if (!brief.services.length) {
        return null;
    }

    return (
        <section id="layanan" className="bg-white px-5 py-16 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <SectionLabel>Layanan</SectionLabel>
                <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-slate-900">
                    Apa yang bisa Anda dapatkan
                </h2>
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {brief.services.map((service, index) => (
                        <article key={service.title} className="rounded-2xl border border-slate-200 p-6">
                            <span className="text-xs font-bold text-[var(--pv-primary)]">{String(index + 1).padStart(2, '0')}</span>
                            <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{service.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                {service.description || 'Deskripsi singkat layanan ini akan diisi saat produksi.'}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ServicesEditorial({ brief }: { brief: DesignBriefPreview }) {
    if (!brief.services.length) {
        return null;
    }

    return (
        <section id="layanan" className="border-t border-[#e7e1d8] bg-[#faf8f4] px-5 py-16 text-[#2b2620] sm:px-8">
            <div className="mx-auto max-w-5xl">
                <SectionLabel>Yang kami kerjakan</SectionLabel>
                <div className="mt-8 divide-y divide-[#e7e1d8] border-y border-[#e7e1d8]">
                    {brief.services.map((service, index) => (
                        <div key={service.title} className="grid gap-2 py-6 sm:grid-cols-[3rem_0.9fr_1.3fr] sm:gap-6">
                            <span className="text-xs text-[#9a9084]">{String(index + 1).padStart(2, '0')}</span>
                            <h3 className="font-display text-lg font-semibold">{service.title}</h3>
                            <p className="text-sm leading-relaxed text-[#6c6358]">
                                {service.description || 'Penjelasan singkat akan ditambahkan di sini.'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ServicesCatalog({ brief }: { brief: DesignBriefPreview }) {
    if (!brief.services.length) {
        return null;
    }

    return (
        <section id="layanan" className="bg-slate-50 px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <SectionLabel>Katalog</SectionLabel>
                        <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Pilihan untuk Anda</h2>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Semua</span>
                        <span className="rounded-full border border-slate-200 px-3 py-1.5">Populer</span>
                        <span className="rounded-full border border-slate-200 px-3 py-1.5">Baru</span>
                    </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {brief.services.map((service, index) => (
                        <article key={service.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="aspect-[16/9]" style={{ backgroundColor: mix('var(--pv-primary)', index === 0 ? 45 : 14) }} />
                            <div className="p-4">
                                <h3 className="font-display text-base font-bold text-slate-900">{service.title}</h3>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    {service.description || 'Deskripsi item akan diisi saat produksi.'}
                                </p>
                                <p className="mt-3 text-xs font-semibold text-[var(--pv-primary)]">Lihat detail</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function AboutBlock({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const heading =
        variant === 'catalog' ? 'Tentang katalog ini' : variant === 'editorial' ? 'Tentang kami' : 'Kenali kami lebih dekat';

    return (
        <section
            id="tentang"
            className={cn(
                'px-5 py-16 sm:px-8',
                variant === 'bold' && 'bg-[#0f172a] text-white',
                variant === 'editorial' && 'bg-white text-[#2b2620]',
                variant === 'catalog' && 'bg-white text-slate-900',
            )}
        >
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                <h2 className="font-display text-3xl font-bold tracking-tight">{heading}</h2>
                <div>
                    <p
                        className={cn(
                            'text-base leading-relaxed',
                            variant === 'bold' ? 'text-white/70' : 'text-slate-600',
                        )}
                    >
                        {brief.description ||
                            `Bagian ini akan menceritakan ${brief.brand_name} secara lebih personal: latar belakang, cara kerja, dan alasan pelanggan memilih Anda.`}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {(brief.services.slice(0, 2).length ? brief.services.slice(0, 2) : [{ title: 'Fokus', description: null }, { title: 'Pendekatan', description: null }]).map(
                            (item) => (
                                <div
                                    key={item.title}
                                    className={cn(
                                        'rounded-xl border p-4 text-sm',
                                        variant === 'bold' ? 'border-white/15 text-white/70' : 'border-slate-200 text-slate-600',
                                    )}
                                >
                                    <span className="font-semibold">{item.title}</span>
                                    <p className="mt-1 text-xs opacity-80">
                                        {item.description || 'Penjelasan singkat akan ditambahkan saat produksi.'}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function GalleryBlock({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const tiles = [0, 1, 2, 3, 4, 5];

    return (
        <section
            id="galeri"
            aria-label={`Galeri ${brief.brand_name}`}
            className={cn(
                'px-5 py-16 sm:px-8',
                variant === 'bold' && 'bg-slate-100',
                variant === 'editorial' && 'bg-[#f3efe8]',
                variant === 'catalog' && 'bg-white',
            )}
        >
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <SectionLabel>{variant === 'catalog' ? 'Etalase' : 'Galeri'}</SectionLabel>
                        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            {variant === 'catalog' ? 'Contoh tampilan item' : 'Karya dan suasana'}
                        </h2>
                    </div>
                    <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                        Slot gambar di bawah adalah placeholder. Foto asli akan menggantikannya saat produksi.
                    </p>
                </div>
                <div
                    className={cn(
                        'mt-8 grid gap-3',
                        variant === 'editorial' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3',
                    )}
                >
                    {tiles.map((tile) => (
                        <div
                            key={tile}
                            className={cn(
                                'relative overflow-hidden rounded-xl border border-black/5',
                                variant === 'editorial' && tile === 0 && 'sm:col-span-2 sm:row-span-2',
                            )}
                            style={{
                                aspectRatio: variant === 'editorial' && tile === 0 ? '1 / 1' : '4 / 3',
                                background:
                                    tile % 3 === 0
                                        ? mix('var(--pv-primary)', 40)
                                        : tile % 3 === 1
                                          ? '#e8e4dc'
                                          : mix('var(--pv-primary)', 12),
                            }}
                        >
                            <span className="absolute bottom-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[0.6rem] font-medium text-slate-600">
                                Slot visual {String(tile + 1).padStart(2, '0')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FaqBlock({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const items = [
        {
            question: 'Berapa lama proses pengerjaan?',
            answer: 'Timeline ditentukan setelah ruang lingkup, jumlah halaman, dan materi konten disepakati bersama.',
        },
        {
            question: 'Apakah halaman bisa ditambah nanti?',
            answer: 'Bisa. Penambahan halaman atau fitur dihitung terpisah agar biaya dan waktu tetap jelas.',
        },
        {
            question: 'Siapa yang menyiapkan konten?',
            answer: 'Konten disiapkan pemilik usaha. Kami membantu menata struktur dan menyesuaikan panjang teks agar nyaman dibaca.',
        },
    ];

    return (
        <section
            id="faq"
            className={cn(
                'px-5 py-16 sm:px-8',
                variant === 'bold' && 'bg-white',
                variant === 'editorial' && 'bg-[#faf8f4]',
                variant === 'catalog' && 'bg-slate-50',
            )}
        >
            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                <div>
                    <SectionLabel>Pertanyaan umum</SectionLabel>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sebelum memulai</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Jawaban di bawah bersifat umum dan akan disesuaikan dengan proses {brief.brand_name}.
                    </p>
                </div>
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                    {items.map((item) => (
                        <details key={item.question} className="group py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                                {item.question}
                                <span className="text-[var(--pv-primary)] transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ContactBlock({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const hasContact = Boolean(brief.contact.whatsapp || brief.contact.email || brief.contact.city);
    const dark = variant === 'bold';

    return (
        <section
            id="kontak"
            className={cn(
                'px-5 py-16 sm:px-8',
                dark && 'bg-[#0f172a] text-white',
                variant === 'editorial' && 'bg-[var(--pv-primary)] text-white',
                variant === 'catalog' && 'bg-white text-slate-900',
            )}
        >
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
                <div>
                    <SectionLabel tone={dark || variant === 'editorial' ? 'dark' : 'light'}>Kontak</SectionLabel>
                    <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
                        {variant === 'catalog' ? 'Pesan atau tanyakan sesuatu' : 'Mari bicara'}
                    </h2>
                    <p className={cn('mt-3 max-w-md text-sm leading-relaxed', dark || variant === 'editorial' ? 'text-white/70' : 'text-slate-600')}>
                        Bagian ini akan memuat kanal kontak resmi {brief.brand_name}. Form di samping hanya contoh tampilan dan tidak mengirim data.
                    </p>

                    {hasContact ? (
                        <ul className="mt-6 space-y-3 text-sm">
                            {brief.contact.whatsapp ? (
                                <li className="flex items-center gap-3">
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    {brief.contact.whatsapp}
                                </li>
                            ) : null}
                            {brief.contact.email ? (
                                <li className="flex items-center gap-3">
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    {brief.contact.email}
                                </li>
                            ) : null}
                            {brief.contact.city ? (
                                <li className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                    {brief.contact.city}
                                </li>
                            ) : null}
                        </ul>
                    ) : (
                        <p className={cn('mt-5 rounded-xl border border-dashed p-4 text-xs', dark ? 'border-white/20 text-white/60' : 'border-slate-300 text-slate-500')}>
                            Nomor WhatsApp, email, dan kota belum diisi pada brief. Informasi ini akan tampil setelah dilengkapi.
                        </p>
                    )}
                </div>

                <div
                    className={cn(
                        'rounded-2xl border p-5',
                        dark || variant === 'editorial' ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50',
                    )}
                >
                    <div className="grid gap-3">
                        <div className={cn('rounded-lg border px-3 py-2 text-xs', dark ? 'border-white/15 text-white/50' : 'border-slate-200 bg-white text-slate-400')}>
                            Nama
                        </div>
                        <div className={cn('rounded-lg border px-3 py-2 text-xs', dark ? 'border-white/15 text-white/50' : 'border-slate-200 bg-white text-slate-400')}>
                            Email atau WhatsApp
                        </div>
                        <div className={cn('rounded-lg border px-3 py-8 text-xs', dark ? 'border-white/15 text-white/50' : 'border-slate-200 bg-white text-slate-400')}>
                            Pesan
                        </div>
                        <div className="rounded-lg bg-[var(--pv-primary)] px-4 py-2.5 text-center text-xs font-semibold text-white">
                            Kirim pesan
                        </div>
                    </div>
                    <p className={cn('mt-3 text-center text-[0.65rem]', dark || variant === 'editorial' ? 'text-white/50' : 'text-slate-400')}>
                        Form contoh · tidak terhubung ke server
                    </p>
                </div>
            </div>
        </section>
    );
}

export function PreviewFooter({ brief, variant }: { brief: DesignBriefPreview; variant: PreviewVariant }) {
    const dark = variant === 'bold' || variant === 'editorial';

    return (
        <footer className={cn('px-5 py-8 text-xs sm:px-8', dark ? 'bg-[#0b1220] text-white/50' : 'border-t border-slate-200 bg-slate-50 text-slate-500')}>
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md text-[0.6rem] font-bold text-white" style={{ backgroundColor: 'var(--pv-primary)' }}>
                        {initials(brief.brand_name)}
                    </span>
                    <span>
                        {brief.brand_name} · {brief.category_label}
                    </span>
                </div>
                <p>Preview dibuat dengan DevCraft Studio · {new Date().getFullYear()}</p>
            </div>
        </footer>
    );
}
