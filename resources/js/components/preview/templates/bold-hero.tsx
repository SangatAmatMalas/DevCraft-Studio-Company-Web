import {
    AboutBlock,
    ContactBlock,
    FaqBlock,
    GalleryBlock,
    HeroBold,
    PreviewFooter,
    PreviewNav,
    ServicesBold,
    previewStyle,
} from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function BoldHeroTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="min-h-screen bg-white font-sans text-slate-900">
            <PreviewNav brief={brief} variant="bold" />
            <HeroBold brief={brief} />
            {brief.sections.includes('services') ? <ServicesBold brief={brief} /> : null}
            {brief.sections.includes('about') ? <AboutBlock brief={brief} variant="bold" /> : null}
            {brief.sections.includes('gallery') ? <GalleryBlock brief={brief} variant="bold" /> : null}
            {brief.sections.includes('faq') ? <FaqBlock brief={brief} variant="bold" /> : null}
            {brief.sections.includes('contact') ? <ContactBlock brief={brief} variant="bold" /> : null}
            <PreviewFooter brief={brief} variant="bold" />
        </div>
    );
}
