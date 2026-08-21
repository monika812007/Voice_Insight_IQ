import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { getProductComparison, recordViewedProduct } from '../services/api';
import { ComparisonTable } from '../components/ComparisonTable';
import { BuyNowLink } from '../components/BuyNowLink';
import { PriceHistoryGraph } from '../components/PriceHistoryGraph';
import { RelatedProductsGrid } from '../components/RelatedProductsGrid';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/LoadingSkeleton';
import { useWishlist } from '../context/WishlistContext';

const ProductDetailsSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-5 w-32 rounded bg-slate-800" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
            <div className="h-[28rem] rounded-3xl border border-slate-800 bg-slate-900" />
            <div className="space-y-5">
                <div className="h-5 w-28 rounded bg-slate-800" />
                <div className="h-12 w-4/5 rounded bg-slate-800" />
                <div className="h-8 w-1/3 rounded bg-slate-800" />
                <div className="h-24 rounded-2xl bg-slate-900" />
                <div className="h-12 rounded-xl bg-slate-800" />
            </div>
        </div>
    </div>
);

export const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isLiked, toggleLiked } = useWishlist();
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priority, setPriority] = useState('balanced');

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError(null);
        setComparison(null);
        try {
            const data = await getProductComparison(productId, priority);
            setComparison(data);
            recordViewedProduct(productId).catch(() => { });
        } catch (requestError) {
            if (requestError.response?.status === 404) {
                setError('not-found');
            } else {
                setError(requestError.message || 'Unable to retrieve real product data.');
            }
        } finally {
            setLoading(false);
        }
    }, [productId, priority]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (loading) return <ProductDetailsSkeleton />;

    if (error === 'not-found') {
        return (
            <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
                <EmptyState title="PRODUCT NOT FOUND" message="We couldn't find this product." />
                <div className="flex justify-center gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:border-cyan-500 transition">Back to Search</button>
                    <button type="button" onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition">Explore Products</button>
                </div>
            </div>
        );
    }

    if (error || !comparison?.product) {
        return <ErrorState message={error || 'Unable to retrieve real product data.'} onRetry={fetchProduct} />;
    }

    const { product, best_option: bestOption, listings = [], review_analysis: reviewAnalysis, price_history: priceHistory, related_products: relatedProducts = [] } = comparison;
    const currentPrice = bestOption?.offer_price ?? bestOption?.price ?? null;
    const savings = bestOption?.savings || 0;
    const descriptionText = product.description || 'The connected shopping source did not provide a description for this listing.';
    const publicSpecs = Object.entries(product.specs || {}).filter(([key]) => !key.startsWith('_'));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] items-start">
                <div className="relative min-h-[28rem] rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/[0.03]" />
                    <img src={product.image_url} alt={product.canonical_name} className="relative max-h-[25rem] max-w-full object-contain transition-transform duration-500 hover:scale-105" />
                    <button type="button" onClick={() => toggleLiked(product.id)} aria-label={isLiked(product.id) ? 'Remove product from liked products' : 'Add product to liked products'} className="absolute right-5 top-5 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-slate-300 hover:text-rose-400 hover:border-rose-400/50 transition">
                        <Heart className="w-5 h-5" fill={isLiked(product.id) ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">{product.category}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Live product data</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{product.brand}</p>
                        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{product.canonical_name || 'Product name unavailable'}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-sm font-bold text-amber-300"><Star className="h-4 w-4 fill-amber-300" /> {bestOption?.rating ?? 'Rating unavailable'}</span>
                        <span className="text-sm text-slate-400">{bestOption?.review_count != null ? `${Number(bestOption.review_count).toLocaleString()} reviews` : 'Reviews unavailable'}</span>
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-400"><ShieldCheck className="h-4 w-4" /> Available</span>
                    </div>
                    <div className="flex items-baseline gap-3 border-y border-slate-800 py-5">
                        <span className="text-4xl font-black text-white">{currentPrice != null ? `₹${Number(currentPrice).toLocaleString('en-IN')}` : 'Price unavailable'}</span>
                        {bestOption?.original_price > currentPrice && <span className="text-lg text-slate-500 line-through">₹{bestOption.original_price.toLocaleString('en-IN')}</span>}
                        {savings > 0 && <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">SAVE ₹{savings.toLocaleString('en-IN')}</span>}
                    </div>
                    <p className="max-w-full break-words text-sm leading-7 text-slate-300">{descriptionText}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => toggleLiked(product.id)} className="secondary-button"><Heart size={16} fill={isLiked(product.id) ? 'currentColor' : 'none'} /> {isLiked(product.id) ? 'Liked' : 'Add to Liked'}</button>
                        <BuyNowLink
                            productUrl={bestOption?.product_url}
                            providerProductToken={bestOption?.provider_product_token}
                            merchant={bestOption?.platform_name}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3.5 font-bold text-slate-950 hover:brightness-110 transition"
                        >
                            Buy Now
                        </BuyNowLink>
                        <a href="#comparison" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition">Compare Stores <ArrowRight className="h-4 w-4" /></a>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-slate-900 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-cyan-300"><Sparkles className="h-5 w-5" /><h2 className="text-lg font-bold">AI RECOMMENDATION</h2></div>
                <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div><p className="text-2xl font-black text-white">{bestOption?.recommendation_type || 'BEST VALUE'}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{bestOption?.explanation}</p></div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 px-5 py-4 text-center"><span className="block text-xs uppercase tracking-widest text-slate-500">Confidence</span><strong className="text-3xl text-cyan-300">{bestOption?.score ?? 'N/A'}{bestOption?.score != null && '/100'}</strong></div>
                </div>
            </section>

            <section id="comparison" className="space-y-4"><div><h2 className="text-2xl font-bold text-white">Price Comparison</h2><p className="text-sm text-slate-400">Compare live listings across supported stores.</p></div><ComparisonTable listings={listings} /></section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="details-info-panel min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"><h2 className="text-xl font-bold text-white">Specifications</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{publicSpecs.length ? publicSpecs.map(([key, value]) => <div key={key} className="details-spec-item min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3"><span className="block text-xs uppercase tracking-wider text-slate-500">{key.replaceAll('_', ' ')}</span><strong className="mt-1 block break-words text-sm text-slate-200">{String(value)}</strong></div>) : <p className="text-sm text-slate-400">No additional specifications were provided by the source.</p>}</div></div>
                <div className="details-info-panel min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"><h2 className="text-xl font-bold text-white">Description</h2><p className="mt-5 max-w-full break-words text-sm leading-7 text-slate-300">{descriptionText}</p></div>
            </section>

            <PriceHistoryGraph priceHistory={priceHistory} lowestPrice={comparison.lowest_observed_price} highestPrice={comparison.highest_observed_price} />
            <RelatedProductsGrid products={relatedProducts} onSelectProduct={(id) => navigate(`/product/${encodeURIComponent(id)}`)} />
        </div>
    );
};
