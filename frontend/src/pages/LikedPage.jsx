import React, { useEffect, useState } from 'react';
import { Heart, ArrowRight, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getProductComparison } from '../services/api';

const formatPrice = (value) => value == null ? null : `₹${Number(value).toLocaleString('en-IN')}`;

export const LikedPage = () => {
    const navigate = useNavigate();
    const { likedIds, toggleLiked } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all(likedIds.map(async (id) => {
            try {
                const comparison = await getProductComparison(id);
                return { ...comparison.product, bestOption: comparison.best_option };
            } catch {
                return null;
            }
        })).then((items) => {
            if (active) setProducts(items.filter(Boolean));
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [likedIds]);

    return (
        <div className="page-shell">
            <div className="section-heading">
                <div><p className="eyebrow">Saved for later</p><h1>LIKED PRODUCTS</h1><p>Products you've saved for later.</p></div>
                <span className="result-count">{likedIds.length} {likedIds.length === 1 ? 'product' : 'products'} saved</span>
            </div>
            {loading && likedIds.length > 0 ? <div className="product-grid">{likedIds.map((id) => <div className="product-card skeleton-card" key={id} />)}</div> : products.length === 0 ? (
                <div className="empty-panel"><Heart className="empty-icon" /><h2>NO LIKED PRODUCTS YET</h2><p>Save products you love and easily find them here later.</p><button type="button" className="primary-button" onClick={() => navigate('/search?q=&type=text')}>Explore Products</button></div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => {
                        const listing = product.bestOption;
                        const current = listing?.offer_price ?? listing?.price;
                        const original = listing?.original_price;
                        return <article className="product-card" key={product.id}>
                            <button type="button" className="product-image-button" onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`)} aria-label={`View ${product.canonical_name}`}><img src={product.image_url} alt={product.canonical_name} /></button>
                            <div className="product-card-body"><div className="store-label">{listing?.platform_name || 'Store'}</div><button type="button" className="product-title" onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`)}>{product.canonical_name}</button>
                                <div className="rating-line"><Star className="rating-star" /> {listing?.rating ?? 'N/A'} <span>({(listing?.review_count || 0).toLocaleString()})</span></div>
                                <div className="price-line"><strong>{formatPrice(current)}</strong>{original > current && <><del>{formatPrice(original)}</del><span className="save-badge">SAVE {formatPrice(original - current)}</span></>}</div>
                                <div className="card-actions"><button type="button" className="secondary-button" onClick={() => navigate(`/product/${encodeURIComponent(product.id)}`)}>View Product <ArrowRight size={15} /></button><button type="button" className="icon-button danger-hover" onClick={() => toggleLiked(product.id)} aria-label={`Remove ${product.canonical_name} from liked products`}><Trash2 size={16} /></button></div>
                            </div>
                        </article>;
                    })}
                </div>
            )}
        </div>
    );
};
