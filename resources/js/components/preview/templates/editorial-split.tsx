import {
    AboutBlock,
    ContactBlock,
    FaqBlock,
    GalleryBlock,
    HeroEditorial,
    PreviewFooter,
    PreviewNav,
    ServicesEditorial,
    previewStyle,
} from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function EditorialSplitTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="min-h-screen bg-[#faf8f4] font-sans text-[#2b2620]">
            <PreviewNav brief={brief} variant="editorial" />
            <HeroEditorial brief={brief} />
            {brief.sections.includes('services') ? <ServicesEditorial brief={brief} /> : null}
            {brief.sections.includes('about') ? <AboutBlock brief={brief} variant="editorial" /> : null}
            {brief.sections.includes('gallery') ? <GalleryBlock brief={brief} variant="editorial" /> : null}
            {brief.sections.includes('faq') ? <FaqBlock brief={brief} variant="editorial" /> : null}
            {brief.sections.includes('contact') ? <ContactBlock brief={brief} variant="editorial" /> : null}
            <PreviewFooter brief={brief} variant="editorial" />
        </div>
    );
}
