import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { BuyNowLink } from './BuyNowLink';

const hasUsableProductImage = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !['image coming soon', 'image-coming-soon', 'image_coming_soon', 'placeholder', 'no-image'].some((marker) => normalized.includes(marker));
};

export const RelatedProductsGrid = ({
  products = [],
  onSelectProduct,
  title = "SIMILAR & MATCHING PRODUCTS",
  subtitle = "Products matching your search with live price comparison",
  className = "space-y-6"
}) => {
  const { isLiked, toggleLiked } = useWishlist();
  if (!products || products.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <span className="text-xs text-cyan-400 font-semibold px-2.5 py-1 bg-cyan-950/60 rounded-full border border-cyan-800/40">
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <article
            key={p.id}
            className="related-product-card group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {hasUsableProductImage(p.image_url) && (
                <button
                  type="button"
                  onClick={() => onSelectProduct && onSelectProduct(p.product_id || p.id)}
                  className="w-full h-44 bg-slate-950 rounded-xl overflow-hidden mb-3 p-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  aria-label={`View ${p.canonical_name || p.title}`}
                >
                  <img src={p.image_url} alt={p.canonical_name || p.title} className="h-full object-contain" />
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleLiked(p.id)}
                className="icon-button card-heart"
                aria-label={`${isLiked(p.id) ? 'Remove' : 'Add'} ${p.canonical_name || p.title} ${isLiked(p.id) ? 'from' : 'to'} liked products`}
              >
                <Heart className={isLiked(p.id) ? 'liked-heart' : ''} fill={isLiked(p.id) ? 'currentColor' : 'none'} size={17} />
              </button>

              {/* Brand & Category */}
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                {p.source || p.brand || 'Product'}{p.category ? ` • ${p.category}` : ''}
              </span>

              {/* Title */}
              <button
                type="button"
                onClick={() => onSelectProduct && onSelectProduct(p.product_id || p.id)}
                className="text-left text-sm font-bold text-white group-hover:text-cyan-400 line-clamp-2 transition-colors mb-2"
              >
                {p.canonical_name || p.title}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                {p.price != null && (
                  <strong className="block text-base font-extrabold text-white">
                    {p.currency || '₹'}{Number(p.price).toLocaleString('en-IN')}
                  </strong>
                )}
                {p.oldPrice > p.price && (
                  <span className="text-[11px] text-slate-500 line-through">
                    {p.currency || '₹'}{Number(p.oldPrice).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="block text-xs text-slate-400 mt-0.5">{p.source || p.store || 'Amazon'}</span>
              </div>
              <BuyNowLink
                productUrl={p.product_url}
                providerProductToken={p.providerProductToken || p.provider_product_token}
                merchant={p.source || p.store}
                productName={p.canonical_name || p.title}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold rounded-lg border border-cyan-500/20 transition shrink-0"
              >
                Buy Now
              </BuyNowLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
