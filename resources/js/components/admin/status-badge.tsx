import { cn } from '@/lib/utils';

const TONES = {
    published: 'bg-success/10 text-success ring-success/20',
    success: 'bg-success/10 text-success ring-success/20',
    draft: 'bg-slate-100 text-slate-600 ring-slate-200',
    muted: 'bg-slate-100 text-slate-500 ring-slate-200',
    archived: 'bg-slate-100 text-slate-500 ring-slate-200',
    info: 'bg-brand-50 text-brand-700 ring-brand-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
} as const;

const STATUS_TO_TONE: Record<string, keyof typeof TONES> = {
    published: 'published',
    draft: 'draft',
    archived: 'archived',
    new: 'info',
    contacted: 'neutral',
    qualified: 'success',
    proposal_sent: 'warning',
    won: 'success',
    lost: 'danger',
};

export default function StatusBadge({
    value,
    label,
    tone,
    className,
}: {
    value?: string | null;
    label: string;
    tone?: keyof typeof TONES | string;
    className?: string;
}) {
    const resolved = (tone as keyof typeof TONES) ?? STATUS_TO_TONE[value ?? ''] ?? 'neutral';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset',
                TONES[resolved] ?? TONES.neutral,
                className,
            )}
        >
            {label}
        </span>
    );
}
