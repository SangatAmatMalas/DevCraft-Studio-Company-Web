import { cn } from '@/lib/utils';
import type { ProjectCard } from '@/types';

const GRADIENTS = [
    'from-brand-600 via-brand-700 to-navy',
    'from-sky-500 via-brand-600 to-brand-800',
    'from-indigo-500 via-brand-600 to-navy',
    'from-cyan-500 via-brand-600 to-brand-900',
];

function gradientFor(slug: string): string {
    const sum = Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0);

    return GRADIENTS[sum % GRADIENTS.length];
}

export default function ProjectVisual({
    project,
    className,
    size = 'card',
}: {
    project: Pick<ProjectCard, 'slug' | 'title' | 'type_label' | 'cover_url'>;
    className?: string;
    size?: 'card' | 'hero';
}) {
    if (project.cover_url) {
        return (
            <img
                src={project.cover_url}
                alt={`Visual proyek ${project.title}`}
                loading="lazy"
                className={cn('h-full w-full object-cover', className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br p-5',
                gradientFor(project.slug),
                size === 'hero' ? 'min-h-[16rem] p-8' : 'min-h-[11rem]',
                className,
            )}
            role="img"
            aria-label={`Belum ada gambar untuk ${project.title}`}
        >
            <div className="grid-lines absolute inset-0" aria-hidden="true" />
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="relative">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">{project.type_label}</p>
                <p className={cn('mt-1 font-display font-bold text-white', size === 'hero' ? 'text-2xl' : 'text-lg')}>{project.title}</p>
            </div>
        </div>
    );
}
