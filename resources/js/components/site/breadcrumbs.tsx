import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
    return (
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                        {index > 0 ? <ChevronRight className="h-3 w-3" aria-hidden="true" /> : null}
                        {item.href ? (
                            <Link href={item.href} className="transition-colors hover:text-brand-700">
                                {item.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="font-medium text-ink">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
