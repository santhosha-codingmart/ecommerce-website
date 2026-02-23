import React, { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, LayoutGrid } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { logout } from '../services/authService';

/**
 * Navbar Component
 * Search navigates to /all-products?q=<keyword> — shows in URL like Amazon/Flipkart.
 */
function Navbar() {
    const [searchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = keyword.trim();
        if (trimmed) {
            // Navigate with the query in the URL: /all-products?q=phones+under+5000
            navigate(`/all-products?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate('/all-products');
        }
    };

    const handleAllProducts = () => {
        setKeyword('');
        navigate('/all-products');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            gap: '1.5rem'
        }}>
            {/* LEFT — "All" button + Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <button
                    id="nav-all-products-btn"
                    onClick={handleAllProducts}
                    title="Browse all products"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 1rem',
                        backgroundColor: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        transition: 'background 0.2s',
                        flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6366f1'}
                >
                    <LayoutGrid size={16} />
                    All
                </button>

                <Link
                    to="/"
                    style={{ textDecoration: 'none', color: '#1e293b', fontSize: '1.3rem', fontWeight: '800', flexShrink: 0 }}
                >
                    🛒 ShopMart
                </Link>
            </div>

            {/* CENTER — Search Bar */}
            <form
                onSubmit={handleSearch}
                style={{ display: 'flex', flex: 1, maxWidth: '600px' }}
            >
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        id="nav-search-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '20px',
                            border: '1.5px solid #e2e8f0',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <Search
                        size={16}
                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                    />
                </div>
            </form>

            {/* RIGHT — Auth only (Cart removed) */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>
                {token ? (
                    <button
                        id="nav-logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                    >
                        <LogOut size={22} />
                    </button>
                ) : (
                    <Link to="/login" style={{ color: '#475569' }} title="Login">
                        <User size={22} />
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
