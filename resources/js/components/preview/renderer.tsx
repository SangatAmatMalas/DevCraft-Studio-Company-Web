import BoldHeroTemplate from '@/components/preview/templates/bold-hero';
import EditorialSplitTemplate from '@/components/preview/templates/editorial-split';
import GridCatalogTemplate from '@/components/preview/templates/grid-catalog';
import type { DesignBriefPreview } from '@/types';

const TEMPLATES = {
    'bold-hero': BoldHeroTemplate,
    'editorial-split': EditorialSplitTemplate,
    'grid-catalog': GridCatalogTemplate,
} as const;

export default function PreviewRenderer({ brief, template }: { brief: DesignBriefPreview; template: string }) {
    const Template = TEMPLATES[template as keyof typeof TEMPLATES] ?? BoldHeroTemplate;

    return <Template brief={brief} />;
}
