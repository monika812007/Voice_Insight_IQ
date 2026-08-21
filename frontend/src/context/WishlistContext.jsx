import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { addLikedProduct, getLikedProductIds, removeLikedProduct } from '../services/api';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'voice_iq_liked_product_ids';

const readIds = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [];
    } catch {
        return [];
    }
};

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [likedIds, setLikedIds] = useState(readIds);

    useEffect(() => {
        if (!user) return;
        getLikedProductIds().then(({ product_ids }) => setLikedIds(product_ids || [])).catch(() => { });
    }, [user]);

    const update = (nextIds) => {
        setLikedIds(nextIds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    };

    const toggleLiked = async (productId) => {
        if (!productId) return;
        const liked = likedIds.includes(productId);
        update(liked ? likedIds.filter((id) => id !== productId) : [...likedIds, productId]);
        if (user) {
            try {
                if (liked) await removeLikedProduct(productId);
                else await addLikedProduct(productId);
            } catch {
                update(likedIds);
            }
        }
    };

    return <WishlistContext.Provider value={{ likedIds, isLiked: (id) => likedIds.includes(id), toggleLiked }}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => useContext(WishlistContext);
