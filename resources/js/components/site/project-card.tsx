import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import ProjectVisual from '@/components/site/project-visual';
import { cn } from '@/lib/utils';
import type { ProjectCard as ProjectCardType } from '@/types';

export default function ProjectCard({ project, className }: { project: ProjectCardType; className?: string }) {
    return (
        <article
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-shadow hover:shadow-card',
                className,
            )}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-navy">
                <ProjectVisual project={project} />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-navy shadow-sm">
                    {project.type_label}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {project.categories.map((category) => (
                        <span key={category.slug}>{category.name}</span>
                    ))}
                    {project.categories.length > 0 ? <span aria-hidden="true">•</span> : null}
                    <span>{project.status_label}</span>
                </div>

                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy">
                    <Link href={project.url} className="transition-colors hover:text-brand-700">
                        {project.title}
                    </Link>
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{project.excerpt}</p>

                {project.technologies.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 4).map((technology) => (
                            <li
                                key={technology.slug}
                                className="rounded-md border border-border bg-ice px-2 py-0.5 text-[0.7rem] font-medium text-slate-600"
                            >
                                {technology.name}
                            </li>
                        ))}
                    </ul>
                ) : null}

                <Link href={project.url} className="link-arrow mt-5 pt-1">
                    Lihat studi kasus
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}
