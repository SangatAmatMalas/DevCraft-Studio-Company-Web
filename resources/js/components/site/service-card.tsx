import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import ServiceIcon from '@/components/site/service-icon';
import { cn } from '@/lib/utils';
import type { ServiceCard as ServiceCardType } from '@/types';

export default function ServiceCard({ service, className }: { service: ServiceCardType; className?: string }) {
    return (
        <article
            className={cn(
                'group flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card',
                className,
            )}
        >
            <ServiceIcon name={service.icon_name} />
            <h3 className="mt-4 font-display text-lg font-bold text-navy">
                <Link href={service.url} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {service.title}
                </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
            <span className="link-arrow mt-5">
                Pelajari layanan
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
        </article>
    );
}
