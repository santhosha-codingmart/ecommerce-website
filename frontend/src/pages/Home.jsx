import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCategories } from '../services/productService';

/**
 * Home page: shows paginated categories (5 per page).
 * Clicking a category navigates to its products page.
 */
function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10) - 1; // 1-based to 0-based

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();

    // Ensure URL always shows ?page=1 if missing
    useEffect(() => {
        if (!searchParams.get('page')) {
            setSearchParams({ page: '1' }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getCategories(pageFromUrl, 5);
                setCategories(data.content);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError('Failed to load categories. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [pageFromUrl]);

    const handlePageChange = (newPage) => {
        setSearchParams({ page: (newPage + 1).toString() });
    };

    const categoryColors = [
        '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
        '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
    ];

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2em', marginBottom: '1rem' }}>⏳</div>
            <p>Loading categories...</p>
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
            <p>{error}</p>
        </div>
    );

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', color: '#1e293b' }}>
                Shop by Category
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Choose a category to explore products
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {categories.map((cat, idx) => (
                    <div
                        key={cat.categoryId}
                        onClick={() => navigate(`/category/${cat.categoryId}?name=${encodeURIComponent(cat.categoryName)}`)}
                        style={{
                            background: `linear-gradient(135deg, ${categoryColors[idx % categoryColors.length]}, ${categoryColors[(idx + 2) % categoryColors.length]})`,
                            borderRadius: '16px',
                            padding: '2rem',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                    >
                        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
                            {cat.categoryName}
                        </h3>
                        {cat.categoryDescription && (
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {cat.categoryDescription}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => handlePageChange(Math.max(0, pageFromUrl - 1))}
                        disabled={pageFromUrl === 0}
                        style={{
                            padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: pageFromUrl === 0 ? '#f1f5f9' : '#fff', cursor: pageFromUrl === 0 ? 'not-allowed' : 'pointer',
                            color: pageFromUrl === 0 ? '#94a3b8' : '#1e293b', fontWeight: '600'
                        }}
                    >← Prev</button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: i === pageFromUrl ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                background: i === pageFromUrl ? '#6366f1' : '#fff',
                                color: i === pageFromUrl ? '#fff' : '#1e293b',
                                fontWeight: '600', cursor: 'pointer'
                            }}
                        >{i + 1}</button>
                    ))}

                    <button
                        onClick={() => handlePageChange(Math.min(totalPages - 1, pageFromUrl + 1))}
                        disabled={pageFromUrl === totalPages - 1}
                        style={{
                            padding: '0.5rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                            background: pageFromUrl === totalPages - 1 ? '#f1f5f9' : '#fff',
                            cursor: pageFromUrl === totalPages - 1 ? 'not-allowed' : 'pointer',
                            color: pageFromUrl === totalPages - 1 ? '#94a3b8' : '#1e293b', fontWeight: '600'
                        }}
                    >Next →</button>
                </div>
            )}
        </div>
    );
}

export default Home;
