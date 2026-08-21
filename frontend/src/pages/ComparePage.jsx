import React from 'react';
import { GitCompareArrows } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComparePage = () => {
    const navigate = useNavigate();
    return <div className="page-shell"><div className="empty-panel"><GitCompareArrows className="empty-icon" /><h1>NO PRODUCTS TO COMPARE</h1><p>Select products from Explore to compare them.</p><button type="button" className="primary-button" onClick={() => navigate('/search?q=&type=text')}>Explore Products</button></div></div>;
};
