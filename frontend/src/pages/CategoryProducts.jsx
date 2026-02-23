import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getProductsByCategory } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

/**
 * Category Products page.
 */
function CategoryProducts() {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryName = searchParams.get('name') || location.state?.categoryName || 'Category';
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10) - 1;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (!searchParams.get('page')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('page', '1');
            setSearchParams(nextParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getProductsByCategory(categoryId, pageFromUrl, 10);
                setProducts(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } catch (err) {
                setError('Failed to load products. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
        window.scrollTo(0, 0);
    }, [categoryId, pageFromUrl]);

    const handlePageChange = (newPage) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', (newPage + 1).toString());
        setSearchParams(nextParams);
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                <span
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer', color: '#6366f1', fontWeight: '600' }}
                >
                    Categories
                </span>
                <span>›</span>
                <span style={{ color: '#1e293b', fontWeight: '700' }}>{categoryName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>{categoryName}</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2em', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading products...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}><p>{error}</p></div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <div style={{ fontSize: '3em', marginBottom: '1rem' }}>📦</div>
                    <p>No products found in this category.</p>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2.5rem'
                    }}>
                        {products.map(product => (
                            <ProductCard key={product.productId} product={product} />
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

export default CategoryProducts;
