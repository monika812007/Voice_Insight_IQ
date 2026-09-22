import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { resolveProductUrl } from '../services/api';

export const getOfficialStoreUrl = (productUrl, merchant = '', productName = '') => {
    const name = (productName || '').trim();
    const query = encodeURIComponent(name);
    const m = (merchant || '').toLowerCase().trim();

    // Check if productUrl is already a real valid external destination
    if (typeof productUrl === 'string' && productUrl.trim()) {
        const trimmed = productUrl.trim();
        try {
            const parsed = new URL(trimmed);
            if (['http:', 'https:'].includes(parsed.protocol) && !trimmed.includes('example.com') && !trimmed.includes('about:blank')) {
                return trimmed;
            }
        } catch {
            // Fallback to store query builder below
        }
    }

    // Official search/product URLs for each supported platform
    if (m.includes('amazon')) {
        return query ? `https://www.amazon.in/s?k=${query}` : 'https://www.amazon.in';
    }
    if (m.includes('flipkart')) {
        return query ? `https://www.flipkart.com/search?q=${query}` : 'https://www.flipkart.com';
    }
    if (m.includes('croma')) {
        return query ? `https://www.croma.com/searchB?q=${query}` : 'https://www.croma.com';
    }
    if (m.includes('reliance') || m.includes('digital')) {
        return query ? `https://www.reliancedigital.in/search?q=${query}` : 'https://www.reliancedigital.in';
    }
    if (m.includes('myntra')) {
        return query ? `https://www.myntra.com/${query}` : 'https://www.myntra.com';
    }
    if (m.includes('ajio')) {
        return query ? `https://www.ajio.com/search/?text=${query}` : 'https://www.ajio.com';
    }
    if (m.includes('tata') || m.includes('cliq')) {
        return query ? `https://www.tatacliq.com/search/?searchCategory=all&text=${query}` : 'https://www.tatacliq.com';
    }

    // Default to search on Google or Amazon for the merchant and product
    const searchQuery = encodeURIComponent(`${merchant} ${name}`.trim());
    return searchQuery ? `https://www.google.com/search?q=${searchQuery}` : 'https://www.amazon.in';
};

export const isValidProductUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;
    const trimmed = value.trim();
    if (trimmed.toLowerCase() === 'about:blank') return false;
    try {
        const parsed = new URL(trimmed);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

export const BuyNowLink = ({
    productUrl,
    providerProductToken,
    merchant,
    productName,
    className = '',
    children = 'BUY NOW'
}) => {
    const [loading, setLoading] = useState(false);
    const destinationUrl = getOfficialStoreUrl(productUrl, merchant, productName);

    const handleClick = async (event) => {
        // If there is a provider token that can be resolved into a deep link
        if (providerProductToken && merchant) {
            event.preventDefault();
            setLoading(true);
            try {
                const result = await resolveProductUrl(providerProductToken, merchant);
                const resolved = result?.product_url && isValidProductUrl(result.product_url)
                    ? result.product_url.trim()
                    : destinationUrl;
                window.open(resolved, '_blank', 'noopener,noreferrer');
            } catch {
                window.open(destinationUrl, '_blank', 'noopener,noreferrer');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={handleClick}
            title={`Open official store page for ${merchant || 'product'}`}
        >
            <span>{loading ? 'Opening...' : children}</span>
            <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 ml-1" />
        </a>
    );
};
