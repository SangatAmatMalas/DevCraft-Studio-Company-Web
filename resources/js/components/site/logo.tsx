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
            <img
                src="/logo-mark.png"
                alt=""
                width={36}
                height={36}
                aria-hidden="true"
                className={cn('h-9 w-9 object-contain', tone === 'dark' && 'brightness-0 invert')}
            />
            <span className={cn('font-display text-base font-bold tracking-tight', tone === 'dark' ? 'text-white' : 'text-navy')}>
                {name}
            </span>
        </Link>
    );
}
