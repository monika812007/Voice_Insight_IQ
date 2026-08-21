import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { BuyNowLink } from './BuyNowLink';

const hasUsableProductImage = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !['image coming soon', 'image-coming-soon', 'image_coming_soon', 'placeholder', 'no-image'].some((marker) => normalized.includes(marker));
};

export const RelatedProductsGrid = ({ products = [], onSelectProduct }) => {
  const { isLiked, toggleLiked } = useWishlist();
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">YOU MAY ALSO LIKE</h3>
          <p className="text-xs text-slate-400">Related products matching brand, specs, or category</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <article
            key={p.id}
            className="related-product-card group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {hasUsableProductImage(p.image_url) && (
                <button type="button" onClick={() => onSelectProduct && onSelectProduct(p.product_id || p.id)} className="w-full h-40 bg-slate-950 rounded-xl overflow-hidden mb-3 p-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300" aria-label={`View ${p.canonical_name}`}>
                  <img src={p.image_url} alt={p.canonical_name} className="h-full object-contain" />
                </button>
              )}
              <button type="button" onClick={() => toggleLiked(p.id)} className="icon-button card-heart" aria-label={`${isLiked(p.id) ? 'Remove' : 'Add'} ${p.canonical_name} ${isLiked(p.id) ? 'from' : 'to'} liked products`}>
                <Heart className={isLiked(p.id) ? 'liked-heart' : ''} fill={isLiked(p.id) ? 'currentColor' : 'none'} size={17} />
              </button>

              {/* Brand & Category */}
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                {p.source || p.brand || 'Product'}{p.category ? ` • ${p.category}` : ''}
              </span>

              {/* Title */}
              <button type="button" onClick={() => onSelectProduct && onSelectProduct(p.product_id || p.id)} className="text-left text-sm font-bold text-white group-hover:text-cyan-400 line-clamp-2 transition-colors mb-2">
                {p.canonical_name}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                {p.price != null && <strong className="block text-sm text-white">{p.currency || '₹'}{Number(p.price).toLocaleString('en-IN')}</strong>}
                <span className="text-xs text-slate-400">{p.source || 'Compare Listings'}</span>
                <span className="block text-xs text-slate-400">Rating: {p.rating != null ? p.rating : 'Not available'} · Reviews: {(p.review_count ?? p.reviews) != null ? Number(p.review_count ?? p.reviews).toLocaleString('en-IN') : 'Not available'}</span>
                <span className="block text-xs text-slate-500">{p.availability || 'Not available'}</span>
              </div>
              <BuyNowLink
                productUrl={p.product_url}
                providerProductToken={p.providerProductToken || p.provider_product_token}
                merchant={p.source}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                Buy Now
              </BuyNowLink>
              <button type="button" onClick={() => onSelectProduct && onSelectProduct(p.product_id || p.id)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 flex items-center justify-center transition" aria-label={`Compare ${p.canonical_name}`}>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
