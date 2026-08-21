import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { resolveProductUrl } from '../services/api';

export const isValidProductUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;
    const trimmed = value.trim();
    if (trimmed.toLowerCase() === 'about:blank') return false;
    try {
        const parsed = new URL(trimmed);
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;
        const hostname = parsed.hostname.toLowerCase();
        if (hostname === 'google.com' || hostname.endsWith('.google.com') || hostname.startsWith('google.') || hostname.startsWith('www.google.')) return false;
        if (!parsed.pathname || parsed.pathname === '/') return false;
        return true;
    } catch {
        return false;
    }
};

export const BuyNowLink = ({ productUrl, providerProductToken, merchant, className = '', children = 'BUY NOW' }) => {
    const [loading, setLoading] = useState(false);
    const [unavailable, setUnavailable] = useState(false);
    const validProductUrl = isValidProductUrl(productUrl) ? productUrl.trim() : null;
    const canResolveProductUrl = Boolean(providerProductToken && merchant);

    const handleClick = async (event) => {
        if (validProductUrl && !canResolveProductUrl) return;
        event.preventDefault();
        if (!canResolveProductUrl || loading || unavailable) return;

        setLoading(true);
        try {
            const result = await resolveProductUrl(providerProductToken, merchant);
            if (isValidProductUrl(result.product_url)) {
                window.location.assign(result.product_url.trim());
            } else {
                setUnavailable(true);
            }
        } catch {
            setUnavailable(true);
        } finally {
            setLoading(false);
        }
    };

    if (unavailable || (!validProductUrl && !canResolveProductUrl)) {
        return <span className="text-xs text-slate-500">Product page unavailable</span>;
    }

    if (canResolveProductUrl) {
        return (
            <button type="button" className={className} onClick={handleClick} disabled={loading}>
                <span>{loading ? 'Opening product page...' : children}</span>
            </button>
        );
    }

    return (
        <a
            href={validProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={handleClick}
            aria-disabled={loading}
        >
            <span>{loading ? 'Opening product page...' : children}</span>
            <ExternalLink className="w-3.5 h-3.5" />
        </a>
    );
};
