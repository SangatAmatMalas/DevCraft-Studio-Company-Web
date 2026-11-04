import { HeroEditorial, PreviewFooter, PreviewNav, SectionList, previewStyle } from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function EditorialSplitTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="preview-root min-h-screen bg-[#faf8f4] text-[#2b2620]">
            <PreviewNav brief={brief} variant="editorial" />
            <HeroEditorial brief={brief} />
            <SectionList brief={brief} variant="editorial" />
            <PreviewFooter brief={brief} variant="editorial" />
        </div>
    );
}
