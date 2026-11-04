import { HeroCatalog, PreviewFooter, PreviewNav, SectionList, previewStyle } from '@/components/preview/blocks';
import type { DesignBriefPreview } from '@/types';

export default function GridCatalogTemplate({ brief }: { brief: DesignBriefPreview }) {
    return (
        <div style={previewStyle(brief)} className="preview-root min-h-screen bg-white text-slate-900">
            <PreviewNav brief={brief} variant="catalog" />
            <HeroCatalog brief={brief} />
            <SectionList brief={brief} variant="catalog" />
            <PreviewFooter brief={brief} variant="catalog" />
        </div>
    );
}
