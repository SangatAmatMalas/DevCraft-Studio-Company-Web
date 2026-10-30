import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export default function Panel({
    children,
    title,
    description,
    actions,
    className,
    bodyClassName,
    as: Component = 'section',
}: {
    children: ReactNode;
    title?: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    as?: 'section' | 'div';
}) {
    return (
        <Component className={cn('rounded-2xl border border-border bg-white shadow-soft', className)}>
            {title || actions ? (
                <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {title ? <h2 className="font-display text-base font-bold text-navy">{title}</h2> : null}
                        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
                    </div>
                    {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
                </div>
            ) : null}
            <div className={cn('p-5', bodyClassName)}>{children}</div>
        </Component>
    );
}
