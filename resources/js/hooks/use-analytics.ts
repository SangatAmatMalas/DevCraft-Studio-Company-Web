import { usePage } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';

import type { SharedProps } from '@/types';

type AnalyticsPayload = {
    entity_type?: string;
    entity_id?: number;
    metadata?: Record<string, string | number>;
};

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export function useAnalytics() {
    const { url, props } = usePage<SharedProps>();
    const provider = props.analytics?.provider ?? 'internal';

    const track = useCallback(
        (event: string, payload: AnalyticsPayload = {}) => {
            if (typeof window === 'undefined') {
                return;
            }

            const body = JSON.stringify({
                event,
                page_path: url,
                entity_type: payload.entity_type,
                entity_id: payload.entity_id,
                metadata: payload.metadata,
            });

            if (provider === 'internal') {
                void fetch('/analytics/event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        Accept: 'application/json',
                    },
                    body,
                    keepalive: true,
                }).catch(() => undefined);

                return;
            }

            const measurementId = props.analytics?.measurement_id;

            if (provider === 'ga4' && measurementId && typeof window.gtag === 'function') {
                window.gtag('event', event, payload.metadata ?? {});
            }
        },
        [provider, props.analytics?.measurement_id, url],
    );

    return { track };
}

export function usePageViewTracking() {
    const { url } = usePage();
    const { track } = useAnalytics();

    useEffect(() => {
        track('page_view', { metadata: { source: 'spa' } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);
}

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}
