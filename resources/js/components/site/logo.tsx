import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

export default function Logo({
    name,
    className,
    tone = 'light',
    onNavigate,
}: {
    name: string;
    className?: string;
    tone?: 'light' | 'dark';
    onNavigate?: () => void;
}) {
    return (
        <Link href="/" onClick={onNavigate} className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${name} — beranda`}>
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" fill="none" aria-hidden="true">
                    <path d="M8.5 6.5 4 12l4.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m15.5 6.5 4.5 5.5-4.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            <span className={cn('font-display text-base font-bold tracking-tight', tone === 'dark' ? 'text-white' : 'text-navy')}>
                {name}
            </span>
        </Link>
    );
}
