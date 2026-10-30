import type { ReactNode } from 'react';

export default function EmptyState({
    title,
    description,
    action,
    icon,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-ice px-6 py-14 text-center">
            {icon ? <div className="mx-auto mb-4 flex justify-center text-brand-500">{icon}</div> : null}
            <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
            {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        </div>
    );
}
