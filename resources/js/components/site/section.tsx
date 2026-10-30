import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Section({
    children,
    className,
    id,
    tone = 'white',
}: {
    children: ReactNode;
    className?: string;
    id?: string;
    tone?: 'white' | 'ice' | 'navy';
}) {
    const tones = {
        white: 'bg-white',
        ice: 'bg-ice',
        navy: 'bg-navy text-white',
    } as const;

    return (
        <section id={id} className={cn('section-y', tones[tone], className)}>
            <div className="container-page">{children}</div>
        </section>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    tone = 'light',
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string | null;
    action?: ReactNode;
    tone?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
            <div className="max-w-2xl">
                {eyebrow ? <p className={cn('eyebrow', tone === 'dark' && 'text-brand-300')}>{eyebrow}</p> : null}
                <h2 className={cn('mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl lg:text-[2rem]', tone === 'dark' && 'text-white')}>
                    {title}
                </h2>
                {description ? (
                    <p className={cn('mt-3 text-[0.975rem] leading-relaxed text-muted-foreground', tone === 'dark' && 'text-slate-300')}>
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
