import {
    AboutBlock,
    ContactBlock,
    FaqBlock,
    GalleryBlock,
    HeroCatalog,
    PreviewFooter,
    PreviewNav,
    ServicesCatalog,
    previewStyle,
} from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function GridCatalogTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="min-h-screen bg-white font-sans text-slate-900">
            <PreviewNav brief={brief} variant="catalog" />
            <HeroCatalog brief={brief} />
            {brief.sections.includes('services') ? <ServicesCatalog brief={brief} /> : null}
            {brief.sections.includes('about') ? <AboutBlock brief={brief} variant="catalog" /> : null}
            {brief.sections.includes('gallery') ? <GalleryBlock brief={brief} variant="catalog" /> : null}
            {brief.sections.includes('faq') ? <FaqBlock brief={brief} variant="catalog" /> : null}
            {brief.sections.includes('contact') ? <ContactBlock brief={brief} variant="catalog" /> : null}
            <PreviewFooter brief={brief} variant="catalog" />
        </div>
    );
}
