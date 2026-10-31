import { Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PackageCard as PackageCardType } from '@/types';

export default function PackageCard({
    package: pkg,
    className,
    designToken,
}: {
    package: PackageCardType;
    className?: string;
    designToken?: string | null;
}) {
    return (
        <article
            className={cn(
                'relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-soft',
                pkg.is_featured ? 'border-brand-300 ring-1 ring-brand-200' : 'border-border',
                className,
            )}
        >
            {pkg.is_featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                    Direkomendasikan
                </span>
            ) : null}

            <h3 className="font-display text-lg font-bold text-navy">{pkg.name}</h3>
            {pkg.target_audience ? <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{pkg.target_audience}</p> : null}
            {pkg.tagline ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pkg.tagline}</p> : null}

            <div className="mt-5 rounded-xl bg-ice p-4">
                <p className="font-display text-xl font-bold text-navy">{pkg.price_display}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {pkg.billing_label}
                    {pkg.timeline_label ? ` · ${pkg.timeline_label}` : ''}
                </p>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-ink/80">
                {pkg.target_audience ? (
                    <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                        Cocok untuk {pkg.target_audience.toLowerCase()}
                    </li>
                ) : null}
                <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    Ruang lingkup dan batasan ditulis jelas
                </li>
            </ul>

            <div className="mt-6 flex flex-1 items-end">
                <Link href={designToken ? `${pkg.url}?desain=${encodeURIComponent(designToken)}` : pkg.url} className="link-arrow">
                    Lihat detail paket
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
