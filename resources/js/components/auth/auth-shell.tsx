import { Head } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import Logo from '@/components/site/logo';

export default function AuthShell({
    title,
    description,
    children,
    footer,
    heading,
}: {
    title: string;
    description: string;
    heading: string;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
            <Head title={title} />

            <aside className="hero-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
                <div className="grid-lines absolute inset-0" aria-hidden="true" />
                <div className="relative">
                    <Logo name="DevCraft Studio" tone="dark" />
                </div>

                <div className="relative max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Admin area</p>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight">
                        Kelola konten, portfolio, dan prospek dari satu tempat.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">
                        Semua konten publik berasal dari data yang Anda kelola di sini. Tidak ada konten yang tampil sebelum
                        dipublikasikan.
                    </p>
                </div>

                <div className="relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                    <p>
                        Akses dibatasi berdasarkan peran. Setiap perubahan penting dicatat pada activity log untuk keperluan audit.
                    </p>
                </div>
            </aside>

            <main className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border p-5 lg:hidden">
                    <Logo name="DevCraft Studio" />
                    <a href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Situs
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
                    <div className="w-full max-w-sm">
                        <h1 className="font-display text-2xl font-bold text-navy">{heading}</h1>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

                        <div className="mt-7">{children}</div>

                        {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
                    </div>
                </div>

                <div className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">
                    <a href="/" className="font-medium text-brand-700 hover:underline">
                        Kembali ke situs
                    </a>
                    <span aria-hidden="true"> · </span>
                    <span>Hanya untuk administrator</span>
                </div>
            </main>
        </div>
    );
}
