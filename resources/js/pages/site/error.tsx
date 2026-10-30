import { Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';

import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { SharedProps } from '@/types';
import { usePage } from '@inertiajs/react';

const MESSAGES: Record<number, { title: string; description: string }> = {
    403: { title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk membuka halaman ini.' },
    404: { title: 'Halaman tidak ditemukan', description: 'Tautan mungkin sudah berubah atau halaman telah dihapus.' },
    419: { title: 'Sesi kedaluwarsa', description: 'Muat ulang halaman lalu coba lagi.' },
    429: { title: 'Terlalu banyak permintaan', description: 'Tunggu beberapa saat sebelum mencoba lagi.' },
    500: { title: 'Terjadi kesalahan', description: 'Kami tidak dapat memproses permintaan ini. Silakan coba lagi.' },
    503: { title: 'Sedang dalam pemeliharaan', description: 'Website sedang diperbarui. Silakan kembali beberapa saat lagi.' },
};

export default function ErrorPage({ status }: { status: number }) {
    usePage<SharedProps>();
    const message = MESSAGES[status] ?? MESSAGES[500];

    return (
        <SiteLayout>
            <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
                <p className="font-display text-6xl font-extrabold text-brand-100">{status}</p>
                <h1 className="mt-3 font-display text-2xl font-bold text-navy sm:text-3xl">{message.title}</h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{message.description}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="rounded-xl">
                        <Link href="/">
                            <Home className="h-4 w-4" aria-hidden="true" />
                            Ke beranda
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/kontak">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Hubungi kami
                        </Link>
                    </Button>
                </div>
            </section>
        </SiteLayout>
    );
}
