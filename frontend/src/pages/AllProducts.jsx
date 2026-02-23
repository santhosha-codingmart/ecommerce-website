import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts, searchProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

/**
 * All Products page.
 */
function AllProducts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchKeyword = searchParams.get('q') || ''; // read keyword from URL
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10) - 1; // 1-based to 0-based

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const isSearchMode = searchKeyword.trim().length > 0;

    useEffect(() => {
        if (!searchParams.get('page')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('page', '1');
            setSearchParams(nextParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const data = isSearchMode
                    ? await searchProducts(searchKeyword, pageFromUrl, 10)
                    : await getAllProducts(pageFromUrl, 10);

                // Handle both Spring Data Page object or a direct Array
                if (data && data.content) {
                    setProducts(data.content);
                    setTotalPages(data.totalPages || 0);
                    setTotalElements(data.totalElements || 0);
                } else if (Array.isArray(data)) {
                    setProducts(data);
                    setTotalPages(1);
                    setTotalElements(data.length);
                } else {
                    setProducts([]);
                    setTotalPages(0);
                    setTotalElements(0);
                }
            } catch (err) {
                setError('Failed to load products. Please try again.');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Scroll to top when page/search changes
        window.scrollTo(0, 0);
    }, [searchKeyword, pageFromUrl]);

    const handlePageChange = (newPage) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', (newPage + 1).toString());
        setSearchParams(nextParams);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>
                    {isSearchMode ? (
                        <>Results for <span style={{ color: '#6366f1' }}>"{searchKeyword}"</span></>
                    ) : 'All Products'}
                </h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2em', marginBottom: '1rem' }}>⏳</div>
                    <p>{isSearchMode ? 'Searching...' : 'Loading products...'}</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}><p>{error}</p></div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <div style={{ fontSize: '3em', marginBottom: '1rem' }}>🔍</div>
                    <p>No products found{isSearchMode ? ` for "${searchKeyword}"` : ''}.</p>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2.5rem'
                    }}>
                        {Array.isArray(products) && products.map(product => (
                            <ProductCard key={product.productId || product.id} product={product} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={pageFromUrl}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}

export default AllProducts;
