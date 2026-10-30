import {
    AppWindow,
    Building2,
    Globe,
    Layers,
    LayoutTemplate,
    LifeBuoy,
    Plug,
    ShieldCheck,
    Workflow,
    type LucideProps,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
    'layout-template': LayoutTemplate,
    'building-2': Building2,
    'app-window': AppWindow,
    plug: Plug,
    workflow: Workflow,
    'shield-check': ShieldCheck,
    'life-buoy': LifeBuoy,
    globe: Globe,
    layers: Layers,
};

export default function ServiceIcon({ name, className }: { name?: string | null; className?: string }) {
    const Icon = ICONS[name ?? 'layers'] ?? Layers;

    return (
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100', className)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
    );
}
