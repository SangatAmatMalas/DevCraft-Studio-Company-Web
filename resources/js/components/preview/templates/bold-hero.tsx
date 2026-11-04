import { HeroBold, PreviewFooter, PreviewNav, SectionList, previewStyle } from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function BoldHeroTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="preview-root min-h-screen bg-white text-slate-900">
            <PreviewNav brief={brief} variant="bold" />
            <HeroBold brief={brief} />
            <SectionList brief={brief} variant="bold" />
            <PreviewFooter brief={brief} variant="bold" />
        </div>
    );
}
