import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';

export default function DesignShareActions({
    url,
    title,
    metadata,
    compact = false,
}: {
    url: string;
    title: string;
    metadata: Record<string, string>;
    compact?: boolean;
}) {
    const { track } = useAnalytics();
    const [copied, setCopied] = useState(false);

    const record = (source: string) => track('design_shared', { metadata: { ...metadata, source } });

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.createElement('textarea');
            input.value = url;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }

        setCopied(true);
        record('copy_link');
        window.setTimeout(() => setCopied(false), 2000);
    };

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                record('native_share');
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
            }
        }

        await copy();
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size={compact ? 'sm' : 'default'} onClick={copy} className="rounded-lg">
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? 'Tautan disalin' : 'Salin tautan'}
            </Button>
            <Button type="button" variant="outline" size={compact ? 'sm' : 'default'} onClick={share} className="rounded-lg">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Bagikan
            </Button>
        </div>
    );
}
